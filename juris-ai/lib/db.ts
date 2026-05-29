import { prisma } from "@/lib/prisma";

export type TransactionClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function withTransaction<T>(
  fn: (tx: TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(fn);
}

export async function healthCheck(): Promise<{ db: boolean; redis: boolean }> {
  const dbHealthy = await prisma.$queryRawUnsafe<number[]>("SELECT 1")
    .then(() => true)
    .catch(() => false);

  let redisHealthy = false;
  try {
    const { cacheGet } = await import("@/lib/cache/redis");
    const result = await cacheGet("health:check");
    redisHealthy = result === null || true; // no error = reachable
  } catch {
    redisHealthy = false;
  }

  return { db: dbHealthy, redis: redisHealthy };
}
