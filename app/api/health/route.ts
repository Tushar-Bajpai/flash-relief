import { NextResponse } from "next/server";
import { checkDbConnection, isDbConfigured, prisma } from "@/lib/db/prisma";
import { SDRF_LEGAL_NORMS } from "@/lib/data/sdrf-corpus";

export async function GET() {
  const dbHealth = await checkDbConnection();

  let vectorCount = SDRF_LEGAL_NORMS.length;
  let eventCount = 2;

  if (dbHealth.connected) {
    try {
      const [dbVectorCount, dbEventCount] = await Promise.all([
        prisma.documentChunk.count(),
        prisma.disasterEvent.count(),
      ]);
      vectorCount = dbVectorCount;
      eventCount = dbEventCount;
    } catch {
      // Continue with baseline counts
    }
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "FlashRelief Backend Engine",
    version: "1.0.0",
    database: {
      configured: dbHealth.configured,
      connected: dbHealth.connected,
      engine: dbHealth.engine,
      latencyMs: dbHealth.latencyMs,
      error: dbHealth.error || null,
    },
    vectorStore: {
      provider: "Neon pgvector / LangChain",
      dimension: 1536,
      indexedNormsCount: vectorCount,
      corpus: "MHA SDRF 2021-2026 Legal Norms & NDMA SOP",
      status: dbHealth.connected ? "LIVE_POSTGRES" : "RESILIENT_SEMANTIC_FALLBACK",
    },
    eventsActive: eventCount,
    quorumRule: "3-of-3 Multi-Sig (IAS / NDMA / IDAS)",
    blockchain: "Polygon PoS Mainnet Contract Escrows",
  });
}
