import { NextRequest, NextResponse } from "next/server";
import { prisma, isDbConfigured } from "@/lib/db/prisma";
import { hashPayload } from "@/lib/blockchain/public-notebook";

export async function GET(req: NextRequest) {
  return handleSlaEvaluation();
}

export async function POST(req: NextRequest) {
  return handleSlaEvaluation();
}

async function handleSlaEvaluation() {
  try {
    const now = new Date();
    const escalatedList: any[] = [];
    let checkedCount = 0;

    if (isDbConfigured()) {
      // Find open grievances where current time has exceeded the 48-hour SLA deadline
      const openGrievances = await prisma.citizenGrievance.findMany({
        where: {
          status: {
            notIn: ["RESOLVED", "CORROBORATED"],
          },
        },
      });

      checkedCount = openGrievances.length;

      for (const g of openGrievances) {
        const isPastDeadline = now > new Date(g.slaDeadline);

        if (isPastDeadline && g.status !== "ESCALATED") {
          // Automatic escalation to District Magistrate level
          const updated = await prisma.citizenGrievance.update({
            where: { id: g.id },
            data: {
              status: "ESCALATED",
            },
          });

          // Compute tamper-proof breach fingerprint for Public Notebook
          const breachHash = hashPayload({
            ticketId: g.trackingId,
            village: g.village,
            deadline: g.slaDeadline,
            breachedAt: now.toISOString(),
            escalationLevel: "DISTRICT_MAGISTRATE_AND_SDMA",
          });

          escalatedList.push({
            id: updated.id,
            trackingId: updated.trackingId,
            village: updated.village,
            breachedAt: now.toISOString(),
            onChainBreachStamp: breachHash,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      checkedCount,
      escalatedCount: escalatedList.length,
      escalatedTickets: escalatedList,
      statutoryRule: "48-Hour Statutory Grievance Redressal SLA under MHA SDRF Norms.",
    });
  } catch (err: any) {
    console.error("[SLA Cron API] Error:", err);
    return NextResponse.json(
      { error: "Failed to evaluate grievance SLA deadlines", message: err.message },
      { status: 500 }
    );
  }
}
