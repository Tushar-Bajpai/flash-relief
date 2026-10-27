/**
 * End-to-end LangGraph walkthrough for the demo stage.
 *
 * Runs the exact spec section 5.2 flow without a deployed chain or an LLM key:
 *   start (detect → fuse → satellite → impact → budget → validate)
 *   → officer requests changes → v2 built → officer approves → publish
 *   → plus one grievance through the triage graph.
 *
 * Usage: corepack pnpm ai:demo   (or: npx tsx scripts/ai-walkthrough.ts)
 */
import { startRun, resumeRun, getRunStatus, serializeState, type RunHandle } from "@/lib/ai/graph";
import { runTriage } from "@/lib/ai/triage";
import { isLlmConfigured } from "@/lib/ai/llm";

function line(label: string, value: unknown) {
  console.log(`  ${label.padEnd(38, " ")} ${String(value)}`);
}

function printStage(handle: RunHandle) {
  const state = serializeState(handle.state) as Record<string, any>;
  console.log(`\n=== ${handle.threadId} — status ${handle.status} ===`);
  if (state?.alert) line("Alert", `${state.alert.level} (p=${state.alert.probability})`);
  if (state?.satellite) {
    line("SAR confirmation", `${state.satellite.confirmed ? "CONFIRMED" : "inconclusive"} — ${state.satellite.detectedWaterAreaSqKm} km², depth ${state.satellite.meanFloodDepthMeters} m`);
  }
  if (state?.budget) {
    line("Budget", `v${state.budget.version} @ ${state.budget.percentile} — ₹${state.budget.totalCrores} Cr across ${state.budget.lines.length} SDRF lines`);
  }
  if (state?.validation) line("Validator", state.validation.status);
  line("Chain", `${state?.chain?.mode} — ${state?.chain?.entries?.length ?? 0} ledger entries`);
  console.log("  Timeline:");
  for (const entry of (state?.timeline ?? []) as { at: string; step: string; detail: string }[]) {
    console.log(`   • [${entry.step}] ${entry.detail}`);
  }
}

async function main() {
  console.log(`Rahat LangGraph walkthrough (LLM: ${isLlmConfigured() ? "live model" : "deterministic fallback"})\n`);

  // 1. The AI proposes: detection → impact → budget → validator → officer pause.
  const handle = await startRun({ basinId: "brahmaputra" });
  printStage(handle);
  if (!handle.interruptPayload) {
    console.log("\nNo officer review interrupt was reached (alert stayed below WARNING).");
    return;
  }
  console.log("\n⏸  Graph is paused at officer_review — a humanitarian could stay there for days.");

  // 2. Officer requests changes: free text → deterministic overrides → v2.
  const revised = await resumeRun(handle.threadId, {
    decision: "CHANGES_REQUESTED",
    officerId: "officer-finance",
    officerName: "Smt. Mridula Baruah, ACS",
    role: "Joint Secretary (Finance), SDRF Nodal Officer",
    comment: "Extend gratuitous relief camp feeding from 7 days to 10 days due to delayed floodwater recession, and increase cattle fodder supply by 20%.",
  });
  printStage(revised);

  // 3. Second officer approves → publish_to_chain (simulated ledger entry here).
  const released = await resumeRun(handle.threadId, {
    decision: "APPROVED",
    officerId: "officer-dm",
    officerName: "Shri Bikram Kairi, IAS",
    role: "District Magistrate & DDMA Chairman",
    comment: "v2 verified against field distress reports. Christened for quorum sign-off.",
  });
  printStage(released);
  line("Budget on-chain id", (serializeState(released.state) as any)?.chain?.budgetOnChainId);

  // 4. The public can check the result: one grievance through the triage graph.
  console.log("\n=== Grievance triage graph ===");
  const grievance = await runTriage({
    text: "पानी जा गया लेकिन राशन नहीं मिला, कैंप में भोजन की कमी है और पानी के सैंपल सड़े हुए लग रहे हैं।",
  });
  line("Language", grievance.languageDetected);
  line("Category", grievance.category);
  line("Urgency", grievance.urgency);
  line("Duplicate", grievance.duplicateOf ?? "unique");
  line("Linked norms", grievance.linkedNormCodes.join(", ") || "none");
  line("Grievance hash (anchor this)", grievance.grievanceHash);

  const final = await getRunStatus(handle.threadId);
  console.log(`\nPost-run status: ${final?.status}`);
}

main().catch((err) => {
  console.error("\nWalkthrough failed:", err);
  process.exit(1);
});
