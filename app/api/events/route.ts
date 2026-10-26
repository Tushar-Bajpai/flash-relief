import { NextRequest, NextResponse } from "next/server";
import { prisma, isDbConfigured } from "@/lib/db/prisma";
import { DISASTER_EVENTS } from "@/lib/events-data";
import { serializeJsonWithBigInt } from "@/lib/utils";

export async function GET() {
  if (isDbConfigured()) {
    try {
      const dbEvents = await prisma.disasterEvent.findMany({
        include: {
          gauges: true,
          budgets: {
            include: { lineItems: true },
          },
          reviews: true,
          vaults: true,
        },
        orderBy: { createdAt: "desc" },
      });

      if (dbEvents.length > 0) {
        return NextResponse.json(
          serializeJsonWithBigInt({
            source: "database",
            events: dbEvents,
          })
        );
      }
    } catch (err) {
      console.warn("[Events API] Database query error, using fallback dossiers:", err);
    }
  }

  // Fallback to rich predefined dossiers
  const staticEvents = Object.values(DISASTER_EVENTS).map((evt) => ({
    id: evt.id,
    title: evt.name,
    eventCode: evt.eventCode,
    basin: evt.basinName,
    state: evt.state,
    district: evt.district,
    alertLevel: evt.status === "ACTIVE_RELIEF" ? "EMERGENCY" : "WARNING",
    probability: 0.94,
    leadTimeHours: evt.leadTimeHours,
    inundationSqKm: 142.8,
    populationAtRisk: evt.beneficiariesTargeted,
    status: evt.status,
    polygonTxHash: evt.polygonTxHash,
    blockNumber: evt.polygonBlockNumber,
    totalAllocatedCrores: evt.totalAllocatedCrores,
    totalDisbursedCrores: evt.totalDisbursedCrores,
    totalProvenCrores: evt.totalProvenCrores,
    startDate: evt.startDate,
  }));

  return NextResponse.json({
    source: "static_seed",
    events: staticEvents,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      basin,
      state,
      district,
      alertLevel = "WARNING",
      probability = 0.85,
      leadTimeHours = 12,
      inundationSqKm = 50.0,
      populationAtRisk = 10000,
      status = "DETECTED",
    } = body;

    if (!id || !title || !basin || !state || !district) {
      return NextResponse.json(
        { error: "Missing required fields: id, title, basin, state, district." },
        { status: 400 }
      );
    }

    if (isDbConfigured()) {
      const created = await prisma.disasterEvent.create({
        data: {
          id,
          title,
          basin,
          state,
          district,
          alertLevel,
          probability: Number(probability),
          leadTimeHours: Number(leadTimeHours),
          inundationSqKm: Number(inundationSqKm),
          populationAtRisk: Number(populationAtRisk),
          status,
        },
      });

      return NextResponse.json({
        success: true,
        source: "database",
        event: created,
      });
    }

    // In-memory response if offline
    return NextResponse.json({
      success: true,
      source: "mock",
      event: {
        id,
        title,
        basin,
        state,
        district,
        alertLevel,
        probability,
        leadTimeHours,
        inundationSqKm,
        populationAtRisk,
        status,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("[Events API] Error creating event:", err);
    return NextResponse.json(
      { error: "Failed to create disaster event", message: err.message },
      { status: 500 }
    );
  }
}
