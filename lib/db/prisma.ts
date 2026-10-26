import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Configure WebSockets for Neon in Node.js serverless / local runtime
if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

function getConnectionString(): string {
  return process.env.DIRECT_URL || process.env.DATABASE_URL || "";
}

/**
 * Returns true if a live, non-placeholder database connection string is present
 */
export function isDbConfigured(): boolean {
  const connectionString = getConnectionString();
  if (!connectionString) return false;
  if (connectionString.includes("localhost:5432/mydb")) return false;
  if (connectionString.includes("randompassword")) return false;
  if (connectionString.includes("johndoe")) return false;
  return true;
}

export class DatabaseUnavailableError extends Error {
  constructor(message = "A live database connection is required for this operation.") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

export function requireDbConfigured(): void {
  if (!isDbConfigured()) {
    throw new DatabaseUnavailableError(
      "DATABASE_URL or DIRECT_URL must point to a live PostgreSQL database."
    );
  }
}

const createPrismaClient = (): PrismaClient => {
  const connectionString = getConnectionString();
  return new PrismaClient({
    ...(connectionString ? { datasourceUrl: connectionString } : {}),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
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
      engine: "unconfigured",
      error: "DATABASE_URL or DIRECT_URL is not set to a live PostgreSQL connection string.",
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
      engine: getConnectionString().includes("neon.tech") ? "neon_serverless" : "postgresql",
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
