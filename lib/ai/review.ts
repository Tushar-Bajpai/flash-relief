/**
 * officer_review — the human-in-the-loop interrupt node (spec 5.3, 6).
 *
 * The node rebuilds its review package deterministically from state on every
 * pass (resume restarts the node from its beginning), then calls interrupt().
 * The graph run stays paused — possibly for days — until the web app resumes
 * the same thread_id with Command({ resume: {...} }).
 *
 * The payload is JSON-serialisable (BigInt paise already stringified) and is
 * NOT wrapped in try/except, per the LangGraph persistence rules.
 */
import { interrupt } from "@langchain/langgraph";
import type { RahatStateType, Decision } from "./state";

export const REVIEW_PACKAGE_VERSION = 1;

export function decidedComment(
  state: RahatStateType,
  decision: Decision,
  officer: { officerId: string; officerName: string; role: string },
  comment: string
) {
  return {
    officerId: officer.officerId,
    officerName: officer.officerName,
    role: officer.role,
    decision,
    comment,
    at: new Date().toISOString(),
  };
}

export async function officerReview(
  state: RahatStateType
): Promise<Partial<RahatStateType>> {
  const budget = state.budget;
  if (!budget) throw new Error("officer_review reached with no budget package");

  // Everything before interrupt() must be pure & repeatable.
  const reviewPayload = {
    packageVersion: REVIEW_PACKAGE_VERSION,
    eventId: state.eventId,
    basin: state.regionLabel ?? state.basinId,
    alert: {
      level: state.alert?.level,
      probability: state.alert?.probability,
      dataHash: state.alert?.dataHash,
      firstWarningAt: state.alert?.firstWarningAt,
      detectionTx: state.chain.entries
        .filter((e) => e.contract === "DetectionRegistry")
        .map((e) => ({ mode: e.mode, txHash: e.txHash, block: e.blockNumber })),
    },
    budget: {
      version: budget.version,
      normVersion: budget.normVersion,
      percentile: budget.percentile,
      totalRupees: budget.totalRupees,
      totalCrores: budget.totalCrores,
      lines: budget.lines.map((line) => ({
        id: line.id,
        normCode: line.normCode,
        description: line.description,
        department: line.departmentName,
        quantity: line.quantity,
        unit: line.unitLabel,
        ratePerUnit: line.ratePerUnit,
        totalRupees: line.totalCostRupees,
        formula: line.formulaString,
        explanation: line.explanation,
        range: line.percentileRange,
      })),
      summary: budget.aiExplanation,
    },
    validation: state.validation,
    revision: state.review.revision,
    instructions: {
      decisions: ["APPROVED", "CHANGES_REQUESTED", "REJECTED"],
      commentHint:
        "For changes, describe them freely, e.g. 'camp feeding should be 10 days, block B is cut off' or 'use the P90 worst-case' or 'increase cattle fodder by 20%'.",
    },
  };

  const decision = interrupt(applyFormatter(reviewPayload)) as
    | { decision: Decision; officerId: string; officerName: string; role: string; comment: string }
    | undefined;

  if (!decision?.decision) {
    throw new Error("officer_review resumed without a decision payload");
  }

  const comment = decidedComment(
    state,
    decision.decision,
    { officerId: decision.officerId, officerName: decision.officerName, role: decision.role },
    decision.comment ?? ""
  );

  return {
    review: {
      ...state.review,
      status: decision.decision,
      lastDecision: decision.decision,
      comments: [...state.review.comments, comment],
    },
    timeline: [
      {
        at: comment.at,
        step: "officer_review",
        detail: `${decision.officerName} (${decision.role}) → ${decision.decision}${decision.comment ? `: “${decision.comment}”` : ""}`,
      },
    ],
  };
}

/** Removes any non-JSON-safe value defensively (bigint etc.). */
function applyFormatter<T>(payload: T): T {
  return JSON.parse(
    JSON.stringify(payload, (_key, value) => (typeof value === "bigint" ? value.toString() : value))
  );
}
