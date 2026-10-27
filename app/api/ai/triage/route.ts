import { NextRequest, NextResponse } from "next/server";
import { runTriage, GRIEVANCE_CATEGORIES } from "@/lib/ai/triage";
import { isLlmConfigured } from "@/lib/ai/llm";

export const runtime = "nodejs";

/**
 * Grievance triage endpoint — the second small LangGraph (spec 5.4, 8.2).
 * POST { text, sourceLabel? } → { languageDetected, textTranslated, category,
 * urgency, dedupeHash, duplicateOf, linkedNormCodes, correlatedActions }.
 *
 * Hashing + anchoring to GrievanceRegistry (starting the 48-hour clock) is the
 * deterministic job of the grievances route, never the LLM's.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (text.length < 4) {
      return NextResponse.json(
        { error: "text is required (the original grievance wording, any language)." },
        { status: 400 }
      );
    }

    const triage = await runTriage({ text, sourceLabel: body.sourceLabel });

    return NextResponse.json({
      success: true,
      triage,
      categories: GRIEVANCE_CATEGORIES,
      llm: isLlmConfigured() ? "configured" : "deterministic-fallback",
      note: "Anchor grievanceHash (not the raw text) to GrievanceRegistry to start the statutory 48-hour response clock.",
    });
  } catch (err) {
    console.error("[AI triage]", err);
    return NextResponse.json(
      { error: "Triage graph failed", message: (err as Error).message },
      { status: 500 }
    );
  }
}
