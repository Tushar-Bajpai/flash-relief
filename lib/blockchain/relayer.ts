import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  stringToHex,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygonAmoy } from "viem/chains";

const detectionAbi = [
  {
    type: "function",
    name: "recordDetection",
    stateMutability: "nonpayable",
    inputs: [
      { name: "eventId", type: "bytes32" },
      { name: "alertLevel", type: "uint8" },
      { name: "probabilityBasis", type: "uint16" },
      { name: "leadTimeSeconds", type: "uint32" },
      { name: "telemetryHash", type: "bytes32" },
      { name: "satelliteMaskCid", type: "string" },
    ],
    outputs: [{ name: "recordFingerprint", type: "bytes32" }],
  },
] as const;

const budgetAbi = [
  {
    type: "function",
    name: "proposeBudget",
    stateMutability: "nonpayable",
    inputs: [
      { name: "eventId", type: "bytes32" },
      { name: "totalPaise", type: "uint256" },
      { name: "lineItemsRoot", type: "bytes32" },
      { name: "budgetDocumentCid", type: "string" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "signBudget",
    stateMutability: "nonpayable",
    inputs: [
      { name: "eventId", type: "bytes32" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
  },
] as const;

const escrowAbi = [
  {
    type: "function",
    name: "createVault",
    stateMutability: "nonpayable",
    inputs: [
      { name: "eventId", type: "bytes32" },
      { name: "departmentId", type: "bytes32" },
      { name: "departmentName", type: "string" },
      { name: "allocatedPaise", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "recordDisbursement",
    stateMutability: "nonpayable",
    inputs: [
      { name: "eventId", type: "bytes32" },
      { name: "departmentId", type: "bytes32" },
      { name: "tranchePaise", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "attestDeliveryProof",
    stateMutability: "nonpayable",
    inputs: [
      { name: "eventId", type: "bytes32" },
      { name: "departmentId", type: "bytes32" },
      { name: "verifiedPaise", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

const evidenceAbi = [
  {
    type: "function",
    name: "recordProof",
    stateMutability: "nonpayable",
    inputs: [
      { name: "lineItemId", type: "bytes32" },
      { name: "itemType", type: "string" },
      { name: "vendorName", type: "string" },
      { name: "ipfsCid", type: "string" },
      { name: "latitudeE6", type: "int32" },
      { name: "longitudeE6", type: "int32" },
      { name: "beneficiaryCount", type: "uint32" },
      { name: "deliveredPaise", type: "uint256" },
    ],
    outputs: [{ name: "proofHash", type: "bytes32" }],
  },
] as const;

const grievanceAbi = [
  {
    type: "function",
    name: "fileGrievance",
    stateMutability: "nonpayable",
    inputs: [
      { name: "trackingId", type: "bytes32" },
      { name: "citizenHash", type: "bytes32" },
      { name: "category", type: "uint8" },
      { name: "village", type: "string" },
      { name: "issueHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "resolveGrievance",
    stateMutability: "nonpayable",
    inputs: [
      { name: "trackingId", type: "bytes32" },
      { name: "notes", type: "string" },
      { name: "evidenceCid", type: "string" },
    ],
    outputs: [],
  },
] as const;

type Page = 1 | 2 | 3 | 4 | 5;

export interface RelayerRequest {
  page: Page;
  action: string;
  payload: Record<string, unknown>;
}

export interface RelayerReceipt {
  txHash: Hex;
  blockNumber: string;
  contractAddress: Address;
  relayerAddress: Address;
  chainId: number;
  gasUsed: string;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required blockchain environment variable: ${name}`);
  return value;
}

function bytes32(value: unknown, field: string): Hex {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${field} must be a non-empty string`);
  }
  if (/^0x[0-9a-fA-F]{64}$/.test(value)) return value as Hex;
  return keccak256(stringToHex(value));
}

function numberValue(value: unknown, field: string, integer = true): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || (integer && !Number.isInteger(parsed))) {
    throw new Error(`${field} must be a finite ${integer ? "integer" : "number"}`);
  }
  return parsed;
}

function bigintValue(value: unknown, field: string): bigint {
  if (typeof value !== "string" && typeof value !== "number" && typeof value !== "bigint") {
    throw new Error(`${field} must be an integer amount`);
  }
  try {
    const parsed = BigInt(value);
    if (parsed < BigInt(0)) throw new Error();
    return parsed;
  } catch {
    throw new Error(`${field} must be a non-negative integer amount`);
  }
}

function textValue(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${field} must be a non-empty string`);
  }
  return value;
}

function categoryValue(value: unknown): number {
  if (typeof value === "number") return numberValue(value, "category");
  const categories = ["RATION", "SHELTER", "MEDICAL", "INFRA", "GENERAL"];
  const index = categories.indexOf(String(value).toUpperCase());
  if (index < 0) throw new Error("category must be RATION, SHELTER, MEDICAL, INFRA, or GENERAL");
  return index;
}

export async function submitRelayerTransaction(
  request: RelayerRequest,
): Promise<RelayerReceipt> {
  const rpcUrl = requiredEnv("POLYGON_AMOY_RPC_URL");
  const privateKey = requiredEnv("POLYGON_RELAYER_PRIVATE_KEY") as Hex;
  if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
    throw new Error("POLYGON_RELAYER_PRIVATE_KEY must be a 32-byte hex private key");
  }

  const addresses: Record<Page, Address> = {
    1: requiredEnv("POLYGON_DETECTION_REGISTRY_ADDRESS") as Address,
    2: requiredEnv("POLYGON_BUDGET_QUORUM_ADDRESS") as Address,
    3: requiredEnv("POLYGON_ESCROW_LEDGER_ADDRESS") as Address,
    4: requiredEnv("POLYGON_DELIVERY_EVIDENCE_ADDRESS") as Address,
    5: requiredEnv("POLYGON_GRIEVANCE_SLA_ADDRESS") as Address,
  };
  const account = privateKeyToAccount(privateKey);
  const transport = http(rpcUrl);
  const walletClient = createWalletClient({ account, chain: polygonAmoy, transport });
  const publicClient = createPublicClient({ chain: polygonAmoy, transport });
  const p = request.payload;
  let hash: Hex;

  if (request.page === 1) {
    const levels = ["CLEAR", "WATCH", "WARNING", "CONFIRMED"];
    const level = typeof p.alertLevel === "number"
      ? numberValue(p.alertLevel, "alertLevel")
      : levels.indexOf(String(p.alertLevel).toUpperCase());
    if (level < 0 || level > 3) throw new Error("alertLevel must be CLEAR, WATCH, WARNING, or CONFIRMED");
    hash = await walletClient.writeContract({
      address: addresses[1],
      abi: detectionAbi,
      functionName: "recordDetection",
      args: [
        bytes32(p.eventId, "eventId"),
        level,
        numberValue(p.probabilityBasis, "probabilityBasis"),
        numberValue(p.leadTimeSeconds, "leadTimeSeconds"),
        bytes32(p.telemetryHash, "telemetryHash"),
        textValue(p.satelliteMaskCid, "satelliteMaskCid"),
      ],
    });
  } else if (request.page === 2) {
    const eventId = bytes32(p.eventId, "eventId");
    if (request.action === "SIGN_BUDGET") {
      hash = await walletClient.writeContract({
        address: addresses[2],
        abi: budgetAbi,
        functionName: "signBudget",
        args: [eventId, textValue(p.signature, "signature") as Hex],
      });
    } else {
      hash = await walletClient.writeContract({
        address: addresses[2],
        abi: budgetAbi,
        functionName: "proposeBudget",
        args: [
          eventId,
          bigintValue(p.totalPaise, "totalPaise"),
          bytes32(p.lineItemsRoot, "lineItemsRoot"),
          textValue(p.budgetDocumentCid, "budgetDocumentCid"),
        ],
      });
    }
  } else if (request.page === 3) {
    const eventId = bytes32(p.eventId, "eventId");
    const departmentId = bytes32(p.departmentId, "departmentId");
    const functionName = request.action;
    if (functionName === "CREATE_VAULT") {
      hash = await walletClient.writeContract({
        address: addresses[3],
        abi: escrowAbi,
        functionName: "createVault",
        args: [eventId, departmentId, textValue(p.departmentName, "departmentName"), bigintValue(p.allocatedPaise, "allocatedPaise")],
      });
    } else if (functionName === "RECORD_DISBURSEMENT") {
      hash = await walletClient.writeContract({
        address: addresses[3],
        abi: escrowAbi,
        functionName: "recordDisbursement",
        args: [eventId, departmentId, bigintValue(p.tranchePaise, "tranchePaise")],
      });
    } else if (functionName === "ATTEST_DELIVERY") {
      hash = await walletClient.writeContract({
        address: addresses[3],
        abi: escrowAbi,
        functionName: "attestDeliveryProof",
        args: [eventId, departmentId, bigintValue(p.verifiedPaise, "verifiedPaise")],
      });
    } else {
      throw new Error("Unsupported page 3 action");
    }
  } else if (request.page === 4) {
    hash = await walletClient.writeContract({
      address: addresses[4],
      abi: evidenceAbi,
      functionName: "recordProof",
      args: [
        bytes32(p.lineItemId, "lineItemId"),
        textValue(p.itemType, "itemType"),
        textValue(p.vendorName, "vendorName"),
        textValue(p.ipfsCid, "ipfsCid"),
        numberValue(p.latitudeE6, "latitudeE6"),
        numberValue(p.longitudeE6, "longitudeE6"),
        numberValue(p.beneficiaryCount, "beneficiaryCount"),
        bigintValue(p.deliveredPaise, "deliveredPaise"),
      ],
    });
  } else {
    const trackingId = bytes32(p.trackingId, "trackingId");
    if (request.action === "RESOLVE_GRIEVANCE") {
      hash = await walletClient.writeContract({
        address: addresses[5],
        abi: grievanceAbi,
        functionName: "resolveGrievance",
        args: [trackingId, textValue(p.notes, "notes"), textValue(p.evidenceCid, "evidenceCid")],
      });
    } else {
      hash = await walletClient.writeContract({
        address: addresses[5],
        abi: grievanceAbi,
        functionName: "fileGrievance",
        args: [
          trackingId,
          bytes32(p.citizenHash, "citizenHash"),
          categoryValue(p.category),
          textValue(p.village, "village"),
          bytes32(p.issueHash, "issueHash"),
        ],
      });
    }
  }

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return {
    txHash: hash,
    blockNumber: receipt.blockNumber.toString(),
    contractAddress: addresses[request.page],
    relayerAddress: account.address,
    chainId: polygonAmoy.id,
    gasUsed: receipt.gasUsed.toString(),
  };
}
