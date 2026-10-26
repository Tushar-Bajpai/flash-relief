import { NextRequest, NextResponse } from "next/server";
import { prisma, isDbConfigured } from "@/lib/db/prisma";
import { submitRelayerTransaction } from "@/lib/blockchain/relayer";

export const runtime = "nodejs";

export async function GET() {
  if (isDbConfigured()) {
    try {
      const proofs = await prisma.deliveryEvidence.findMany({
        take: 20,
        orderBy: { timestamp: "desc" },
        include: {
          lineItem: {
            include: {
              budget: true,
            },
          },
        },
      });
      return NextResponse.json({ success: true, count: proofs.length, proofs, source: "database" });
    } catch (err) {
      console.warn("[Delivery Proof API] DB query error:", err);
      return NextResponse.json(
        { error: "Delivery proof storage is unavailable." },
        { status: 503 },
      );
    }
  }
  return NextResponse.json(
    { error: "Delivery proof storage is not configured." },
    { status: 503 },
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      lineItemId,
      itemType = "Ration Kits",
      vendorName = "Assam State Civil Supplies Corp",
      beneficiaryCount = 250,
      ipfsCid,
      gpsLat = 27.4728,
      gpsLng = 94.912,
      pincode = "786001",
      verified = true,
      deliveredPaise,
    } = body;

    if (!lineItemId || typeof ipfsCid !== "string" || !ipfsCid.trim() || deliveredPaise === undefined) {
      return NextResponse.json(
        { error: "lineItemId, a real IPFS CID, and deliveredPaise are required." },
        { status: 400 }
      );
    }

    const chainReceipt = await submitRelayerTransaction({
      page: 4,
      action: "RECORD_PROOF",
      payload: {
        lineItemId,
        itemType,
        vendorName,
        ipfsCid,
        latitudeE6: Math.round(Number(gpsLat) * 1_000_000),
        longitudeE6: Math.round(Number(gpsLng) * 1_000_000),
        beneficiaryCount: Number(beneficiaryCount),
        deliveredPaise,
      },
    });

    if (!isDbConfigured()) {
      return NextResponse.json(
        { error: "Delivery proof chain transaction succeeded, but database storage is not configured.", txHash: chainReceipt.txHash },
        { status: 503 },
      );
    }

    try {
      const evidence = await prisma.deliveryEvidence.create({
        data: {
          lineItemId,
          itemType,
          vendorName,
          beneficiaryCount: Number(beneficiaryCount),
          ipfsCid,
          gpsLat: Number(gpsLat),
          gpsLng: Number(gpsLng),
          pincode,
          verified: Boolean(verified),
        },
      });

      return NextResponse.json({
        success: true,
        source: "database_and_polygon",
        evidence: {
          ...evidence,
          txHash: chainReceipt.txHash,
          blockNumber: chainReceipt.blockNumber,
        },
        chainReceipt,
        auditNotice: "Proof anchored on Polygon and persisted with IPFS CID and GPS coordinates.",
      });
    } catch (dbErr) {
      console.error("[Delivery Proof API] DB insert failed after Polygon anchoring:", dbErr);
      return NextResponse.json(
        { error: "Proof was anchored on Polygon but could not be persisted in the database.", txHash: chainReceipt.txHash },
        { status: 503 },
      );
    }
  } catch (err) {
    console.error("[Delivery Proof API] Error:", err);
    return NextResponse.json(
      {
        error: "Failed to record delivery proof",
        message: err instanceof Error ? err.message : "Unknown delivery proof error",
      },
      { status: 500 }
    );
  }
}
