/**
 * estimate_impact + log_and_wait — deterministic (no LLM, spec 5.4).
 *
 * Impact uses the JRC depth-damage mathematics already calibrated in
 * `lib/estimate-data.ts` at three percentiles (P10 / P50 / P90). Officers
 * choose which percentile to fund; nothing here invents a number.
 */
import type { RahatStateType } from "./state";
import { computeExposure } from "@/lib/estimate-data";

export async function estimateImpact(
  state: RahatStateType
): Promise<Partial<RahatStateType>> {
  const depth = state.satellite?.meanFloodDepthMeters ?? 1.4;
  const now = new Date().toISOString();

  const p10 = computeExposure(depth, "P10", state.basinId);
  const p50 = computeExposure(depth, "P50", state.basinId);
  const p90 = computeExposure(depth, "P90", state.basinId);

  return {
    impact: { selected: "P50", p10, p50, p90, computedAt: now },
    timeline: [
      {
        at: now,
        step: "estimate_impact",
        detail: `Exposure: ${p50.exposedPopulation.toLocaleString("en-IN")} citizens exposed, ${p50.displacedPopulation.toLocaleString("en-IN")} displaced (P50). P10–P90 range computed for officer choice.`,
      },
    ],
  };
}

/** Satellite/impact confirmation anchor for depth (read by budget + nodes). */
export function selectedDepth(state: RahatStateType): number {
  return state.satellite?.meanFloodDepthMeters ?? state.impact?.p50.waterDepthMeters ?? 1.4;
}
