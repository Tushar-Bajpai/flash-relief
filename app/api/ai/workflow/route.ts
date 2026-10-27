import { NextRequest, NextResponse } from "next/server";
import { startRun, resumeRun, getRunStatus, serializeState } from "@/lib/ai/graph";
import { isLlmConfigured } from "@/lib/ai/llm";

export const runtime = "nodejs"; // LangGraph + viem/ws need the Node runtime

/**
 * AI workflow control endpoint (LangGraph human-in-the-loop, spec section 5).
 *
 * POST { action: "start",   eventId?, basinId?, inputOverrides? }
 *   → runs detect → fuse → satellite → impact → budget → validate,
 *     pausing at officer_review with the full review package.
 * POST { action: "resume",  threadId, decision: APPROVED|REJECTED|CHANGES_REQUESTED,
 *        officerId, officerName, role, comment? }
 *   → resumes the paused thread; approve or reject ends the run, changes goes
 *     through apply_officer_feedback → build_budget and pauses again for v2.
 * GET  ?threadId=...  → current state snapshot + interrupt payload.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    if (action === "start") {
      const handle = await startRun({
        eventId: body.eventId,
        basinId: body.basinId,
        inputOverrides:
          body.inputOverrides && typeof body.inputOverrides === "object"
            ? body.inputOverrides
            : undefined,
      });
      return NextResponse.json({
        success: true,
        threadId: handle.threadId,
        status: handle.status,
        interruptPayload: handle.interruptPayload,
        state: serializeState(handle.state),
        llm: isLlmConfigured() ? "configured" : "deterministic-fallback",
      });
    }

    if (action === "resume") {
      const { threadId } = body;
      if (!threadId) {
        return NextResponse.json({ error: "threadId is required to resume." }, { status: 400 });
      }
      const decision = String(body.decision ?? "").toUpperCase();
      if (!["APPROVED", "REJECTED", "CHANGES_REQUESTED"].includes(decision)) {
        return NextResponse.json(
          { error: "decision must be APPROVED, REJECTED or CHANGES_REQUESTED." },
          { status: 400 }
        );
      }
      if (!body.officerName || !body.role) {
        return NextResponse.json(
          { error: "officerName and role are required (officer identity is verified by the review console)." },
          { status: 400 }
        );
      }
      const handle = await resumeRun(threadId, {
        decision: decision as "APPROVED" | "REJECTED" | "CHANGES_REQUESTED",
        officerId: String(body.officerId ?? body.officerName),
        officerName: String(body.officerName),
        role: String(body.role),
        comment: typeof body.comment === "string" ? body.comment : "",
      });
      return NextResponse.json({
        success: true,
        threadId: handle.threadId,
        status: handle.status,
        interruptPayload: handle.interruptPayload,
        state: serializeState(handle.state),
      });
    }

    return NextResponse.json({ error: `Unknown action: ${String(action)}` }, { status: 400 });
  } catch (err) {
    console.error("[AI workflow]", err);
    return NextResponse.json(
      { error: "LangGraph run failed", message: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const threadId = req.nextUrl.searchParams.get("threadId");
  try {
    if (!threadId) {
      return NextResponse.json({
        service: "rahat-langgraph",
        runtime: "LangGraph.js (StateGraph + MemorySaver checkpointer)",
        graph: [
          "ingest_signals",
          "fuse_and_score",
          "log_and_wait",
          "verify_with_satellite",
          "estimate_impact",
          "build_budget",
          "validate_budget",
          "officer_review (interrupt)",
          "apply_officer_feedback",
          "publish_to_chain",
        ],
        llm: isLlmConfigured() ? "configured" : "deterministic-fallback (no OPENAI_API_KEY)",
      });
    }
    const handle = await getRunStatus(threadId);
    if (!handle) {
      return NextResponse.json({ error: `Unknown thread: ${threadId}` }, { status: 404 });
    }
    return NextResponse.json({
      threadId: handle.threadId,
      status: handle.status,
      interruptPayload: handle.interruptPayload,
      state: serializeState(handle.state),
    });
  } catch (err) {
    console.error("[AI workflow status]", err);
    return NextResponse.json(
      { error: "Failed to load run", message: (err as Error).message },
      { status: 500 }
    );
  }
}
