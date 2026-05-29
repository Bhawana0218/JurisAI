export type RealtimeEventType =
  | "message.created"
  | "message.streaming"
  | "typing.start"
  | "typing.stop"
  | "presence.update"
  | "sync.push"
  | "case.updated"
  | "task.updated"
  | "notification.new";

export interface RealtimeEnvelope<T = unknown> {
  type: RealtimeEventType;
  channel: string;
  payload: T;
  timestamp: string;
  userId?: string;
}

export interface SyncOperation {
  id: string;
  entityType: string;
  entityId: string;
  operation: "create" | "update" | "delete";
  payload: Record<string, unknown>;
  clientTimestamp: string;
}

export interface PresenceState {
  userId: string;
  status: "online" | "away" | "offline";
  lastSeenAt: string;
  device?: "web" | "ios" | "android";
}

export interface OfflineChatMessage {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  pendingSync: boolean;
}

export type SubscriptionPlan = "FREE" | "PRO" | "TEAM" | "ENTERPRISE";

export interface MobileDeviceRegistration {
  platform: "ios" | "android" | "web";
  pushToken?: string;
  deviceId: string;
  appVersion?: string;
}
