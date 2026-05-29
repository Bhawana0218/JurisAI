import { cacheGet, cacheSet, cacheKey } from "@/lib/cache/redis";

export interface RealtimeMessage {
  type: string;
  channel: string;
  payload: unknown;
  timestamp: string;
  userId?: string;
}

const CHANNEL_TTL = 300;

export async function publishEvent(
  channel: string,
  event: Omit<RealtimeMessage, "channel" | "timestamp">
): Promise<void> {
  const message: RealtimeMessage = {
    ...event,
    channel,
    timestamp: new Date().toISOString(),
  };

  const listKey = cacheKey("rt", channel, "events");
  const existing = (await cacheGet<RealtimeMessage[]>(listKey)) ?? [];
  existing.push(message);
  await cacheSet(listKey, existing.slice(-50), CHANNEL_TTL);

  await cacheSet(cacheKey("rt", channel, "latest"), message, CHANNEL_TTL);
}

export async function getChannelEvents(
  channel: string,
  since?: string
): Promise<RealtimeMessage[]> {
  const listKey = cacheKey("rt", channel, "events");
  const events = (await cacheGet<RealtimeMessage[]>(listKey)) ?? [];
  if (!since) return events;
  return events.filter((e) => e.timestamp > since);
}

export const RealtimeEvents = {
  messageCreated: "message.created",
  messageStreaming: "message.streaming",
  typingStart: "typing.start",
  typingStop: "typing.stop",
  presenceUpdate: "presence.update",
  syncPush: "sync.push",
  caseUpdated: "case.updated",
  taskUpdated: "task.updated",
  notificationNew: "notification.new",
} as const;
