/**
 * log_and_wait — the "clear or watch" branch. Nothing moves: no impact model,
 * no budget, no on-chain budget proposal. The event is only logged for the
 * public timeline, exactly as the spec's flowchart shows.
 */
import type { RahatStateType } from "./state";

export function logAndWait(state: RahatStateType): Partial<RahatStateType> {
  const at = new Date().toISOString();
  return {
    timeline: [
      {
        at,
        step: "log_and_wait",
        detail:
          state.alert?.level === "WATCH"
            ? `WATCH held at p=${state.alert.probability}. Re-scoring next 30-minute cycle.`
            : `Clear (${state.alert?.level ?? "CLEAR"}). No alert emitted.`,
      },
    ],
  };
}
