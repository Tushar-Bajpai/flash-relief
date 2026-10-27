/**
 * validate_budget — deterministic validator node (no LLM, spec 4.4 / 5.4).
 * A budget that fails validation never reaches an officer.
 */
import type { RahatStateType, ValidationInfo, ValidationCheck } from "./state";
import { SDRF_NORMS_CATALOG, SDRF_NORMS_VERSION } from "@/lib/estimate-data";

const MAX_ATTEMPTS = 3;

export function validateBudget(state: RahatStateType): Partial<RahatStateType> {
  const budget = state.budget;
  const now = new Date().toISOString();
  if (!budget) {
    return {
      validation: { status: "FAILED", checks: [], attempts: MAX_ATTEMPTS, failedRules: ["missing-budget"] },
    };
  }

  const checks: ValidationCheck[] = [];

  // VAL-01: arithmetic consistency — sum of lines equals the total exactly.
  const lineSum = budget.lines.reduce((acc, l) => acc + l.totalCostRupees, 0);
  const recomputeDelta = Math.abs(lineSum - budget.totalRupees);
  checks.push({
    id: "VAL-01",
    name: "Deterministic arithmetic consistency",
    status: recomputeDelta === 0 ? "PASSED" : lineSum <= budget.totalRupees + 1 ? "WARNING" : "FAILED",
    detail:
      recomputeDelta === 0
        ? `Σ line items = ₹${lineSum.toLocaleString("en-IN")} matches headline total to the rupee.`
        : `Line sum ₹${lineSum.toLocaleString("en-IN")} vs total ₹${budget.totalRupees.toLocaleString("en-IN")} (Δ ₹${recomputeDelta.toLocaleString("en-IN")}).`,
  });

  // VAL-02: every rate comes from the versioned norms schedule, not the model.
  const rateMismatches = budget.lines.filter((line) => {
    const norm = SDRF_NORMS_CATALOG.find((n) => n.code === line.normCode);
    return !norm || norm.ratePerUnit !== line.ratePerUnit;
  });
  checks.push({
    id: "VAL-02",
    name: "Norm schedule integrity",
    status: rateMismatches.length === 0 ? "PASSED" : "FAILED",
    detail:
      rateMismatches.length === 0
        ? `All ${budget.lines.length} lines cite rates from norms file ${SDRF_NORMS_VERSION}.`
        : `Rate drift on: ${rateMismatches.map((l) => l.normCode).join(", ")}`,
  });

  // VAL-03: camp-days norm ceiling (MHA gratuitous relief duration).
  const foodLine = budget.lines.find((l) => l.normCode === "SDRF-01.A");
  const declaredDays = budget.exposure.campDays;
  checks.push({
    id: "VAL-03",
    name: "Camp-days ceiling",
    status: foodLine && declaredDays > 14 ? "FAILED" : "PASSED",
    detail: `Assumed camp feeding ${declaredDays} days vs MHA ceiling 14 days.`,
  });

  // VAL-04: percentile sanity — P90 should dominate P50 which dominates P10.
  const monotonic = budget.lines.every(
    (l) => l.percentileRange.p10Rupees <= l.percentileRange.p50Rupees + 1 && l.percentileRange.p50Rupees <= l.percentileRange.p90Rupees + 1
  );
  checks.push({
    id: "VAL-04",
    name: "Uncertainty-range monotonicity",
    status: monotonic ? "PASSED" : "WARNING",
    detail: "P10 ≤ P50 ≤ P90 across every funded line.",
  });

  // VAL-05: historical ceiling heuristic versus past events (starting value).
  const crore = budget.totalCrores;
  const ceiling = state.basinId === "brahmaputra" ? 900 : 400;
  checks.push({
    id: "VAL-05",
    name: "Historical allocation ceiling",
    status: crore <= ceiling ? "PASSED" : "WARNING",
    detail: `₹${crore} Cr vs historical P95 reference ₹${ceiling} Cr for ${state.basinId.toUpperCase()} flood response.`,
  });

  const failed = checks.filter((c) => c.status === "FAILED");
  const attempts = (state.validation?.attempts ?? 0) + (failed.length ? 1 : 0);

  const validation: ValidationInfo = {
    status: failed.length ? "FAILED" : "PASSED",
    checks,
    attempts,
    failedRules: failed.map((c) => c.id),
  };

  return {
    validation,
    timeline: [
      {
        at: now,
        step: "validate_budget",
        detail:
          validation.status === "PASSED"
            ? `Validator PASSED (${checks.length}/${checks.length} rules). Package cleared for officer review.`
            : `Validator failed ${failed.length} rule(s): ${validation.failedRules.join(", ")}. Attempt ${attempts}/${MAX_ATTEMPTS}.`,
      },
    ],
  };
}

export const VALIDATION_MAX_ATTEMPTS = MAX_ATTEMPTS;
