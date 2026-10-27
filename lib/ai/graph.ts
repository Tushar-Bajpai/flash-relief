/**
 * The Rahat LangGraph workflow (spec section 5.2):
 *
 *  START → ingest_signals → fuse_and_score ─┬─ clear/watch → log_and_wait → END
 *                                           └─ warning/confirmed
 *                → verify_with_satellite → estimate_impact → build_budget
 *                → validate_budget ─┬─ fails → build_budget   (max 3 attempts)
 *                                   └─ passes → officer_review  ← INTERRUPT
 *  officer_review ─┬─ APPROVED → publish_to_chain → END
 *                  └─ REJECTED → END
 *                  └─ CHANGES_REQUESTED → apply_officer_feedback → build_budget
 *
 * Compiled with a checkpointer. For the hackathon this is MemorySaver — swap
 * in PostgresSaver for production (spec 5.3: a durable checkpointer is
 * required so a run can stay paused for days).
 */
import { StateGraph, Annotation, START, END, MemorySaver, Command } from "@langchain/langgraph";
import { RahatState, type RahatStateType } from "./state";
import { ingestSignals } from "./ingest";
import { fuseAndScore } from "./fuse";
import { verifyWithSatellite } from "./satellite";
import { estimateImpact } from "./impact";
import { logAndWait } from "./log-wait";
import { buildBudget } from "./budget";
import { validateBudget, VALIDATION_MAX_ATTEMPTS } from "./validation";
import { officerReview } from "./review";
import { applyOfficerFeedback } from "./feedback";
import { publishToChain } from "./publish";

const routeAfterFuse = (state: RahatStateType) => {
  const level = state.alert?.level ?? "CLEAR";
  return level === "WARNING" || level === "CONFIRMED" ? "escalate" : "hold";
};

const routeAfterValidation = (state: RahatStateType) => {
  const validation = state.validation;
  if (validation?.status === "PASSED") return "to_review";
  return (validation?.attempts ?? 0) >= VALIDATION_MAX_ATTEMPTS ? "blocked" : "revise";
};

const routeAfterReview = (state: RahatStateType) => {
  switch (state.review.lastDecision ?? state.review.status) {
    case "APPROVED":
      return "release";
    case "REJECTED":
      return "reject";
    case "CHANGES_REQUESTED":
      return "revise";
    default:
      return "reject";
  }
};

function buildGraph() {
  return new StateGraph(RahatState)
    .addNode("ingest_signals", ingestSignals)
    .addNode("fuse_and_score", fuseAndScore)
    .addNode("log_and_wait", logAndWait)
    .addNode("verify_with_satellite", verifyWithSatellite)
    .addNode("estimate_impact", estimateImpact)
    .addNode("build_budget", buildBudget)
    .addNode("validate_budget", validateBudget)
    .addNode("officer_review", officerReview)
    .addNode("apply_officer_feedback", applyOfficerFeedback)
    .addNode("publish_to_chain", publishToChain)
    .addEdge(START, "ingest_signals")
    .addEdge("ingest_signals", "fuse_and_score")
    .addConditionalEdges("fuse_and_score", routeAfterFuse, {
      hold: "log_and_wait",
      escalate: "verify_with_satellite",
    })
    .addEdge("log_and_wait", END)
    .addEdge("verify_with_satellite", "estimate_impact")
    .addEdge("estimate_impact", "build_budget")
    .addEdge("build_budget", "validate_budget")
    .addConditionalEdges("validate_budget", routeAfterValidation, {
      to_review: "officer_review",
      revise: "build_budget",
      blocked: END,
    })
    .addConditionalEdges("officer_review", routeAfterReview, {
      release: "publish_to_chain",
      reject: END,
      revise: "apply_officer_feedback",
    })
    .addEdge("apply_officer_feedback", "build_budget")
    .addEdge("publish_to_chain", END)
    .compile({ checkpointer: getCheckpointer() });
}

const globalForGraph = globalThis as unknown as {
  rahatCheckpointer?: MemorySaver;
  rahatGraph?: ReturnType<typeof buildGraph>;
};

/** MemorySaver for the hackathon; production swaps PostgresSaver here. */
function getCheckpointer(): MemorySaver {
  if (!globalForGraph.rahatCheckpointer) {
    globalForGraph.rahatCheckpointer = new MemorySaver();
  }
  return globalForGraph.rahatCheckpointer;
}

export function getRahatGraph() {
  if (!globalForGraph.rahatGraph) {
    globalForGraph.rahatGraph = buildGraph();
  }
  return globalForGraph.rahatGraph;
}

export interface StartRunInput {
  eventId?: string;
  basinId?: string;
  inputOverrides?: Record<string, number>;
}

export type RunStatus = "AWAITING_REVIEW" | "REVISED_AWAITING_REVIEW" | "PUBLISHED" | "REJECTED" | "HOLDING" | "BLOCKED";

const configFor = (threadId: string) => ({ configurable: { thread_id: threadId } });

function summarize(values: RahatStateType): { status: RunStatus; next: string[]; interrupts: unknown[] } {
  const graph = getRahatGraph();
  void graph;
  const level = values.alert?.level ?? "CLEAR";
  if (values.review.status === "PUBLISHED") return { status: "PUBLISHED", next: [], interrupts: [] };
  if (values.review.lastDecision === "REJECTED") return { status: "REJECTED", next: [], interrupts: [] };
  if (values.review.status === "PENDING" && !values.budget) {
    return { status: "HOLDING", next: [], interrupts: [] };
  }
  if (values.validation?.status === "FAILED" && (values.validation.attempts ?? 0) >= VALIDATION_MAX_ATTEMPTS) {
    return { status: "BLOCKED", next: [], interrupts: [] };
  }
  if (level === "CLEAR" || level === "WATCH") {
    if (!values.budget) return { status: "HOLDING", next: [], interrupts: [] };
  }
  // Default when the run stopped at the officer_review interrupt.
  return {
    status: values.review.revision > 0 ? "REVISED_AWAITING_REVIEW" : "AWAITING_REVIEW",
    next: [],
    interrupts: [{ type: "officer_review", node: "officer_review" }],
  };
}

export interface RunHandle {
  threadId: string;
  status: RunStatus;
  interruptPayload: unknown | null;
  state: RahatStateType;
}

async function snapshot(threadId: string): Promise<RunHandle | null> {
  const graph = getRahatGraph();
  const config = configFor(threadId) as never;
  const snap = (await graph.getState(config)) as unknown as {
    values: RahatStateType;
    next: string[];
    tasks: { name: string; interrupts: unknown[] }[];
  };
  if (!snap?.values?.eventId) return null;

  const interruptTask = snap.tasks?.find((t) => t.interrupts?.length);
  const summary = summarize(snap.values);
  const interruptPayload = interruptTask
    ? (interruptTask.interrupts?.[0] as { value?: unknown } | undefined)?.value ?? null
    : null;

  return {
    threadId,
    status: summary.status,
    interruptPayload,
    state: snap.values,
  };
}

/** Kick off a full detection → budget → review-pause run. */
export async function startRun(input: StartRunInput = {}): Promise<RunHandle> {
  const graph = getRahatGraph();
  const threadId = input.eventId
    ? `rahat-${input.eventId}`
    : `rahat-${Date.now().toString(36)}`;

  const state: Partial<RahatStateType> = {
    eventId: input.eventId ?? `fl-2026-${(input.basinId ?? "brahmaputra")}-${new Date().toISOString().slice(0, 10)}`,
    basinId: input.basinId ?? "brahmaputra",
    regionLabel: input.basinId ?? "brahmaputra",
    signals: {
      readings: [],
      ingestedAt: "",
      inputOverrides: input.inputOverrides ?? {},
    },
  };

  for (let attempt = 0; attempt < 50; attempt++) {
    const candidate = attempt === 0 ? threadId : `${threadId}-${attempt}`;
    const existing = await snapshot(candidate);
    if (!existing) {
      await graph.invoke(state, configFor(candidate) as never);
      const handle = await snapshot(candidate);
      if (!handle) throw new Error("Graph run produced no state");
      return handle;
    }
  }
  throw new Error("Unable to allocate a thread id");
}

/** Resume a paused run with the officer committee's decision. */
export async function resumeRun(
  threadId: string,
  decision: {
    decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";
    officerId: string;
    officerName: string;
    role: string;
    comment?: string;
  }
): Promise<RunHandle> {
  const graph = getRahatGraph();
  const existing = await snapshot(threadId);
  if (!existing) throw new Error(`Unknown thread: ${threadId}`);

  await graph.invoke(new Command({ resume: decision } as never), configFor(threadId) as never);
  const handle = await snapshot(threadId);
  if (!handle) throw new Error("Resume produced no state");
  return handle;
}

export async function getRunStatus(threadId: string): Promise<RunHandle | null> {
  return snapshot(threadId);
}

/** JSON-safe projection of graph state for HTTP responses. */
export function serializeState(state: RahatStateType | Record<string, unknown>): unknown {
  return JSON.parse(
    JSON.stringify(state, (_key, value) => {
      if (typeof value === "bigint") return value.toString();
      if (value === undefined) return null;
      return value;
    })
  );
}

/** Small typed re-export so route handlers never import LangGraph directly. */
export type { RahatStateType };
export { RahatState as RahatStateAnnotation, Annotation as StateAnnotation };
