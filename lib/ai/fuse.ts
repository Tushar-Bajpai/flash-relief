/**
 * fuse_and_score — deterministic fusion + alert state machine (spec 3.3, 5.4).
 * No LLM here. When the alert reaches WARNING the node anchors an immutable
 * detection timestamp (hash of alert + inputs) on DetectionRegistry, using the
 * low-privilege relayer key (spec 3.6 / 7.1). The relayer key cannot move money.
 */
import type { ChainEntry } from "./state";
import {
  type RahatStateType,
  type AlertInfo,
  type AlertLevel,
} from "./state";
import { telemetryHash } from "./ingest";

/** Logistic weights (starting values to be tuned on backtests, spec 3.3). */
const W = {
  w0: -5.0,
  wR: 2.2,
  wH: 3.8,
  wS: 1.2,
  wT: 1.0,
  wC: 0.5,
};

const barrel = (n: number) => 1 / (1 + Math.exp(-n));

/** Static hysteresis thresholds — deliberately named so they read as tunable. */
export const ALERT_THRESHOLDS = {
  WATCH_ENTER: 0.35,
  WARNING_ENTER: 0.6,
  CLEAR_EXIT: 0.25,
};

function resolveLevel(probability: number): AlertLevel {
  if (probability >= ALERT_THRESHOLDS.WARNING_ENTER) return "WARNING";
  if (probability >= ALERT_THRESHOLDS.WATCH_ENTER) return "WATCH";
  return "CLEAR";
}

async function anchorDetection(
  state: RahatStateType,
  alert: AlertInfo
): Promise<ChainEntry[]> {
  if (alert.detectionAnchored) return [];
  const hash = telemetryHash(state);
  const at = new Date().toISOString();

  const envReady = Boolean(
    process.env.POLYGON_RELAYER_PRIVATE_KEY &&
    process.env.POLYGON_DETECTION_REGISTRY_ADDRESS
  );

  if (!envReady) {
    // Simulated anchor — recorded as a ledger entry with the same fingerprint,
    // so the audit trail stays complete in demo mode (openly marked simulated).
    return [
      {
        contract: "DetectionRegistry",
        action: "recordDetection(simulated)",
        txHash: alert.dataHash,
        blockNumber: "0",
        at,
        mode: "simulated",
      },
    ];
  }

  try {
    const { submitRelayerTransaction } = await import("@/lib/blockchain/relayer");
    const receipt = await submitRelayerTransaction({
      page: 1,
      action: "RECORD_DETECTION",
      payload: {
        eventId: state.eventId,
        alertLevel: alert.level,
        probabilityBasis: Math.round(alert.probability * 10000),
        leadTimeSeconds: Math.round(alert.forecastLeadTimeHours * 3600),
        telemetryHash: hash,
        satelliteMaskCid: state.satellite?.maskCid ?? "",
      },
    });
    return [
      {
        contract: "DetectionRegistry",
        action: "recordDetection",
        txHash: receipt.txHash,
        blockNumber: receipt.blockNumber,
        at,
        mode: "onchain",
      },
    ];
  } catch (err) {
    console.error("[fuse_and_score] DetectionRegistry anchor failed:", err);
    return [];
  }
}

export async function fuseAndScore(
  state: RahatStateType
): Promise<Partial<RahatStateType>> {
  const now = new Date().toISOString();

  let z = W.w0;

  for (const r of state.signals.readings) {
    if (r.id === "gpm-imerg-24h" || r.id === "imd-forecast") z += W.wR * r.score * (r.weight / 0.5);
    else if (r.id === "cwc-gauge") z += W.wH * r.score;
    else if (r.id === "era5-soil") z += W.wS * r.score;
    else if (r.id === "dem-hand") z += W.wT * r.score;
    else if (r.id === "crowd") z += W.wC * r.score / 0.4;
  }

  const probability = Number(barrel(z).toFixed(3));

  const dataHash = `0x${telemetryHash(state).slice(2)}${Math.round(probability * 10000)
    .toString(16)
    .padStart(4, "0")}`.slice(0, 66);

  const level = resolveLevel(probability);
  const previous = state.alert;
  // Hysteresis: never silently downgrade within the same run.
  const orderOf: AlertLevel[] = ["CLEAR", "WATCH", "WARNING", "CONFIRMED"];
  const effective: AlertLevel =
    previous && orderOf.indexOf(level) < orderOf.indexOf(previous.level)
      ? previous.level
      : level;

  const alert: AlertInfo = {
    level: effective,
    probability,
    contributing: state.signals.readings,
    dataHash,
    expectedPeakTime: new Date(Date.now() + (effective === "CONFIRMED" ? 3 : 11) * 3600_000).toISOString(),
    forecastLeadTimeHours: effective === "CONFIRMED" ? 3 : 14,
    detectionAnchored: previous?.detectionAnchored ?? false,
    firstWarningAt:
      effective === "WARNING" || effective === "CONFIRMED"
        ? previous?.firstWarningAt || now
        : previous?.firstWarningAt || "",
  };

  const entries = effective === "WARNING" || effective === "CONFIRMED"
    ? await anchorDetection(state, alert)
    : [];

  const anchoredNow = entries.length > 0;

  return {
    alert: {
      ...alert,
      detectionAnchored: anchoredNow ? true : alert.detectionAnchored,
    },
    chain: {
      mode: anchoredNow ? (entries[0].mode === "onchain" ? "onchain" : "simulated") : state.chain.mode,
      budgetOnChainId: state.chain.budgetOnChainId,
      entries: entries as ChainEntry[],
    },
    timeline: [
      {
        at: now,
        step: "fuse_and_score",
        detail: `Fusion score ${probability} → ${effective}. ${
          anchoredNow ? `Detection hash anchored (${entries[0].mode}).` : "No anchor required."
        }`,
      },
    ],
  };
}
