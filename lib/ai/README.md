# Rahat LangGraph AI workflow

Implementation of the graph described in [`ProjectInfo/Rahat_System_Spec.md`](../../ProjectInfo/Rahat_System_Spec.md) section 5, built with **LangGraph.js** so it lives inside the Next.js codebase and shares types with `lib/`.

```
START → ingest_signals → fuse_and_score ─┬─ clear/watch → log_and_wait → END
                                         └─ warning/confirmed
        → verify_with_satellite → estimate_impact → build_budget
        → validate_budget ─┬─ fails → build_budget            (max 3 attempts)
                           └─ passes → officer_review ◆ INTERRUPT
officer_review ─┬─ APPROVED         → publish_to_chain → END
                ├─ REJECTED         → END
                └─ CHANGES_REQUESTED → apply_officer_feedback → build_budget
                                         (re-pauses for review of the new version)
```

A second small graph in [`triage.ts`](./triage.ts) handles citizen grievances:
translate → classify → de-duplicate → link to a line item (spec 8.2).

## Safety boundaries (honoured in code)

| Rule | Where |
|---|---|
| The AI proposes, humans decide | `officer_review` node calls `interrupt()`; the run stays paused until the review console resumes the thread |
| AI never holds a key that moves money | `publish_to_chain` only *submits* the approved package; N-of-M officer co-signatures still gate release (relayer only posts hashes/proposals) |
| Numbers come from deterministic code | quantities = `computeExposure × SDRF_NORMS_CATALOG`; LLM only narrates (`budget-agent.ts`) and the LLM must call the whitelist `calculator` tool for any arithmetic |
| On-chain only where records matter | detection hash anchored at WARNING (`fuse.ts`), budget doc hash + line-item Merkle root in `publish.ts` — everything else in Prisma/Postgres |

## Files

| File | Node |
|---|---|
| `state.ts` | `RahatState` typed state with per-field reducers |
| `ingest.ts` | `ingest_signals` — signal feeds + telemetry hash (simulated, honestly labelled) |
| `fuse.ts` | `fuse_and_score` — logistic fusion + hysteresis alert machine + `DetectionRegistry` anchor |
| `satellite.ts` | `verify_with_satellite` — Sentinel-1 pass → water mask → DEM depth |
| `impact.ts` | `estimate_impact` — P10/P50/P90 exposure |
| `budget.ts` | `build_budget` — deterministic draft + officer overrides + version diff |
| `budget-agent.ts` | LLM tool-calling narrative for the budget (calculator + SDRF norms lookup tools) |
| `validation.ts` | `validate_budget` — rule checks that block bad packages |
| `review.ts` | `officer_review` — the `interrupt()` node |
| `feedback.ts` | `apply_officer_feedback` — free text → structured overrides (LLM, keyword fallback) |
| `publish.ts` | `publish_to_chain` — budget proposal submission |
| `graph.ts` | assembly, checkpointer, `startRun` / `resumeRun` / `getRunStatus` |
| `triage.ts` | grievance triage graph |

## Driving it

Without a model key or chain env vars everything still runs in
deterministic-fallback mode (narratives become templates, chain entries are
marked `simulated`) — which is exactly what the hackathon demo needs and what
is stated openly on stage.

```bash
corepack pnpm ai:demo          # full unattended walkthrough incl. triage
curl -X POST localhost:8000/api/ai/workflow \
     -H 'content-type: application/json' \
     -d '{"action":"start","basinId":"brahmaputra"}'
# → paused at officer_review with the complete review package
curl -X POST localhost:8000/api/ai/workflow \
     -H 'content-type: application/json' \
     -d '{"action":"resume","threadId":"<id>","decision":"CHANGES_REQUESTED",
          "officerName":"Dr Anurag Sharma","role":"ASDMA CTA",
          "comment":"Camp feeding should be 10 days, and use the P90 footing"}'
# → apply_officer_feedback → build_budget v2 → validate → pauses again
```

`GET /api/ai/workflow?threadId=…` returns the live state, timeline and
interrupt payload for the review screen; `POST /api/ai/triage` returns the
structured triage (category, translate, duplicate, linked line items) whose
hash — never the raw text — anchors to `GrievanceRegistry`.

## Production notes

- Swap `MemorySaver` in `graph.ts` for `PostgresSaver` (a durable checkpointer
  is required so runs can pause for days, per spec 5.3).
- Add `OPENAI_API_KEY` to enable real LLM narration/translation; every node
  keeps its deterministic fallback either way.
- Two scripts to remember: `recordDetection` anchors at WARNING automatically;
  the relayer key cannot approve, allocate or release anything.
