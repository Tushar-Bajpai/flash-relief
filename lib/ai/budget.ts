/**
 * build_budget node — the tool-calling agent stage (spec 5.4).
 *
 * Deterministic core: every quantity comes from computeExposure × the
 * versioned MHA SDRF norms catalog in lib/estimate-data.ts. The LLM agent
 * (budget-agent.ts) then verifies lines with a whitelist calculator tool,
 * cites the norms schedule, and writes per-line explanations. Without an
 * API key the node falls back to template explanations so the graph still
 * produces a complete, approvable package.
 */
import type {
  RahatStateType,
  BudgetPackage,
  GraphBudgetLine,
  BudgetOverrides,
} from "./state";
import { ACTIVE_NORM_VERSION } from "./state";
import {
  DEPARTMENTS,
  generateDraftBudget,
  computeExposure,
} from "@/lib/estimate-data";
import { formatNumber } from "@/lib/format";
import { writeBudgetNarrative } from "./budget-agent";

const CAMP_DAYS_MHA_CEILING = 14; // guardrail: officer overrides never exceed the norm ceiling

/** Deterministic application of officer-requested parameter changes. */
export function draftBudget(
  depthMeters: number,
  percentile: Parameters<typeof generateDraftBudget>[1],
  basinId: string,
  overrides: BudgetOverrides = {}
): BudgetPackage {
  const effPercentile = overrides.percentile ?? percentile;
  const exposure = computeExposure(depthMeters, effPercentile, basinId);
  const rangeP10 = computeExposure(depthMeters, "P10", basinId);
  const rangeP90 = computeExposure(depthMeters, "P90", basinId);

  const draft = generateDraftBudget(depthMeters, effPercentile, basinId);

  const campDays = Math.min(overrides.campDays ?? exposure.campDays, CAMP_DAYS_MHA_CEILING);
  const fodderMultiplier = 1 + (overrides.fodderMultiplierPct ?? 0) / 100;
  const exclude = new Set(overrides.excludeNormCodes ?? []);

  const lines: GraphBudgetLine[] = draft.lines
    .filter((line) => !exclude.has(line.normCode))
    .map((line) => {
      const out: GraphBudgetLine = {
        ...line,
        totalCostPaise: line.totalCostPaise.toString(),
        explanation: "",
      };

      // Deterministic overrides — same formula, new parameter, calculator does it.
      if (overrides.campDays !== undefined && line.normCode === "SDRF-01.A") {
        out.quantity = exposure.displacedPopulation * campDays;
        out.totalCostRupees = out.quantity * line.ratePerUnit;
        out.totalCostPaise = String(out.quantity * line.ratePerUnit * 100);
        out.formulaString = `${formatNumber(exposure.displacedPopulation)} citizens × ${campDays} days × ₹${line.ratePerUnit}`;
        out.percentileRange = {
          p10Rupees: rangeP10.displacedPopulation * campDays * line.ratePerUnit,
          p50Rupees: out.totalCostRupees,
          p90Rupees: rangeP90.displacedPopulation * campDays * line.ratePerUnit,
        };
      }
      if (overrides.campDays !== undefined && line.normCode === "SDRF-04.A") {
        out.quantity = exposure.cattleExposed * campDays;
        out.totalCostRupees = out.quantity * line.ratePerUnit;
        out.totalCostPaise = String(out.quantity * line.ratePerUnit * 100);
        out.formulaString = `${formatNumber(exposure.cattleExposed)} cattle × ${campDays} days × ₹${line.ratePerUnit}`;
        out.percentileRange = {
          p10Rupees: rangeP10.cattleExposed * campDays * line.ratePerUnit,
          p50Rupees: out.totalCostRupees,
          p90Rupees: rangeP90.cattleExposed * campDays * line.ratePerUnit,
        };
      }
      if (overrides.fodderMultiplierPct && line.normCode === "SDRF-04.A") {
        out.quantity = Math.round(out.quantity * fodderMultiplier);
        out.totalCostRupees = out.quantity * line.ratePerUnit;
        out.totalCostPaise = String(out.quantity * line.ratePerUnit * 100);
        out.formulaString = `${formatNumber(out.quantity)} cattle-days × ₹${line.ratePerUnit}`;
      }
      return out;
    });

  const totalRupees = lines.reduce((acc, line) => acc + line.totalCostRupees, 0);

  const deptMap = new Map<string, number>();
  lines.forEach((line) => deptMap.set(line.departmentId, (deptMap.get(line.departmentId) ?? 0) + line.totalCostRupees));

  const departmentSplits = Object.values(DEPARTMENTS)
    .map((dept) => {
      const rupees = deptMap.get(dept.id) ?? 0;
      return {
        departmentId: dept.id,
        departmentName: dept.name,
        shortName: dept.shortName,
        color: dept.color,
        totalRupees: rupees,
        totalCrores: Number((rupees / 10_000_000).toFixed(2)),
        percentageOfTotal: totalRupees > 0 ? Number(((rupees / totalRupees) * 100).toFixed(1)) : 0,
      };
    })
    .filter((d) => d.totalRupees > 0)
    .sort((a, b) => b.totalRupees - a.totalRupees);

  return {
    version: 1,
    normVersion: ACTIVE_NORM_VERSION,
    basinId,
    percentile: effPercentile,
    exposure,
    lines,
    totalRupees,
    totalCrores: Number((totalRupees / 10_000_000).toFixed(2)),
    departmentSplits,
    aiExplanation: "",
    explanationsByNorm: {},
    overrides,
    builtAt: new Date().toISOString(),
  };
}

/** Visible diff between two budget versions, shown to officers (spec section 6). */
export function diffBudget(prev: BudgetPackage, next: BudgetPackage): { changedLines: string[]; deltaRupees: number } {
  const prevMap = new Map(prev.lines.map((l) => [l.normCode, l]));
  const nextMap = new Map(next.lines.map((l) => [l.normCode, l]));
  const changedLines: string[] = [];

  for (const [code, line] of nextMap) {
    const before = prevMap.get(code);
    if (!before) changedLines.push(`+ ${code} ${line.description}`);
    else if (before.totalCostRupees !== line.totalCostRupees) {
      const delta = line.totalCostRupees - before.totalCostRupees;
      changedLines.push(`~ ${code}: ₹${before.totalCostRupees.toLocaleString("en-IN")} → ₹${line.totalCostRupees.toLocaleString("en-IN")} (${delta >= 0 ? "+" : "−"}₹${Math.abs(delta).toLocaleString("en-IN")})`);
    }
  }
  for (const [code, line] of prevMap) {
    if (!nextMap.has(code)) changedLines.push(`− ${code} ${line.description}`);
  }

  return {
    changedLines,
    deltaRupees: next.totalRupees - prev.totalRupees,
  };
}

/**
 * The node itself. Deterministic build → narrative generation (LLM or fallback)
 * → versioning + history append.
 */
export async function buildBudget(state: RahatStateType): Promise<Partial<RahatStateType>> {
  const depth = state.satellite?.meanFloodDepthMeters ?? 1.4;
  const prev = state.budget;
  const overrides = state.requestedChanges ?? {};
  const version = (prev?.version ?? 0) + 1;

  const budget = draftBudget(depth, state.impact?.selected ?? "P50", state.basinId, overrides);
  budget.version = version;

  const narrative = await writeBudgetNarrative(budget, {
    alertLevel: state.alert?.level ?? "WARNING",
    probability: state.alert?.probability ?? 0,
    evidence: state.signals.readings.map((r) => `${r.label}: ${r.value} ${r.unit}`),
  });

  budget.aiExplanation = narrative.summary;
  budget.lines = budget.lines.map(
    (line) => ({ ...line, explanation: narrative.lines[line.id] ?? narrative.summary })
  );
  budget.explanationsByNorm = narrative.explanationsByNorm ?? {};

  const diff = prev ? diffBudget(prev, budget) : null;

  return {
    budget,
    budgetHistory: prev ? [prev] : [],
    timeline: [
      {
        at: budget.builtAt,
        step: "build_budget",
        detail: diff
          ? `Budget v${version} built after officer feedback — total ₹${budget.totalCrores} Cr (Δ ₹${(diff.deltaRupees / 10_000_000).toFixed(2)} Cr).`
          : `Budget v${version} drafted: ${budget.lines.length} SDRF lines, total ₹${budget.totalCrores} Cr. Norms ${budget.normVersion}.`,
      },
    ],
  };
}
