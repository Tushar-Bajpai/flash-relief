/**
 * publish_to_chain — the safety boundary node (spec 5.5, 7).
 *
 * The node ONLY submits the approved package to the officers' signing flow:
 * it proposes the budget (hash + totals) so officers can co-sign with N-of-M
 * quorum off-chain and on-chain afterwards. The relayer key used here cannot
 * approve, allocate or release anything.
 */
import type { RahatStateType, ChainEntry } from "./state";
import { hashPayload, computeLineItemsMerkleRoot } from "@/lib/blockchain/public-notebook";

export async function publishToChain(
  state: RahatStateType
): Promise<Partial<RahatStateType>> {
  const budget = state.budget;
  const now = new Date().toISOString();
  if (!budget) throw new Error("publish_to_chain reached with no budget package");

  const lineItemsRoot = computeLineItemsMerkleRoot(
    budget.lines.map((l) => ({ code: l.normCode, paise: Number(l.totalCostPaise) }))
  );
  const documentHash = hashPayload({
    eventId: state.eventId,
    version: budget.version,
    totalRupees: budget.totalRupees,
    lineItemsRoot,
  });

  const envReady = Boolean(
    process.env.POLYGON_RELAYER_PRIVATE_KEY &&
    process.env.POLYGON_BUDGET_QUORUM_ADDRESS
  );

  const at = now;
  let entries: ChainEntry[] = [];
  let budgetOnChainId: string | null = null;

  if (!envReady) {
    // Simulated proposal — same hashes, no key moved, openly marked simulated.
    budgetOnChainId = Number(
      BigInt("0x" + documentHash.slice(2, 10)) % BigInt("100000")
    ).toString();
    entries = [
      {
        contract: "BudgetRegistry",
        action: "proposeBudget(simulated)",
        txHash: documentHash,
        blockNumber: "0",
        at,
        mode: "simulated",
      },
    ];
  } else {
    try {
      const { submitRelayerTransaction } = await import("@/lib/blockchain/relayer");
      const receipt = await submitRelayerTransaction({
        page: 2,
        action: "PROPOSE_BUDGET",
        payload: {
          eventId: state.eventId,
          totalPaise: String(budget.totalRupees * 100),
          lineItemsRoot,
          budgetDocumentCid: `bafybei${documentHash.slice(2, 58)}`,
        },
      });
      budgetOnChainId = String(receipt.blockNumber);
      entries = [
        {
          contract: "BudgetRegistry",
          action: "proposeBudget",
          txHash: receipt.txHash,
          blockNumber: receipt.blockNumber,
          at,
          mode: "onchain",
        },
      ];
    } catch (err) {
      console.error("[publish_to_chain] proposeBudget failed:", err);
      return {
        review: { ...state.review, status: "BLOCKED" },
        timeline: [
          {
            at,
            step: "publish_to_chain",
            detail: `Budget proposal submission failed: ${(err as Error).message}. Officers can retry; nothing was moved on-chain.`,
          },
        ],
      };
    }
  }

  return {
    review: { ...state.review, status: "PUBLISHED" },
    chain: {
      mode: entries[0].mode === "onchain" ? "onchain" : "simulated",
      budgetOnChainId,
      entries: entries as ChainEntry[],
    },
    timeline: [
      {
        at,
        step: "publish_to_chain",
        detail: `Budget v${budget.version} (₹${budget.totalCrores} Cr) submitted to ${entries[0].contract} — doc hash ${documentHash.slice(0, 18)}…, line-items Merkle root ${lineItemsRoot.slice(0, 14)}…. Awaiting N-of-M officer co-signature. ${entries[0].mode === "simulated" ? "(Simulated ledger entry for the demo.)" : ""}`,
      },
    ],
  };
}
