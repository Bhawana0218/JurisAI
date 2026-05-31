import { prisma } from "@/lib/prisma";
import { aiRuntime } from "../ai-runtime";
import { Redis } from "@upstash/redis";

type MemoryEntry = {
  id: string;
  userId: string;
  sessionId?: string;
  memoryType: "short_term" | "long_term" | "episodic" | "semantic" | "procedural";
  content: string;
  importance: number;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
};

class DistributedMemoryEngine {
  private redis: Redis | null = null;

  constructor() {
    if (process.env.UPSTASH_REDIS_REST_URL) {
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
    }
  }

  async store(params: {
    userId: string;
    sessionId?: string;
    memoryType: MemoryEntry["memoryType"];
    content: string;
    importance?: number;
    context?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    ttlSeconds?: number;
  }): Promise<string> {
    const embedding = await aiRuntime.generateEmbedding(params.content);
    const importance = params.importance ?? 0.5;

    const entry = await prisma.aiMemoryEntry.create({
      data: {
        userId: params.userId,
        sessionId: params.sessionId,
        memoryType: params.memoryType,
        content: params.content,
        importance,
        context: (params.context || {}) as any,
        metadata: (params.metadata || {}) as any,
        expiresAt: params.ttlSeconds ? new Date(Date.now() + params.ttlSeconds * 1000) : undefined,
      },
    });

    if (this.redis && params.memoryType === "short_term") {
      const key = `memory:short:${params.userId}:${entry.id}`;
      await this.redis.set(key, JSON.stringify(params), { ex: params.ttlSeconds || 3600 });
    }

    return entry.id;
  }

  async recall(params: {
    userId: string;
    query: string;
    memoryTypes?: MemoryEntry["memoryType"][];
    limit?: number;
    minImportance?: number;
  }): Promise<MemoryEntry[]> {
    const embedding = await aiRuntime.generateEmbedding(params.query);

    const types = params.memoryTypes || ["short_term", "long_term", "episodic", "semantic"];
    const limit = params.limit || 10;

    const entries = await prisma.$queryRaw<
      Array<{
        id: string;
        user_id: string;
        session_id: string | null;
        memory_type: string;
        content: string;
        importance: number;
        context: any;
        metadata: any;
        created_at: Date;
        distance: number;
      }>
    >`
      SELECT
        id, user_id, session_id, memory_type, content, importance,
        context, metadata, created_at,
        1 - (embedding <=> ${embedding}::vector) as distance
      FROM "AiMemoryEntry"
      WHERE user_id = ${params.userId}
        AND memory_type = ANY(${types}::text[])
        AND (expires_at IS NULL OR expires_at > NOW())
        AND importance >= ${params.minImportance || 0}
      ORDER BY distance DESC
      LIMIT ${limit}
    `;

    return (entries as any[])
      .filter((e: any) => e.distance > 0.5)
      .map((e: any) => ({
        id: e.id,
        userId: e.user_id,
        sessionId: e.session_id || undefined,
        memoryType: e.memory_type as MemoryEntry["memoryType"],
        content: e.content,
        importance: e.importance,
        context: e.context || undefined,
        metadata: e.metadata || undefined,
        createdAt: e.created_at,
      }));
  }

  async consolidate(userId: string): Promise<number> {
    const shortTerm = await prisma.aiMemoryEntry.findMany({
      where: {
        userId,
        memoryType: "short_term",
        importance: { gte: 0.7 },
      },
      orderBy: { importance: "desc" },
      take: 50,
    });

    let consolidated = 0;
    for (const entry of shortTerm) {
      const similar = await this.findSimilar(userId, entry.content, "long_term", 0.85);
      if (similar.length === 0) {
        await prisma.aiMemoryEntry.create({
          data: {
            userId,
            memoryType: "long_term",
            content: entry.content,
            importance: entry.importance * 0.9,
            context: entry.context as any,
            metadata: { consolidatedFrom: entry.id, consolidatedAt: new Date().toISOString() } as any,
          },
        });
        consolidated++;
      }

      await prisma.aiMemoryEntry.delete({ where: { id: entry.id } });
    }

    return consolidated;
  }

  private async findSimilar(userId: string, content: string, memoryType: string, threshold: number) {
    const embedding = await aiRuntime.generateEmbedding(content);

    return prisma.$queryRaw<Array<{ id: string; distance: number }>>`
      SELECT id, 1 - (embedding <=> ${embedding}::vector) as distance
      FROM "AiMemoryEntry"
      WHERE user_id = ${userId}
        AND memory_type = ${memoryType}
      ORDER BY distance DESC
      LIMIT 5
    `;
  }

  async getSessionContext(userId: string, sessionId: string): Promise<string> {
    const memories = await prisma.aiMemoryEntry.findMany({
      where: {
        userId,
        sessionId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return memories.map((m) => `[${m.memoryType}] ${m.content}`).join("\n");
  }

  async prune(userId: string, maxEntries: number = 1000): Promise<number> {
    const total = await prisma.aiMemoryEntry.count({ where: { userId } });
    if (total <= maxEntries) return 0;

    const toDelete = await prisma.aiMemoryEntry.findMany({
      where: { userId },
      orderBy: [{ importance: "asc" }, { lastAccessedAt: "asc" }],
      take: total - maxEntries,
      select: { id: true },
    });

    await prisma.aiMemoryEntry.deleteMany({
      where: { id: { in: toDelete.map((d) => d.id) } },
    });

    return toDelete.length;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await prisma.aiMemoryEntry.count({ take: 1 });
      return true;
    } catch {
      return false;
    }
  }
}

export const distributedMemory = new DistributedMemoryEngine();
