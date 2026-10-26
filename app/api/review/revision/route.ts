import { NextRequest, NextResponse } from "next/server";
import { prisma, isDbConfigured } from "@/lib/db/prisma";
import { hashPayload } from "@/lib/blockchain/public-notebook";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventId = "fl-2026-brahmaputra",
      officerName = "Smt. Mridula Baruah (Finance / Committee)",
      instruction = "",
      baseBudgetCrores = 7.35,
    } = body;

    if (!instruction.trim()) {
      return NextResponse.json(
        { error: "Instruction prompt is required." },
        { status: 400 }
      );
    }

    const lower = instruction.toLowerCase();
    let deltaRupees = 12200000; // default ₹1.22 Cr
    let deltaCrores = 1.22;
    let explanation = "Applied committee modification: Extended gratuitous camp feeding duration (+3 days) under SDRF Item 1(a).";
    let parameterModified = "camp_days";
    let statutoryClause = "MHA Order No. 33-04/2020 Item 1(a) — Gratuitous Relief in Camps";

    if (lower.includes("p90") || lower.includes("worst-case") || lower.includes("worst case")) {
      deltaRupees = 38400000; // +₹3.84 Cr
      deltaCrores = 3.84;
      explanation = "Shifted housing reconstruction baseline to P90 worst-case raster uncertainty bound.";
      parameterModified = "raster_uncertainty_bound";
      statutoryClause = "NDMA Hydrodynamic Ensemble Uncertainty Calibration (P90)";
    } else if (lower.includes("cattle") || lower.includes("fodder") || lower.includes("veterinary")) {
      deltaRupees = 6400000; // +₹0.64 Cr
      deltaCrores = 0.64;
      explanation = "Increased animal husbandry fodder allocation by 20% for riverine cattle camps under SDRF Norms.";
      parameterModified = "cattle_fodder_metric";
      statutoryClause = "MHA SDRF Item 4(a) — Cattle Preservation and Fodder Supply";
    } else if (lower.includes("medical") || lower.includes("chlorine") || lower.includes("health")) {
      deltaRupees = 4800000; // +₹0.48 Cr
      deltaCrores = 0.48;
      explanation = "Reinforced mobile boat dispensaries and halogen water purification kits for isolated river island reaches.";
      parameterModified = "mobile_dispensary_units";
      statutoryClause = "MHA SDRF Item 5(a) — Emergency Health and Medical Squads";
    }

    const checkpointId = `chk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const revisionDigest = hashPayload({
      eventId,
      officerName,
      instruction,
      deltaRupees,
      parameterModified,
      statutoryClause,
      timestamp: new Date().toISOString(),
    });

    // Record review diff into Neon DB if configured
    if (isDbConfigured()) {
      try {
        await prisma.officerReviewSignature.create({
          data: {
            eventId,
            officerId: "off-finance-01",
            officerName,
            role: "Joint Secretary (Finance)",
            cadre: "IDAS",
            action: "MODIFIED",
            status: "SIGNED",
            feedbackDiff: JSON.stringify({
              instruction,
              deltaRupees,
              deltaCrores,
              explanation,
              parameterModified,
              statutoryClause,
              checkpointId,
              revisionDigest,
            }),
            publicKey: "0x884920DbC910eF4892cfa7129c9bb8812c4019a2",
            signatureHash: revisionDigest,
            signedAt: new Date(),
          },
        });
      } catch (dbErr) {
        console.warn("[Revision API] DB insert notice:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      checkpointId,
      officerName,
      instruction,
      deltaRupees,
      deltaCrores,
      explanation,
      parameterModified,
      statutoryClause,
      revisionDigest,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Revision API] Error:", err);
    return NextResponse.json(
      { error: "Failed to process LangGraph revision feedback", message: err.message },
      { status: 500 }
    );
  }
}
