import { NextRequest, NextResponse } from "next/server";
import { prisma, isDbConfigured } from "@/lib/db/prisma";

export async function GET() {
  if (isDbConfigured()) {
    try {
      const grievances = await prisma.citizenGrievance.findMany({
        orderBy: { createdAt: "desc" },
      });

      if (grievances.length > 0) {
        const enriched = grievances.map((g) => {
          const msLeft = Math.max(0, new Date(g.slaDeadline).getTime() - Date.now());
          const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
          const minsLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
          return {
            ...g,
            slaRemaining: `${hoursLeft}h ${minsLeft}m`,
            isBreached: msLeft === 0 && g.status !== "RESOLVED",
          };
        });

        return NextResponse.json({
          source: "database",
          total: enriched.length,
          grievances: enriched,
        });
      }
    } catch (err) {
      console.warn("[Grievance API] DB query error, using baseline fallback:", err);
    }
  }

  // Pre-configured citizen grievances fallback
  const fallback = [
    {
      id: "grv_01",
      eventId: "fl-2026-brahmaputra",
      trackingId: "GRV-2026-081",
      village: "Jengraimukh, Majuli",
      district: "Majuli",
      citizenHash: "0x918a...291a",
      category: "RATION_SHORTAGE",
      description: "Community shelter #4 did not receive infant milk supplement during morning airdrop.",
      amountInvolved: 24000,
      status: "INVESTIGATING",
      slaDeadline: new Date(Date.now() + 38 * 3600 * 1000).toISOString(),
      slaRemaining: "38h 00m",
      isBreached: false,
      createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    },
    {
      id: "grv_02",
      eventId: "fl-2026-brahmaputra",
      trackingId: "GRV-2026-082",
      village: "Salmora Embankment Road",
      district: "Majuli",
      citizenHash: "0x34bc...8192",
      category: "EMERGENCY_ACCESS",
      description: "Breached culvert preventing boat transit to relief distribution point.",
      amountInvolved: 150000,
      status: "RESOLVED",
      slaDeadline: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
      slaRemaining: "Resolved in 18h",
      isBreached: false,
      createdAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    },
  ];

  return NextResponse.json({
    source: "static_seed",
    total: fallback.length,
    grievances: fallback,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventId = "fl-2026-brahmaputra",
      village,
      district,
      citizenHash = `0x${Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}...${Date.now().toString().slice(-4)}`,
      category = "GENERAL_RELIEF",
      description,
      amountInvolved = 0,
    } = body;

    if (!village || !district || !description) {
      return NextResponse.json(
        { error: "village, district, and description are required." },
        { status: 400 }
      );
    }

    const trackingId = `GRV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const slaDeadline = new Date(Date.now() + 48 * 3600 * 1000); // 48 hours SLA

    if (isDbConfigured()) {
      try {
        const created = await prisma.citizenGrievance.create({
          data: {
            eventId,
            trackingId,
            village,
            district,
            citizenHash,
            category,
            description,
            amountInvolved: Number(amountInvolved),
            status: "OPEN",
            slaDeadline,
          },
        });

        return NextResponse.json({
          success: true,
          source: "database",
          grievance: created,
          slaNotice: "48-Hour Statutory Grievance Redressal SLA initiated under SDRF norms.",
        });
      } catch (dbErr) {
        console.warn("[Grievance API] DB insert failed, using fallback:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      source: "mock_engine",
      grievance: {
        id: `grv_${Date.now()}`,
        eventId,
        trackingId,
        village,
        district,
        citizenHash,
        category,
        description,
        amountInvolved: Number(amountInvolved),
        status: "OPEN",
        slaDeadline: slaDeadline.toISOString(),
        slaRemaining: "48h 00m",
        createdAt: new Date().toISOString(),
      },
      slaNotice: "48-Hour Statutory Grievance Redressal SLA initiated under SDRF norms.",
    });
  } catch (err: any) {
    console.error("[Grievance API] Error:", err);
    return NextResponse.json(
      { error: "Failed to record grievance", message: err.message },
      { status: 500 }
    );
  }
}
