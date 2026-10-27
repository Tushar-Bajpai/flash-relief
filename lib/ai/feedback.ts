/**
 * apply_officer_feedback — converts free-text officer comments into
 * deterministic parameter changes (spec 5.4: LLM node). The LLM ONLY maps
 * language → structured overrides; arithmetic then happens in the budget node.
 * Falls back to a strict keyword/number parser when no API key is configured.
 */
import type { RahatStateType, BudgetOverrides } from "./state";
import type { PercentileChoice } from "@/lib/estimate-data";
import { getChatModel, extractJson, isLlmConfigured } from "./llm";

const OVERRIDE_SCHEMA_HINT = `{"campDays": number|null, "percentile": "P10"|"P50"|"P90"|null, "fodderMultiplierPct": number|null, "excludeNormCodes": string[]}`;

function fallbackParser(comment: string): BudgetOverrides {
  const overrides: BudgetOverrides = {};
  const text = comment.toLowerCase();

  // Camp days: "extend ... from 7 days to 10 days" / "+3 days" / "10 days".
  const range = text.match(/(\d{1,2})\s*days?\s*(?:–|-|to|upto|up to)\s*(\d{1,2})\s*days?/);
  const delta = text.match(/[+＋]\s*(\d{1,2})\s*days?/);
  const plain = text.match(/(?:should be|exceed|raise[^0-9]*?to|extend[^0-9]*?to)\s*(\d{1,2})\s*days?/);
  if (range) overrides.campDays = Number(range[2]);
  else if (delta) overrides.campDays = 7 + Number(delta[1]);
  else if (plain) overrides.campDays = Number(plain[1]);
  else if (/days|camp/.test(text)) {
    const anyDays = text.match(/(\d{1,2})\s*days?/);
    if (anyDays) overrides.campDays = Number(anyDays[1]);
  }

  // Fodder / cattle: "+20% fodder", "increase cattle fodder by 20%".
  if (/fodder|cattle/.test(text)) {
    const pct = text.match(/([+-]?\d{1,3})\s*%/);
    if (pct) overrides.fodderMultiplierPct = Number(pct[1]);
    else {
      const by = text.match(/by\s+(\d{1,3})\b/);
      if (by && /increase|more|boost|raise/.test(text)) overrides.fodderMultiplierPct = Number(by[1]);
    }
  }

  // Percentile switches: "use the P90 worst-case".
  const pctile = text.match(/\bp(\d{2})\b/);
  if (pctile) overrides.percentile = `P${pctile[1]}` as PercentileChoice;
  else if (text.includes("worst") || text.includes("conservative")) overrides.percentile = "P90";
  else if (text.includes("p50") || text.includes("moderate")) overrides.percentile = "P50";

  // Line exclusions: "exclude SDRF-04.A" / "drop the drainage line".
  const code = comment.match(/SDRF-\d{2}\.[A-Z]/);
  if (code && /exclude|drop|remove|cut the line/.test(text)) {
    overrides.excludeNormCodes = [code[0]];
  }
  if (Object.keys(overrides).length === 0 && /camp|days|fodder|percentile|p90|p10/.test(text)) {
    // Under-specified colony of changes — request nothing, print a parse log.
    return {};
  }
  return overrides;
}

async function llmParser(comment: string): Promise<BudgetOverrides | null> {
  const model = getChatModel();
  try {
    const res = await model!.invoke([
      [
        "system",
        `You translate Indian district-officer feedback on a flood-relief SDRF budget into strict parameter overrides. Return ONLY JSON of the shape ${OVERRIDE_SCHEMA_HINT}, with null for anything not requested. campDays is the total number of relief-camp feeding days (1-14). percentile switches the funding scenario. fodderMultiplierPct is a percentage change to the cattle fodder line. excludeNormCodes removes a line entirely (use SDRF codes only when the officer explicitly drops or excludes that exact line).`,
      ],
      ["human", comment],
    ]);
    return extractJson<BudgetOverrides>(typeof res.content === "string" ? res.content : "");
  } catch (err) {
    console.warn("[apply_officer_feedback] LLM parse failed, fallback parser:", (err as Error).message);
    return null;
  }
}

export async function applyOfficerFeedback(
  state: RahatStateType
): Promise<Partial<RahatStateType>> {
  const latest = state.review.comments[state.review.comments.length - 1];
  const comment = latest?.comment?.trim() ?? "";

  const overrides = (isLlmConfigured() ? await llmParser(comment) : null) ?? fallbackParser(comment);
  const parsedBy = isLlmConfigured() && overrides !== null ? "llm" : "keyword-parser";

  const at = new Date().toISOString();
  return {
    requestedChanges: overrides,
    review: {
      ...state.review,
      status: "PENDING",
      revision: state.review.revision + 1,
      revisionLog: [
        ...state.review.revisionLog,
        {
          revision: state.review.revision + 1,
          instruction: comment || "(no comment)",
          officerName: latest?.officerName ?? "Officer",
          changedLines: [],
          deltaRupees: 0,
        },
      ],
    },
    timeline: [
      {
        at,
        step: "apply_officer_feedback",
        detail: `${latest?.officerName ?? "Officer"} feedback parsed (${parsedBy}): ${JSON.stringify(overrides)}. Requesting budget v${(state.budget?.version ?? 0) + 1}.`,
      },
    ],
  };
}
