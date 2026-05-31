import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! })
  : null;

const localCounters = new Map<string, { count: number; resetAt: number }>();

class RateLimiter {
  async check(identifier: string, maxRequests: number, windowMs: number = 60000): Promise<void> {
    if (redis) {
      await this.redisCheck(identifier, maxRequests, windowMs);
    } else {
      this.localCheck(identifier, maxRequests, windowMs);
    }
  }

  private async redisCheck(identifier: string, max: number, windowMs: number): Promise<void> {
    const key = `ratelimit:gateway:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!redis) { return; }
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, Math.ceil(windowMs / 1000));
    }

    const ttl = await redis.ttl(key);
    if (count > max) {
      throw new Error(`Rate limit exceeded. Retry after ${ttl}s`);
    }
  }

  private localCheck(identifier: string, max: number, windowMs: number): void {
    const now = Date.now();
    const existing = localCounters.get(identifier);

    if (!existing || now > existing.resetAt) {
      localCounters.set(identifier, { count: 1, resetAt: now + windowMs });
      return;
    }

    existing.count++;
    if (existing.count > max) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
      throw new Error(`Rate limit exceeded. Retry after ${retryAfter}s`);
    }
  }
}

export const rateLimiter = new RateLimiter();
