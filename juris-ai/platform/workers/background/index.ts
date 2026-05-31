import { prisma } from "@/lib/prisma";
import { distributedMemory } from "../../ai-runtime/memory/distributed-memory";
import { webhookEngine } from "../../webhooks/webhook-engine";
import { logger } from "../../observability/logging/logger";

type JobHandler = (payload: any) => Promise<void>;

const jobs: Map<string, JobHandler> = new Map();

function register(name: string, handler: JobHandler) {
  jobs.set(name, handler);
}

register("webhook.retry", async () => {
  const count = await webhookEngine.retryFailedDeliveries();
  logger.info(`[Worker] Retried ${count} failed webhook deliveries`);
});

register("memory.consolidate", async () => {
  const memoryUsers = await prisma.aiMemoryEntry.groupBy({
    by: ["userId"],
    where: { memoryType: "short_term" },
  });

  let total = 0;
  for (const entry of memoryUsers) {
    const consolidated = await distributedMemory.consolidate(entry.userId);
    total += consolidated;
  }
 logger.info(
  `[Worker] Consolidated ${total} short-term memories across ${memoryUsers.length} users`
);
});

register("memory.prune", async () => {
  const users = await prisma.user.findMany({
    select: { id: true },
  });

  let total = 0;
  for (const user of users) {
    const pruned = await distributedMemory.prune(user.id, 2000);
    total += pruned;
  }
  logger.info(`[Worker] Pruned ${total} low-importance memories`);
});

register("usage.alerts", async () => {
  const subscriptions = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    include: { organization: true },
  });

  for (const sub of subscriptions) {
    if (!sub.organizationId) continue;

    const tokenUsage = await prisma.aIUsageLog.aggregate({
      where: {
        organizationId: sub.organizationId,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      _sum: { totalTokens: true },
    });

    const usagePercent = (tokenUsage._sum.totalTokens || 0) / sub.monthlyTokenLimit;

    if (usagePercent >= 0.8) {
      logger.warn(`[Worker] Usage alert for ${sub.organizationId}: ${Math.round(usagePercent * 100)}% of token limit used`);
    }
  }
});

register("cleanup.expired", async () => {
  const now = new Date();

  const expiredLocks = await prisma.distributedLock.deleteMany({
    where: { expiresAt: { lt: now } },
  });

  const expiredMemories = await prisma.aiMemoryEntry.deleteMany({
    where: { expiresAt: { lt: now } },
  });

  logger.info(`[Worker] Cleanup: ${expiredLocks.count} locks, ${expiredMemories.count} expired memories`);
});

process.on("message", async (msg: { job: string; payload?: any }) => {
  const handler = jobs.get(msg.job);
  if (handler) {
    try {
      await handler(msg.payload);
      process.send?.({ job: msg.job, status: "completed" });
    } catch (error: any) {
      logger.error(`[Worker] Job ${msg.job} failed`, { error: error.message });
      process.send?.({ job: msg.job, status: "failed", error: error.message });
    }
  }
});

process.send?.({ status: "ready" });
logger.info("[Worker] Background worker started");
