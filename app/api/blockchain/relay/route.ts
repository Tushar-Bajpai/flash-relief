import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { submitRelayerTransaction } from "@/lib/blockchain/relayer";

export const runtime = "nodejs";

function isAuthorized(req: NextRequest): boolean {
  const configuredSecret = process.env.BLOCKCHAIN_RELAYER_SECRET;
  const requestSecret = req.headers.get("x-blockchain-relayer-secret");
  if (!configuredSecret || !requestSecret) return false;
  const configured = Buffer.from(configuredSecret);
  const provided = Buffer.from(requestSecret);
  return configured.length === provided.length && crypto.timingSafeEqual(configured, provided);
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { error: "Unauthorized blockchain relayer request." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const page = body.page;
    const action = body.action;
    const payload = body.payload;
    if (![1, 2, 3, 4, 5].includes(page)) {
      return NextResponse.json({ error: "page must be an integer from 1 to 5." }, { status: 400 });
    }
    if (typeof action !== "string" || action.length === 0) {
      return NextResponse.json({ error: "action is required." }, { status: 400 });
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return NextResponse.json(
        { error: "payload must be a JSON object." },
        { status: 400 }
      );
    }

    const receipt = await submitRelayerTransaction({ page, action, payload });

    return NextResponse.json({
      success: true,
      receipt: {
        ...receipt,
        network: "Polygon Amoy",
        explorerUrl: `https://amoy.polygonscan.com/tx/${receipt.txHash}`,
        timestamp: new Date().toISOString(),
        gasSponsored: true,
      },
    });
  } catch (err) {
    console.error("[Blockchain Relayer API] Error:", err);
    return NextResponse.json(
      {
        error: "Failed to submit Polygon relayer transaction.",
        message: err instanceof Error ? err.message : "Unknown relayer error",
      },
      { status: 500 }
    );
  }
}
