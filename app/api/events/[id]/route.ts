import { NextRequest, NextResponse } from "next/server";
import { prisma, isDbConfigured } from "@/lib/db/prisma";
import { DISASTER_EVENTS } from "@/lib/events-data";
import { serializeJsonWithBigInt } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (isDbConfigured()) {
    try {
      const dbEvent = await prisma.disasterEvent.findUnique({
        where: { id },
        include: {
          gauges: true,
          budgets: {
            include: { lineItems: { include: { deliveries: true } } },
          },
          reviews: true,
          vaults: true,
          grievances: true,
        },
      });

      if (dbEvent) {
        return NextResponse.json(
          serializeJsonWithBigInt({
            source: "database",
            event: dbEvent,
          })
        );
      }
    } catch (err) {
      console.warn(`[Event ID API] DB fetch failed for ${id}:`, err);
    }
  }

  // Fallback to DISASTER_EVENTS
  const fallback = DISASTER_EVENTS[id];
  if (fallback) {
    return NextResponse.json({
      source: "static_seed",
      event: fallback,
    });
  }

  return NextResponse.json(
    { error: `Event with ID '${id}' not found.` },
    { status: 404 }
  );
}
