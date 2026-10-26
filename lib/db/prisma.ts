import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// Configure WebSockets for Neon in Node.js serverless / local runtime
if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const connectionString = process.env.DATABASE_URL || "";

/**
 * Returns true if a live, non-placeholder database connection string is present
 */
export function isDbConfigured(): boolean {
  if (!connectionString) return false;
  if (connectionString.includes("localhost:5432/mydb")) return false;
  if (connectionString.includes("randompassword")) return false;
  if (connectionString.includes("johndoe")) return false;
  return true;
}

const createPrismaClient = (): PrismaClient => {
  if (!isDbConfigured()) {
    // Return standard client (mocked/offline-ready)
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }

  try {
    return new PrismaClient({
      datasourceUrl: connectionString,
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  } catch (err) {
    console.warn("[Prisma] Falling back to standard PrismaClient:", err);
    return new PrismaClient();
  }
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Health check helper to verify database latency and table connectivity
 */
export async function checkDbConnection(): Promise<{
  connected: boolean;
  configured: boolean;
  latencyMs: number;
  engine: string;
  error?: string;
}> {
  const configured = isDbConfigured();
  if (!configured) {
    return {
      connected: false,
      configured: false,
      latencyMs: 0,
      engine: "offline_mock",
      error: "DATABASE_URL is not set to a live Neon connection string.",
    };
  }

  const start = performance.now();
  try {
    // Test raw ping to database
    await prisma.$queryRaw`SELECT 1 as ping`;
    const latencyMs = Math.round(performance.now() - start);
    return {
      connected: true,
      configured: true,
      latencyMs,
      engine: connectionString.includes("neon.tech") ? "neon_serverless" : "postgresql",
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      connected: false,
      configured: true,
      latencyMs,
      engine: "disconnected",
      error: err?.message || "Failed to reach database",
    };
  }
}

export default prisma;
