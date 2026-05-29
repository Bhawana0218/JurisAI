import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet, cacheKey } from "@/lib/cache/redis";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

const COUNTER_TTL = 70;

export async function assertRateLimit(userId: string, scope: string): Promise<void> {
  const now = Date.now();
  const key = cacheKey("ratelimit", scope, userId);

  let count: number;
  let windowStart: number;

  if (process.env.UPSTASH_REDIS_REST_URL) {
    const record = await cacheGet<{ count: number; windowStart: number }>(key);
    if (record && record.windowStart > now - WINDOW_MS) {
      count = record.count;
      windowStart = record.windowStart;
    } else {
      count = 0;
      windowStart = now;
    }

    if (count >= MAX_REQUESTS) {
      const retryAfterSec = Math.ceil((WINDOW_MS - (now - windowStart)) / 1000);
      throw new Error(`Rate limit exceeded. Retry after ~${retryAfterSec}s`);
    }

    await cacheSet(key, { count: count + 1, windowStart }, COUNTER_TTL);
    return;
  }

  const windowStartDate = new Date(now - WINDOW_MS);
  const rateKey = `${scope}:${userId}`;

  try {
    count = await prisma.aIUsageLog.count({
      where: {
        userId,
        operation: rateKey,
        createdAt: { gte: windowStartDate },
      },
    });

    if (count >= MAX_REQUESTS) {
      const retryAfterSec = Math.ceil((WINDOW_MS - (now % WINDOW_MS)) / 1000);
      throw new Error(`Rate limit exceeded. Retry after ~${retryAfterSec}s`);
    }

    await prisma.aIUsageLog.create({
      data: {
        userId,
        model: "GPT_4_1_MINI",
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        operation: rateKey,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Rate limit exceeded")) {
      throw error;
    }
    console.warn("[RateLimit] DB unavailable, skipping rate limit check:", error);
  }
}
