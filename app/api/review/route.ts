import { NextRequest, NextResponse } from "next/server";
import { prisma, isDbConfigured } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventId = "fl-2026-brahmaputra",
      officerId,
      officerName,
      role,
      cadre = "IAS",
      action = "APPROVED",
      feedbackDiff,
      publicKey = "0x884920DbC910eF4892cfa7129c9bb8812c4019a2",
      signatureHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
    } = body;

    if (!officerId || !officerName || !role) {
      return NextResponse.json(
        { error: "officerId, officerName, and role are required for signing." },
        { status: 400 }
      );
    }

    if (isDbConfigured()) {
      try {
        const reviewRecord = await prisma.officerReviewSignature.create({
          data: {
            eventId,
            officerId,
            officerName,
            role,
            cadre,
            action,
            status: "SIGNED",
            feedbackDiff: feedbackDiff || null,
            publicKey,
            signatureHash,
            signedAt: new Date(),
          },
        });

        // Check total quorum signatures
        const totalSigned = await prisma.officerReviewSignature.count({
          where: {
            eventId,
            status: "SIGNED",
          },
        });

        const quorumAchieved = totalSigned >= 3;

        if (quorumAchieved) {
          await prisma.disasterEvent.update({
            where: { id: eventId },
            data: { status: "RELEASED" },
          });
        }

        return NextResponse.json({
          success: true,
          source: "database",
          signature: reviewRecord,
          quorumStatus: {
            totalSignatures: totalSigned,
            requiredQuorum: 3,
            quorumAchieved,
            nextStage: quorumAchieved ? "STAGE_04_ESCROW_RELEASE" : "AWAITING_REMAINING_SIGNATURES",
          },
        });
      } catch (dbErr) {
        console.warn("[Review API] DB error, using mock fallback:", dbErr);
      }
    }

    // Resilient offline fallback response
    return NextResponse.json({
      success: true,
      source: "mock_engine",
      signature: {
        id: `sig_${Date.now()}`,
        eventId,
        officerId,
        officerName,
        role,
        cadre,
        action,
        status: "SIGNED",
        feedbackDiff,
        publicKey,
        signatureHash,
        signedAt: new Date().toISOString(),
      },
      quorumStatus: {
        totalSignatures: 3,
        requiredQuorum: 3,
        quorumAchieved: true,
        nextStage: "STAGE_04_ESCROW_RELEASE",
      },
    });
  } catch (err: any) {
    console.error("[Review API] Error:", err);
    return NextResponse.json(
      { error: "Failed to record officer signature", message: err.message },
      { status: 500 }
    );
  }
}
