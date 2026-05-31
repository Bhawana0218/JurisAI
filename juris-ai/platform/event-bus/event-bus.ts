import { Redis } from "@upstash/redis";
import { logger } from "../observability/logging/logger";

export type EventEnvelope<T = unknown> = {
  id: string;
  type: string;
  source: string;
  subject?: string;
  data: T;
  metadata: {
    timestamp: string;
    userId?: string;
    organizationId?: string;
    correlationId?: string;
    causationId?: string;
    version: number;
  };
};

type EventHandler<T = unknown> = (event: EventEnvelope<T>) => Promise<void>;

class EventBus {
  private redis: Redis | null = null;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private dlq: Array<EventEnvelope> = [];

  constructor() {
    if (process.env.UPSTASH_REDIS_REST_URL) {
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
    }
  }

  subscribe<T>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler as EventHandler);

    return () => {
      this.handlers.get(eventType)?.delete(handler as EventHandler);
    };
  }

  async publish<T>(event: Omit<EventEnvelope<T>, "id" | "metadata"> & { metadata?: Partial<EventEnvelope["metadata"]> }): Promise<string> {
    const envelope: EventEnvelope<T> = {
      ...event,
      id: crypto.randomUUID(),
      metadata: {
        timestamp: new Date().toISOString(),
        version: 1,
        ...event.metadata,
      },
    };

    await this.dispatchToHandlers(envelope);
    await this.persistEvent(envelope);
    await this.pushToStream(envelope);

    return envelope.id;
  }

  private async dispatchToHandlers(event: EventEnvelope): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (!handlers) return;

    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(event);
      } catch (error) {
        logger.error(`[EventBus] Handler failed for ${event.type}`, { error, eventId: event.id });
        this.dlq.push(event);
      }
    });

    await Promise.allSettled(promises);
  }

  private async persistEvent(event: EventEnvelope): Promise<void> {
    if (!this.redis) return;
    try {
      const key = `events:${event.type}:${event.id}`;
      await this.redis.set(key, JSON.stringify(event), { ex: 86400 });
    } catch (error) {
      logger.error("[EventBus] Failed to persist event", { error, eventId: event.id });
    }
  }

  private async pushToStream(event: EventEnvelope): Promise<void> {
    if (!this.redis) return;
    try {
      const streamKey = `stream:${event.type}`;
      await this.redis.xadd(streamKey, "*", {
        id: event.id,
        type: event.type,
        data: JSON.stringify(event.data),
        metadata: JSON.stringify(event.metadata),
      });
      await this.redis.xtrim(streamKey, { strategy: "MAXLEN", threshold: 10000 });
    } catch (error) {
      logger.error("[EventBus] Failed to push to stream", { error, eventId: event.id });
    }
  }

  async replay(eventType: string, fromTimestamp?: string): Promise<number> {
    if (!this.redis) return 0;
    const pattern = `events:${eventType}:*`;
    const keys = await this.redis.keys(pattern);

    let replayed = 0;
    for (const key of keys) {
      const raw = await this.redis.get<string>(key);
      if (!raw) continue;

      const event = JSON.parse(raw) as EventEnvelope;
      if (fromTimestamp && event.metadata.timestamp < fromTimestamp) continue;

      await this.dispatchToHandlers(event);
      replayed++;
    }

    return replayed;
  }

  async consumeDLQ(): Promise<EventEnvelope[]> {
    const failed = [...this.dlq];
    this.dlq = [];
    return failed;
  }

  async healthCheck(): Promise<boolean> {
    if (!this.redis) return true;
    try {
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }
}

export const eventBus = new EventBus();
