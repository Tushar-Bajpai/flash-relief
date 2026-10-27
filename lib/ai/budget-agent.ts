/**
 * budget-agent — LLM explanation stage for build_budget (spec 5.4 "build_budget:
 * tool-calling agent — LLM decides which tools to call and writes the
 * explanations. A calculator tool does all arithmetic").
 *
 * Without an API key everything degrades to deterministic template narratives
 * so the graph still yields a complete approvable package (honest fallback).
 */
import type { BudgetPackage } from "./state";
import { getChatModel, extractJson, isLlmConfigured } from "./llm";
import { executeToolCalls, RAHAT_TOOLS } from "./tools";
import { formatNumber } from "@/lib/format";
import { SDRF_NORMS_CATALOG } from "@/lib/estimate-data";

export interface BudgetNarrative {
  summary: string;
  lines: Record<string, string>;
  explanationsByNorm: Record<string, string>;
}

const AGENT_SYSTEM_PROMPT = `You are the SDRF budget drafting assistant inside Rahat, an AI flood-relief workflow used by district officers in India.

Absolute rules:
1. Every quantity and rate was already computed by deterministic code and given to you below. Never produce your own numbers; if you want to double-check a line, call the calculator tool with the exact expression.
2. Rates always come from the MHA SDRF norms schedule (norm codes). Use lookup_sdrf_norms if you need the schedule citation for a line.
3. Never invent facts. Flag any quantity you cannot ground in the inputs with "insufficient data".
4. One short sentence per line: what the money buys, where the quantity comes from, which norm applies.
5. Then a 3-sentence committee summary: what is requested, the biggest uncertainty, what evidence would raise confidence.

Reply with ONLY JSON: {"summary": string, "lines": {"<lineId>": string}}`;

interface AgentContext {
  alertLevel: string;
  probability: number;
  evidence: string[];
}

/** Template explanations — the honest fallback and sanity baseline. */
function templateNarrative(budget: BudgetPackage, ctx: AgentContext): BudgetNarrative {
  const lines: Record<string, string> = {};
  const norms: Record<string, string> = {};

  for (const line of budget.lines) {
    const norm = SDRF_NORMS_CATALOG.find((n) => n.code === line.normCode);
    norms[line.normCode] = norm
      ? `${norm.auditNotes} Schedule rate ₹${norm.ratePerUnit.toLocaleString("en-IN")} ${norm.unitLabel ? `per ${norm.unitLabel}` : ""}.`
      : "Pending norm citation.";
    lines[line.id] = `${line.description}: ${line.formulaString} under ${line.normCode} (${budget.normVersion}). Deterministic quantity, no model extrapolation.`;
  }

  return {
    summary: `Draft v${budget.version} for ${budget.basinId.replace(/^\w/, (c) => c.toUpperCase())} at ${budget.percentile} confidence: ${budget.lines.length} SDRF lines totalling ₹${budget.totalCrores} Cr, driven by a ${ctx.alertLevel} alert (fusion probability ${ctx.probability}). Largest exposure: ${formatNumber(budget.exposure.displacedPopulation)} displaced citizens for ${budget.exposure.campDays} camp-days. All arithmetic is deterministic; officers can inspect each formula line before approving.`,
    lines,
    explanationsByNorm: norms,
  };
}

/** One compact tool-calling pass (bounded loop, max 2 rounds). */
export async function writeBudgetNarrative(
  budget: BudgetPackage,
  ctx: AgentContext
): Promise<BudgetNarrative> {
  if (!isLlmConfigured()) return templateNarrative(budget, ctx);

  const model = getChatModel();
  try {
    const inputs = JSON.stringify(
      {
        event: budget.basinId,
        alertLevel: ctx.alertLevel,
        probability: ctx.probability,
        normVersion: budget.normVersion,
        selectedPercentile: budget.percentile,
        exposure: budget.exposure,
        lines: budget.lines.map((l) => ({
          id: l.id,
          normCode: l.normCode,
          description: l.description,
          quantity: l.quantity,
          unit: l.unitLabel,
          ratePerUnit: l.ratePerUnit,
          totalRupees: l.totalCostRupees,
          formula: l.formulaString,
        })),
        evidenceSignals: ctx.evidence,
      },
      null,
      1
    );

    const bound = model!.bindTools(RAHAT_TOOLS, { tool_choice: "auto" });
    let history: any[] = [
      { role: "system" as const, content: AGENT_SYSTEM_PROMPT },
      { role: "user" as const, content: inputs },
    ];

    // Bounded agent loop: tool rounds → final JSON answer.
    for (let round = 0; round < 2; round++) {
      const res = await bound.invoke(history);
      const calls = (res as any).tool_calls ?? [];
      if (!calls.length) {
        const parsed = extractJson<{ summary: string; lines: Record<string, string> }>(
          typeof res.content === "string" ? res.content : ""
        );
        if (parsed?.summary) {
          return {
            summary: parsed.summary,
            lines: parsed.lines ?? {},
            explanationsByNorm: templateNarrative(budget, ctx).explanationsByNorm,
          };
        }
        break;
      }
      history = [...history, res];
      const executed = await executeToolCalls(
        calls.map((c: any) => ({ name: c.name, args: c.args }))
      );
      history = [
        ...history,
        ...calls.map((c: any) => ({
          role: "tool" as const,
          tool_call_id: c.id,
          content: executed[c.name] ?? "no result",
        })),
      ];
    }
    return templateNarrative(budget, ctx);
  } catch (err) {
    console.warn("[budget-agent] LLM narrative failed, using template:", (err as Error).message);
    return templateNarrative(budget, ctx);
  }
}
