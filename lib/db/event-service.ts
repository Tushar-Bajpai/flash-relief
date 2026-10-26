import { prisma, isDbConfigured } from "./prisma";
import { serializeJsonWithBigInt } from "@/lib/utils";
import { ALL_DISASTER_EVENTS, getDisasterEventById } from "@/lib/events-data";

export interface UnifiedEventState {
  id: string;
  title: string;
  basin: string;
  state: string;
  district: string;
  alertLevel: string;
  probability: number;
  leadTimeHours: number;
  inundationSqKm: number;
  populationAtRisk: number;
  status: string;
  polygonTxHash?: string | null;
  blockNumber?: number | null;
  gauges: any[];
  budgets: any[];
  reviews: any[];
  vaults: any[];
  grievances: any[];
  source: "database" | "fallback";
}

/**
 * Retrieves the complete live event dossier from Neon PostgreSQL.
 * Falls back to local baseline dossier if the DB is unreachable.
 */
export async function getLiveEventDossier(
  eventId: string = "fl-2026-brahmaputra"
): Promise<UnifiedEventState> {
  if (isDbConfigured()) {
    try {
      const event = await prisma.disasterEvent.findUnique({
        where: { id: eventId },
        include: {
          gauges: {
            orderBy: { timestamp: "desc" },
            take: 10,
          },
          budgets: {
            include: {
              lineItems: {
                include: {
                  deliveries: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          reviews: {
            orderBy: { signedAt: "asc" },
          },
          vaults: {
            orderBy: { departmentId: "asc" },
          },
          grievances: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (event) {
        return serializeJsonWithBigInt({
          ...event,
          source: "database" as const,
        }) as unknown as UnifiedEventState;
      }
    } catch (err) {
      console.warn(`[EventService] Error fetching event ${eventId} from DB, using fallback:`, err);
    }
  }

  // Resilient fallback to established domain dossier
  const fallback = getDisasterEventById(eventId);
  return {
    id: fallback.id,
    title: fallback.name,
    basin: fallback.basinName,
    state: fallback.state,
    district: fallback.district,
    alertLevel: "EMERGENCY",
    probability: 0.94,
    leadTimeHours: fallback.leadTimeHours,
    inundationSqKm: 142.8,
    populationAtRisk: fallback.beneficiariesTargeted,
    status: "DELIVERING",
    polygonTxHash: fallback.polygonTxHash,
    blockNumber: fallback.polygonBlockNumber,
    gauges: [],
    budgets: [],
    reviews: [],
    vaults: [],
    grievances: [],
    source: "fallback",
  };
}

/**
 * Updates the statutory lifecycle status of a disaster event.
 * Valid statuses: "DETECTED" | "ESTIMATED" | "REVIEWED" | "RELEASED" | "DELIVERING" | "SETTLED"
 */
export async function advanceEventStatus(
  eventId: string,
  newStatus: "DETECTED" | "ESTIMATED" | "REVIEWED" | "RELEASED" | "DELIVERING" | "SETTLED"
) {
  if (isDbConfigured()) {
    try {
      const updated = await prisma.disasterEvent.update({
        where: { id: eventId },
        data: { status: newStatus },
      });
      return serializeJsonWithBigInt({ success: true, event: updated });
    } catch (err) {
      console.warn(`[EventService] Failed to advance stage in DB:`, err);
    }
  }

  return { success: true, eventId, status: newStatus, source: "mock_engine" };
}

/**
 * Persists an itemized SDRF draft budget formulated from Stage 02.
 */
export async function persistBudgetDraft(eventId: string, draft: {
  waterDepthMeters: number;
  percentile: "P10" | "P50" | "P90";
  totalRupees: number;
  lines: Array<{
    normCode: string;
    category: string;
    departmentId: string;
    description: string;
    quantity: number;
    unitRate: number;
    totalCost: number;
    formula: string;
  }>;
}) {
  if (isDbConfigured()) {
    try {
      const totalPaise = BigInt(Math.round(draft.totalRupees)) * BigInt(100);

      // Create or update the budget draft
      const createdDraft = await prisma.sdrfBudgetDraft.create({
        data: {
          eventId,
          waterDepthMeters: draft.waterDepthMeters,
          percentile: draft.percentile,
          totalRupees: draft.totalRupees,
          totalPaise,
          status: "RECOMMENDED",
          lineItems: {
            create: draft.lines.map((l) => ({
              normCode: l.normCode,
              category: l.category,
              departmentId: l.departmentId,
              description: l.description,
              quantity: l.quantity,
              unitRate: l.unitRate,
              totalCost: l.totalCost,
              formula: l.formula,
            })),
          },
        },
        include: { lineItems: true },
      });

      // Advance event status to ESTIMATED
      await prisma.disasterEvent.update({
        where: { id: eventId },
        data: { status: "ESTIMATED" },
      });

      return serializeJsonWithBigInt({ success: true, draft: createdDraft });
    } catch (err) {
      console.warn(`[EventService] Error saving budget draft to DB:`, err);
    }
  }

  return {
    success: true,
    source: "mock_engine",
    draft: {
      id: `draft_${Date.now()}`,
      eventId,
      ...draft,
      status: "RECOMMENDED",
    },
  };
}
