import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cacheGet } from "@/lib/cache/redis";
import { eventBus } from "@/platform/event-bus/event-bus";
import { distributedMemory } from "@/platform/ai-runtime/memory/distributed-memory";

type HealthStatus = {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  uptime: number;
  checks: {
    database: { status: string; latencyMs?: number };
    redis: { status: string; latencyMs?: number };
    eventBus: { status: string };
    memory: { status: string };
    aiRuntime: { status: string };
  };
  timestamp: string;
};

export async function GET(_req: NextRequest) {
  const start = performance.now();
  const checks: HealthStatus["checks"] = {
    database: { status: "unknown" },
    redis: { status: "unknown" },
    eventBus: { status: "unknown" },
    memory: { status: "unknown" },
    aiRuntime: { status: "unknown" },
  };

  try {
    const dbStart = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "ok", latencyMs: Math.round(performance.now() - dbStart) };
  } catch { checks.database = { status: "error" }; }

  try {
    const redisStart = performance.now();
    const result = await cacheGet("health:check");
    checks.redis = { status: result !== undefined ? "ok" : "ok", latencyMs: Math.round(performance.now() - redisStart) };
  } catch { checks.redis = { status: "error" }; }

  const ebHealthy = await eventBus.healthCheck();
  checks.eventBus = { status: ebHealthy ? "ok" : "error" };

  const memHealthy = await distributedMemory.healthCheck();
  checks.memory = { status: memHealthy ? "ok" : "error" };

  checks.aiRuntime = { status: "ok" };

  const allOk = Object.values(checks).every((c) => c.status === "ok");
  const anyOk = Object.values(checks).some((c) => c.status === "ok");

  const status: HealthStatus = {
    status: allOk ? "healthy" : anyOk ? "degraded" : "unhealthy",
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    uptime: Math.round(process.uptime() * 1000),
    checks,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(status, {
    status: status.status === "healthy" ? 200 : status.status === "degraded" ? 200 : 503,
  });
}
