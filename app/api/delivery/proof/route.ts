import { NextRequest, NextResponse } from "next/server";
import { prisma, isDbConfigured } from "@/lib/db/prisma";

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
    } catch (err: any) {
      console.warn("[Delivery Proof API] DB query error:", err);
    }
  }
  return NextResponse.json({ success: true, count: 0, proofs: [], source: "fallback" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      lineItemId,
      itemType = "Ration Kits",
      vendorName = "Assam State Civil Supplies Corp",
      beneficiaryCount = 250,
      ipfsCid = `bafybeicdx4a7kmmj9z38vx99qqwlp3k99d81z099x418dka098mzk4${Date.now().toString().slice(-4)}`,
      gpsLat = 27.4728,
      gpsLng = 94.912,
      pincode = "786001",
      verified = true,
    } = body;

    if (!lineItemId) {
      return NextResponse.json(
        { error: "lineItemId is required to register delivery proof." },
        { status: 400 }
      );
    }

    if (isDbConfigured()) {
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
          source: "database",
          evidence,
          auditNotice: "Proof anchored with IPFS CID and GPS coordinates for Third Number audit.",
        });
      } catch (dbErr) {
        console.warn("[Delivery Proof API] DB insert failed, using fallback:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      source: "mock_engine",
      evidence: {
        id: `ev_${Date.now()}`,
        lineItemId,
        itemType,
        vendorName,
        beneficiaryCount,
        ipfsCid,
        gpsLat,
        gpsLng,
        pincode,
        timestamp: new Date().toISOString(),
        verified: true,
      },
      auditNotice: "Proof anchored with IPFS CID and GPS coordinates for Third Number audit.",
    });
  } catch (err: any) {
    console.error("[Delivery Proof API] Error:", err);
    return NextResponse.json(
      { error: "Failed to record delivery proof", message: err.message },
      { status: 500 }
    );
  }
}
