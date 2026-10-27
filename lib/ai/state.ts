/**
 * RahatState — the single typed state object that flows through the LangGraph
 * workflow (spec section 5.1). Every node reads from it and returns a partial
 * update; LangGraph merges updates per-field using the reducers below.
 *
 * Design rules carried over from the spec:
 *  - Numbers come from deterministic code; the LLM only explains / translates.
 *  - On-chain amounts are stored as stringified paise so the state is always
 *    JSON-serialisable (required for the checkpointer and interrupt payloads).
 */
import { Annotation } from "@langchain/langgraph";
import type { ExposureMetrics, PercentileChoice, SdrfNormItem } from "@/lib/estimate-data";
import { SDRF_NORMS_VERSION } from "@/lib/estimate-data";

export type AlertLevel = "CLEAR" | "WATCH" | "WARNING" | "CONFIRMED";
export type Decision = "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";

/** One fused sensor reading (rain, gauge, soil, forecast...). */
export interface SignalReading {
  id: string;
  source: string;
  label: string;
  value: number;
  unit: string;
  observedAt: string;
  /** 0..1 normalised score after comparing against local climatology. */
  score: number;
  /** Weight inside the logistic fusion score. */
  weight: number;
  detail: string;
}

/** Output of the fuse_and_score node — the alert object from spec section 3.3. */
export interface AlertInfo {
  level: AlertLevel;
  probability: number;
  /** Contribution breakdown so the alert is explainable (which signal fired). */
  contributing: SignalReading[];
  /** Tamper-proof fingerprint of inputs + score, anchored on-chain. */
  dataHash: string;
  expectedPeakTime: string;
  /** Forecast lead time in hours (riverine signals give this). */
  forecastLeadTimeHours: number;
  /** Set once the detection hash has been anchored on DetectionRegistry. */
  detectionAnchored: boolean;
  /** Time of first WARNING, for lead-time style metrics. */
  firstWarningAt: string;
}

/** Output of verify_with_satellite — confirmation, not alerting (spec 3.4). */
export interface SatelliteInfo {
  satellite: string;
  passId: string;
  acquiredAt: string;
  polarisation: string;
  /** Median dry-baseline backscatter in dB. */
  baselineDb: number;
  currentBackscatterDb: number;
  deltaDb: number;
  otsuThreshold: number;
  detectedWaterAreaSqKm: number;
  /** Intersected with DEM (FwDET-style) — the budget driver. */
  meanFloodDepthMeters: number;
  confirmed: boolean;
  maskCid: string;
}

export interface ImpactInfo {
  selected: PercentileChoice;
  p10: ExposureMetrics;
  p50: ExposureMetrics;
  p90: ExposureMetrics;
  computedAt: string;
}

/** A budget line with the BigInt paise value already converted to string. */
export interface GraphBudgetLine {
  id: string;
  normCode: string;
  description: string;
  departmentId: string;
  departmentName: string;
  quantity: number;
  unitLabel: string;
  ratePerUnit: number;
  totalCostRupees: number;
  totalCostPaise: string;
  formulaString: string;
  explanation: string;
  percentileRange: { p10Rupees: number; p50Rupees: number; p90Rupees: number };
}

/** Officer-requested parameter changes parsed out of free text. */
export interface BudgetOverrides {
  campDays?: number;
  percentile?: PercentileChoice;
  fodderMultiplierPct?: number;
  excludeNormCodes?: string[];
}

export interface BudgetPackage {
  version: number;
  normVersion: string;
  basinId: string;
  percentile: PercentileChoice;
  exposure: ExposureMetrics;
  lines: GraphBudgetLine[];
  totalRupees: number;
  totalCrores: number;
  departmentSplits: {
    departmentId: string;
    departmentName: string;
    shortName: string;
    color: string;
    totalRupees: number;
    totalCrores: number;
    percentageOfTotal: number;
  }[];
  aiExplanation: string;
  explanationsByNorm: Record<string, string>;
  overrides: BudgetOverrides;
  builtAt: string;
}

export interface ValidationCheck {
  id: string;
  name: string;
  status: "PASSED" | "FAILED" | "WARNING";
  detail: string;
}

export interface ValidationInfo {
  status: "PASSED" | "FAILED";
  checks: ValidationCheck[];
  attempts: number;
  failedRules: string[];
}

export interface OfficerComment {
  officerId: string;
  officerName: string;
  role: string;
  decision: Decision;
  comment: string;
  at: string;
}

export interface ReviewInfo {
  status: "PENDING" | Decision | "PUBLISHED" | "BLOCKED";
  revision: number;
  revisionLog: {
    revision: number;
    instruction: string;
    officerName: string;
    changedLines: string[];
    deltaRupees: number;
  }[];
  comments: OfficerComment[];
  lastDecision: Decision | null;
}

export interface ChainEntry {
  contract: string;
  action: string;
  txHash: string;
  blockNumber: string;
  at: string;
  mode: "onchain" | "simulated";
}

export interface ChainInfo {
  mode: "onchain" | "simulated" | "skipped";
  budgetOnChainId: string | null;
  entries: ChainEntry[];
}

export interface TimelineEntry {
  at: string;
  step: string;
  detail: string;
}

export const RahatState = Annotation.Root({
  eventId: Annotation<string>,
  basinId: Annotation<string>,
  regionLabel: Annotation<string>,

  // Latest raw readings with timestamps.
  signals: Annotation<{ readings: SignalReading[]; ingestedAt: string; inputOverrides: Record<string, number> }>({
    reducer: (prev, next) =>
      next ?? prev,
    default: () => ({ readings: [], ingestedAt: "", inputOverrides: {} }),
  }),

  alert: Annotation<AlertInfo | null>({ reducer: (_, next) => next, default: () => null }),

  satellite: Annotation<SatelliteInfo | null>({ reducer: (_, next) => next, default: () => null }),

  impact: Annotation<ImpactInfo | null>({ reducer: (_, next) => next, default: () => null }),

  budget: Annotation<BudgetPackage | null>({ reducer: (_, next) => next, default: () => null }),

  budgetHistory: Annotation<BudgetPackage[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),

  validation: Annotation<ValidationInfo | null>({ reducer: (_, next) => next, default: () => null }),

  review: Annotation<ReviewInfo>({
    reducer: (prev, next) => ({
      ...prev,
      ...next,
      // Respect arrays passed explicitly; merge comments when the reducer append is used.
      comments: next.comments ?? prev.comments,
    }),
    default: () => ({
      status: "PENDING" as const,
      revision: 0,
      revisionLog: [],
      comments: [],
      lastDecision: null,
    }),
  }),

  chain: Annotation<ChainInfo>({
    reducer: (prev, next) => ({
      ...next,
      entries: [...prev.entries, ...next.entries],
    }),
    default: () => ({ mode: "skipped", budgetOnChainId: null, entries: [] }),
  }),

  timeline: Annotation<TimelineEntry[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),

  // Internal: officer overrides consumed by build_budget after feedback.
  requestedChanges: Annotation<BudgetOverrides | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
});

export type RahatStateType = typeof RahatState.State;

/** Norms the graph must always cite (versioned config, never hardcoded). */
export const ACTIVE_NORM_VERSION = SDRF_NORMS_VERSION;
export type { SdrfNormItem, ExposureMetrics, PercentileChoice };
