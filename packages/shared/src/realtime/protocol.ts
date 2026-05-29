import type { RealtimeEnvelope, RealtimeEventType } from "../types";

export function channelForChat(chatId: string): string {
  return `chat:${chatId}`;
}

export function channelForOrg(orgId: string): string {
  return `org:${orgId}`;
}

export function channelForUser(userId: string): string {
  return `user:${userId}`;
}

export function createEvent<T>(
  type: RealtimeEventType,
  channel: string,
  payload: T,
  userId?: string
): RealtimeEnvelope<T> {
  return {
    type,
    channel,
    payload,
    timestamp: new Date().toISOString(),
    userId,
  };
}

export const REALTIME_CHANNELS = {
  chat: channelForChat,
  org: channelForOrg,
  user: channelForUser,
} as const;
