import crypto from "crypto";

export interface PublicNotebookEntry {
  page: 1 | 2 | 3 | 4 | 5;
  pageName: string;
  contractName: string;
  contractAddress: string;
  action: string;
  eventId: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  dataPayload: Record<string, any>;
  publicAuditProof: string;
  verified: boolean;
}

export const POLYGON_NOTEBOOK_CONFIG = {
  networkName: "Polygon PoS (Amoy Testnet / Mainnet)",
  chainId: 80002, // Polygon Amoy (137 for Mainnet)
  blockTimeSeconds: 2.1,
  contracts: {
    page1Detection: {
      name: "DetectionRegistry.sol",
      address: "0x3Fa90B8206E88B98fcfC3dD6b6b71C8F01bA41a1",
      role: "Automated Early Warning & Lead-Time Notarization",
    },
    page2Budget: {
      name: "BudgetQuorum.sol",
      address: "0x892a7eB52D97f0203Db6287c29661448bdfb8281",
      role: "3-of-3 Officer Quorum Consensus (IAS/NDMA/IDAS)",
    },
    page3Escrow: {
      name: "FundEscrowLedger.sol",
      address: "0x4c29Fa8394b9eE38bB1D5962f92476591C5c98d3",
      role: "Departmental Fund Locks & Anti-Diversion Vaults",
    },
    page4Evidence: {
      name: "DeliveryEvidence.sol",
      address: "0x12Fa942c759B4a8c99B61E0A272A5406d4eBc532",
      role: "The Third Number Audit (Delivered vs Disbursed)",
    },
    page5Grievance: {
      name: "GrievanceSLA.sol",
      address: "0x91Aa244795C642dEfb50849B0Ecfd97d0284b39E",
      role: "Citizen 48-Hour Statutory Grievance Countdown",
    },
  },
};

/**
 * Computes deterministic SHA-256 fingerprint for any JSON payload.
 */
export function hashPayload(payload: any): string {
  const serialized = typeof payload === "string" ? payload : JSON.stringify(payload);
  return `0x${crypto.createHash("sha256").update(serialized).digest("hex")}`;
}

/**
 * Computes a Merkle Root for an array of SDRF line items.
 */
export function computeLineItemsMerkleRoot(lineItems: { code: string; paise: number }[]): string {
  if (lineItems.length === 0) return hashPayload("EMPTY_ROOT");
  const leaves = lineItems.map((item) =>
    crypto.createHash("sha256").update(`${item.code}:${item.paise}`).digest("hex")
  );

  let currentLevel = leaves;
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
      const combined = crypto
        .createHash("sha256")
        .update(left + right)
        .digest("hex");
      nextLevel.push(combined);
    }
    currentLevel = nextLevel;
  }
  return `0x${currentLevel[0]}`;
}

/**
 * Baseline historical & live entries recorded on the Polygon Public Notebook.
 */
export const NOTEBOOK_ENTRIES_LEDGER: PublicNotebookEntry[] = [
  {
    page: 1,
    pageName: "Page 1: Detection Registry",
    contractName: "DetectionRegistry.sol",
    contractAddress: POLYGON_NOTEBOOK_CONFIG.contracts.page1Detection.address,
    action: "FLOOD_ALERT_NOTARIZED",
    eventId: "fl-2026-brahmaputra",
    txHash: "0x7a29e1c4a019482850bdf92476591c5c98d3fa8394b9ee38bb1d5962f9247659",
    blockNumber: 19482850,
    timestamp: "2026-10-26T03:42:18Z",
    dataPayload: {
      subBasin: "Majuli Island (Brahmaputra)",
      alertLevel: "CONFIRMED",
      probability: 0.91,
      leadTimeHours: 11.4,
      gpmRain72h: "184.2 mm",
      cwcStage: "105.94 m (+0.44m Warning)",
      glofasPeakDischarge: "48,200 m³/s",
      sentinelSarMaskCid: "bafybeicdx4af2057981de1ff4ef37c8f939d246a76c",
    },
    publicAuditProof: "Notarized 11.4 hours before first regional news media broadcast.",
    verified: true,
  },
  {
    page: 2,
    pageName: "Page 2: Budget Quorum",
    contractName: "BudgetQuorum.sol",
    contractAddress: POLYGON_NOTEBOOK_CONFIG.contracts.page2Budget.address,
    action: "BUDGET_QUORUM_FINALIZED",
    eventId: "fl-2026-brahmaputra",
    txHash: "0x892a7eb52d97f0203db6287c29661448bdfb82810a272a5406d4ebc5324c29fa",
    blockNumber: 19483410,
    timestamp: "2026-10-26T06:10:45Z",
    dataPayload: {
      totalBudgetPaise: "7350000000",
      totalCrores: "₹7.35 Cr",
      lineItemsRoot: "0x4b7891cf23a45e9089acbd7190f23e45781a90c421789bde1289456721098acb",
      quorumStatus: "3-of-3 Approved (100% Consensus)",
      signers: [
        { cadre: "IAS", officer: "Shri Pulak Mahanta", signature: "0x981a2f...410b" },
        { cadre: "NDMA", officer: "Dr. Sanjeev Kakoty", signature: "0x77c29d...512a" },
        { cadre: "IDAS", officer: "Smt. Mridula Baruah", signature: "0x19a28f...98fc" },
      ],
    },
    publicAuditProof: "Mathematical Merkle root of all 10 MHA SDRF line items permanently sealed.",
    verified: true,
  },
  {
    page: 3,
    pageName: "Page 3: Fund Escrow Ledger",
    contractName: "FundEscrowLedger.sol",
    contractAddress: POLYGON_NOTEBOOK_CONFIG.contracts.page3Escrow.address,
    action: "DEPARTMENTAL_VAULTS_LOCKED",
    eventId: "fl-2026-brahmaputra",
    txHash: "0x4c29fa8394b9ee38bb1d5962f92476591c5c98d33fa90b8206e88b98fcfc3dd6",
    blockNumber: 19483890,
    timestamp: "2026-10-26T07:15:30Z",
    dataPayload: {
      vaults: [
        { dept: "Food & Civil Supplies", allocated: "₹2.68 Cr", disbursed: "₹2.68 Cr" },
        { dept: "Revenue & Disaster Management", allocated: "₹2.10 Cr", disbursed: "₹2.10 Cr" },
        { dept: "Water Resources & PWD", allocated: "₹1.15 Cr", disbursed: "₹0.95 Cr" },
        { dept: "Health & Family Welfare", allocated: "₹0.72 Cr", disbursed: "₹0.72 Cr" },
        { dept: "Animal Husbandry & Veterinary", allocated: "₹0.70 Cr", disbursed: "₹0.50 Cr" },
      ],
      totalAllocated: "₹7.35 Cr",
      antiDiversionGuarantee: "Funds programmatically locked to SDRF norm codes.",
    },
    publicAuditProof: "Department allocations strictly restricted against diversion to general accounts.",
    verified: true,
  },
  {
    page: 4,
    pageName: "Page 4: Delivery Evidence",
    contractName: "DeliveryEvidence.sol",
    contractAddress: POLYGON_NOTEBOOK_CONFIG.contracts.page4Evidence.address,
    action: "FIELD_DELIVERY_PROOF_ANCHORED",
    eventId: "fl-2026-brahmaputra",
    txHash: "0x12fa942c759b4a8c99b61e0a272a5406d4ebc5327a29e1c4a019482850bdf924",
    blockNumber: 19486240,
    timestamp: "2026-10-26T14:48:10Z",
    dataPayload: {
      lineItem: "SDRF-01.A — Gratuitous Relief Camp Rations & Potable Water",
      vendor: "Assam State Civil Supplies Corp",
      beneficiaryCount: 4200,
      provenValue: "₹34,44,000",
      gpsGeotag: "27.4728° N, 94.9120° E (Majuli Camp #2)",
      ipfsProofCid: "bafybeicdx4a7kmmj9z38vx99qqwlp3k99d81z099x418dka098mzk41928",
    },
    publicAuditProof: "The Third Number: Proves delivery reached human beneficiaries on ground.",
    verified: true,
  },
  {
    page: 5,
    pageName: "Page 5: Grievance SLA Clock",
    contractName: "GrievanceSLA.sol",
    contractAddress: POLYGON_NOTEBOOK_CONFIG.contracts.page5Grievance.address,
    action: "CITIZEN_GRIEVANCE_REGISTERED",
    eventId: "fl-2026-brahmaputra",
    txHash: "0x91aa244795c642defb50849b0ecfd97d0284b39e892a7eb52d97f0203db6287c",
    blockNumber: 19488110,
    timestamp: "2026-10-26T16:22:04Z",
    dataPayload: {
      trackingId: "GRV-2026-081",
      village: "Jengraimukh, Majuli",
      category: "RATION_SHORTAGE",
      maskedReporter: "+91 94350 *** **345",
      slaClock: "48-Hour Statutory SLA Countdown Initiated",
      autoEscalationRule: "Escalates to DM if unresolved within 48h.",
    },
    publicAuditProof: "Tamper-proof SLA clock running on-chain; officers cannot delete ticket or stop clock.",
    verified: true,
  },
];
