import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (!client) return null;
  return client.get<T>(key);
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 300
): Promise<void> {
  const client = getRedis();
  if (!client) return;
  await client.set(key, value, { ex: ttlSeconds });
}

export async function cacheDel(key: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  await client.del(key);
}

export function cacheKey(...parts: string[]): string {
  return `juris:${parts.join(":")}`;
}
