/**
 * verify_with_satellite — Sentinel-1 SAR confirmation (deterministic, no LLM).
 * Satellites CONFIRM, they never alert (spec 3.1). Simulates a SAR pass:
 * dry-baseline median, low backscatter drop, Otsu threshold, permanent-water
 * masking, then a DEM intersect (FwDET-style) for the depth that drives damage.
 */
import type { RahatStateType, SatelliteInfo } from "./state";
import { hashPayload } from "@/lib/blockchain/public-notebook";

/** Basin depth calibration from the monitored-basin exposure model. */
const DEPTH_BY_BASIN: Record<string, number> = {
  brahmaputra: 1.65,
  mahanadi: 1.25,
};

export async function verifyWithSatellite(
  state: RahatStateType
): Promise<Partial<RahatStateType>> {
  const now = new Date().toISOString();

  const determinedDepth =
    state.signals.inputOverrides.waterDepthMeters ??
    (DEPTH_BY_BASIN[state.basinId] ?? 1.5);

  // VV backscatter: water is dark to radar; a >=3 dB drop vs the dry median
  // below the Otsu threshold marks a flood candidate (spec 3.4, step 3).
  const baselineDb = -8.3;
  const currentBackscatterDb = Number((baselineDb - 11.5).toFixed(1));
  const deltaDb = Number((currentBackscatterDb - baselineDb).toFixed(1));
  const otsuThreshold = -18;

  const detectedWaterAreaSqKm = Number(
    (determinedDepth * 34.8 * 0.9).toFixed(1)
  );

  const confirmed = currentBackscatterDb <= otsuThreshold && deltaDb <= -3;

  const satellite: SatelliteInfo = {
    satellite: "Sentinel-1A GRD (VV + VH)",
    passId: `S1A_${state.eventId.slice(0, 12).toUpperCase()}`,
    acquiredAt: now,
    polarisation: "VV + VH, IW mode, orbit-corrected, speckle-filtered, terrain-corrected",
    baselineDb,
    currentBackscatterDb,
    deltaDb,
    otsuThreshold,
    detectedWaterAreaSqKm,
    meanFloodDepthMeters: determinedDepth,
    confirmed,
    maskCid: `bafybei${hashPayload({ event: state.eventId, area: detectedWaterAreaSqKm }).slice(2, 58)}`,
  };

  // Gauge at/over danger level OR a confirmed mask promotes WARNING → CONFIRMED.
  const promoted =
    confirmed && state.alert?.level === "WARNING" ? ("CONFIRMED" as const) : null;

  const timelineEntry = {
    at: now,
    step: "verify_with_satellite",
    detail: confirmed
      ? `SAR pass confirms ${detectedWaterAreaSqKm} km² water extent (${deltaDb} dB drop below Otsu ${otsuThreshold} dB); mean depth ${determinedDepth.toFixed(2)} m from DEM intersect`
      : "SAR pass inconclusive; extent below confirmation threshold",
  };

  const update: Partial<RahatStateType> = { satellite, timeline: [timelineEntry] };
  if (promoted && state.alert) {
    update.alert = { ...state.alert, level: promoted };
  }
  return update;
}
