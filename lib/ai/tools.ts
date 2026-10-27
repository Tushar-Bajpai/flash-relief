/**
 * The LangGraph tools. Rule #2 from the spec: the LLM must never invent a
 * number — every calculation happens inside these deterministic tools.
 */
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { searchReliefNorms } from "@/lib/db/vector-store";

export const calculatorTool = tool(
  async ({ expression, step }) => {
    // Whitelist arithmetic only — no identifiers, no function calls.
    if (!/^[-+*/().\d\s%]+$/.test(expression)) {
      throw new Error("Calculator accepts plain arithmetic expressions only.");
    }
    // eslint-disable-next-line no-new-func
    const value = Function(`"use strict"; return (${expression});`)() as unknown;
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error("Expression did not evaluate to a finite number.");
    }
    return `step "${step ?? "calc"}" = ${Number(value.toFixed(4))}`;
  },
  {
    name: "calculator",
    description:
      "Deterministic arithmetic. Use for EVERY budget quantity, rate or total. Input: arithmetic expression with numbers only.",
    schema: z.object({
      expression: z.string().describe("Plain arithmetic, e.g. 40000*7*95"),
      step: z.string().describe("Short label of what this computes"),
    }),
  }
);

export const normsLookupTool = tool(
  async ({ query, topK }) => {
    const results = await searchReliefNorms(query, { topK: Math.min(topK ?? 4, 8) });
    return JSON.stringify(
      results.map((r) => ({
        normCode: r.normCode,
        title: r.title,
        statutoryReference: r.statutoryReference,
        unitRateRupees: r.unitRateRupees,
        rateDescription: r.rateDescription,
      }))
    );
  },
  {
    name: "lookup_sdrf_norms",
    description:
      "Vector search over the MHA SDRF / NDRF items-and-norms schedule. Returns the official norm codes, rates and statute references for a relief category.",
    schema: z.object({
      query: z.string().describe("Relief category or line description"),
      topK: z.number().optional().describe("How many norms to return (default 4)"),
    }),
  }
);

export const RAHAT_TOOLS = [calculatorTool, normsLookupTool];

/** Execute openai tool_calls payloads against the whitelisted tool set. */
export async function executeToolCalls(
  calls: { name: string; args?: unknown }[]
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const call of calls) {
    const found = RAHAT_TOOLS.find((t) => t.name === call.name);
    if (!found) {
      out[String(call.name)] = "Unknown tool";
      continue;
    }
    try {
      const toolInput = (call.args ?? {}) as { expression?: string; step?: string; query?: string; topK?: number };
      out[call.name] =
        call.name === "calculator"
          ? await calculatorTool.invoke({
              expression: String(toolInput.expression ?? ""),
              step: String(toolInput.step ?? "calc"),
            })
          : await normsLookupTool.invoke({
              query: String(toolInput.query ?? ""),
              topK: toolInput.topK,
            });
    } catch (err) {
      out[call.name] = `tool error: ${(err as Error).message}`;
    }
  }
  return out;
}
