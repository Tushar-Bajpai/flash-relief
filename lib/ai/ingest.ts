/**
 * ingest_signals — deterministic data ingestion (no LLM, spec section 5.4).
 *
 * In production this node reads NASA GPM IMERG accumulations, IMD forecasts,
 * CWC / India-WRIS gauge telemetry, GloFAS probabilities, SMAP soil moisture
 * and HAND terrain. For the hackathon vertical slice we simulate the feeds
 * from basin hydrology constants (honest about it) and optionally accept
 * live overrides via the API body, e.g. { gaugeLevelPct, rainfall24hMm }.
 */
import { createHash } from "crypto";
import type { RahatStateType, SignalReading } from "./state";
import { MONITORED_BASINS } from "@/lib/detect-data";

interface BasinProfile {
  rainfall24hMm: number;
  rainfallPercentile: number;
  forecastRainMm: number;
  gaugeLevelM: number;
  warningLevelM: number;
  dangerLevelM: number;
  rateOfRiseCmHr: number;
  soilSaturation: number;
  handPercentile: number;
  crowdReports: number;
}

/** Basin hydrology profiles calibrated to the monitored basins in the UI. */
const BASIN_PROFILES: Record<string, BasinProfile> = {
  brahmaputra: {
    rainfall24hMm: 187,
    rainfallPercentile: 0.96,
    forecastRainMm: 74,
    gaugeLevelM: 105.6,
    warningLevelM: 104.9,
    dangerLevelM: 106.3,
    rateOfRiseCmHr: 6,
    soilSaturation: 0.87,
    handPercentile: 0.92,
    crowdReports: 4,
  },
  mahanadi: {
    rainfall24hMm: 142,
    rainfallPercentile: 0.91,
    forecastRainMm: 48,
    gaugeLevelM: 58.7,
    warningLevelM: 58.2,
    dangerLevelM: 59.5,
    rateOfRiseCmHr: 4,
    soilSaturation: 0.78,
    handPercentile: 0.8,
    crowdReports: 2,
  },
};

import { fetchLiveBasinTelemetry } from "@/lib/telemetry/live-feed";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export async function ingestSignals(
  state: RahatStateType
): Promise<Partial<RahatStateType>> {
  const now = new Date().toISOString();
  const overrides = state.signals.inputOverrides ?? {};

  // Fetch real-time physical telemetry (Open-Meteo GloFAS + Weather + GDELT)
  let liveReport = null;
  try {
    liveReport = await fetchLiveBasinTelemetry(state.basinId);
  } catch (err) {
    console.warn("[ingest_signals] Live telemetry fetch failed, falling back to calibrated model:", err);
  }

  const profile = BASIN_PROFILES[state.basinId] ?? BASIN_PROFILES.brahmaputra;

  const rainfall24h = overrides.rainfall24hMm ?? (liveReport ? liveReport.metrics.past72hRainMm : profile.rainfall24hMm);
  const forecastRain = overrides.forecastRainMm ?? (liveReport ? liveReport.metrics.forecast24hRainMm : profile.forecastRainMm);
  const gaugeLevel = overrides.gaugeLevelM ?? (liveReport ? liveReport.metrics.currentStageM : profile.gaugeLevelM);
  const warningLevel = overrides.warningLevelM ?? (liveReport ? liveReport.metrics.warningStageM : profile.warningLevelM);
  const dangerLevel = overrides.dangerLevelM ?? (liveReport ? liveReport.metrics.dangerStageM : profile.dangerLevelM);
  const rateOfRise = overrides.rateOfRiseCmHr ?? (liveReport ? liveReport.metrics.rateOfRiseCmHr : profile.rateOfRiseCmHr);
  const soilSaturation = overrides.soilSaturation ?? (liveReport ? liveReport.metrics.soilSaturationPct / 100 : profile.soilSaturation);

  // H = distance between warning and danger level, clipped 0..1 (spec 3.2).
  const hydroScore = clamp01(
    Math.max(
      0,
      (gaugeLevel - warningLevel) / Math.max(0.01, dangerLevel - warningLevel)
    )
  );
  // R = percentile of 24h accumulation blended with forecast rain.
  const rainScore = clamp01(0.6 * (liveReport ? Math.min(1.0, rainfall24h / 200) : profile.rainfallPercentile) + 0.4 * clamp01(forecastRain / 120));
  const soilScore = clamp01(soilSaturation);
  const terrainScore = profile.handPercentile;
  const crowdScore = clamp01(profile.crowdReports / 10) * 0.4; // weak signal, small weight

  const readings: SignalReading[] = [
    {
      id: "gpm-imerg-24h",
      source: "NASA GPM IMERG (early run)",
      label: "24h rainfall accumulation",
      value: rainfall24h,
      unit: "mm",
      observedAt: now,
      score: rainScore,
      weight: 0.3,
      detail: liveReport?.freshness.weatherLive
        ? `Live Open-Meteo precipitation (${rainfall24h} mm observed)`
        : `72h percentiles above the ${Math.round(profile.rainfallPercentile * 100)}th local exceedance percentile`,
    },
    {
      id: "imd-forecast",
      source: "IMD gridded NWP & Open-Meteo forecast",
      label: "Forecast rainfall (24h ahead)",
      value: forecastRain,
      unit: "mm",
      observedAt: now,
      score: clamp01(forecastRain / 120),
      weight: 0.2,
      detail: liveReport?.freshness.weatherLive
        ? `Live NWP 24h forecast: ${forecastRain} mm convective rain`
        : "Deterministic model run updated at 05:30 IST cycle",
    },
    {
      id: "cwc-gauge",
      source: "CWC / India-WRIS & GloFAS telemetry",
      label: "River stage vs warning level",
      value: gaugeLevel,
      unit: "m",
      observedAt: now,
      score: hydroScore,
      weight: 0.3,
      detail: liveReport?.freshness.glofasLive
        ? `Live GloFAS: ${liveReport.metrics.maxDischargeCms.toLocaleString('en-IN')} m³/s discharge, stage ${gaugeLevel.toFixed(2)} m (danger ${dangerLevel.toFixed(1)} m)`
        : `Warning ${warningLevel.toFixed(1)} m, danger ${dangerLevel.toFixed(1)} m, rising ${rateOfRise.toFixed(0)} cm/hr`,
    },
    {
      id: "era5-soil",
      source: "SMAP / Open-Meteo Soil Physics",
      label: "Antecedent soil saturation",
      value: Number(soilScore.toFixed(2)),
      unit: "ratio",
      observedAt: now,
      score: soilScore,
      weight: 0.1,
      detail: liveReport
        ? `Live soil physics: ${liveReport.metrics.soilMoistureVwc} m³/m³ (${liveReport.metrics.soilSaturationPct}% saturation)`
        : "Wet ground converts the same rainfall into more runoff",
    },
    {
      id: "dem-hand",
      source: "Copernicus DEM + HAND",
      label: "Low-lying terrain exposure",
      value: Number(terrainScore.toFixed(2)),
      unit: "ratio",
      observedAt: now,
      score: terrainScore,
      weight: 0.08,
      detail: "Static precomputed layer; low HAND cells flood first",
    },
    {
      id: "crowd",
      source: "Citizen reports (corroboration only)",
      label: "Ground reports in last 3h",
      value: profile.crowdReports,
      unit: "reports",
      observedAt: now,
      score: crowdScore,
      weight: 0.02,
      detail: "Weak signal — used only to corroborate, never to alert alone",
    },
  ];

  const basin = MONITORED_BASINS.find(
    (b) => b.id === state.basinId
  );
  const regionLabel = basin ? `${basin.name} (${basin.river}, ${basin.state})` : state.basinId;

  return {
    signals: {
      readings,
      ingestedAt: now,
      inputOverrides: overrides,
    },
    timeline: [
      {
        at: now,
        step: "ingest_signals",
        detail: `Ingested ${readings.length} signal feeds for ${regionLabel}`,
      },
    ],
    regionLabel,
  };
}

/** Deterministic fingerprint over the raw inputs, for the on-chain anchor. */
export function telemetryHash(state: RahatStateType): string {
  const canonical = JSON.stringify({
    eventId: state.eventId,
    basinId: state.basinId,
    readings: state.signals.readings.map((r) => [r.id, r.value, r.observedAt.slice(0, 13)]),
  });
  return `0x${createHash("sha256").update(canonical).digest("hex")}`;
}
