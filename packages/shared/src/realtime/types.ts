export type RealtimeEventType =
  | "message"
  | "presence"
  | "typing"
  | "system";

export interface RealtimeEnvelope<T = unknown> {
     id?: string;
  type: RealtimeEventType;
  channel: string;
  payload: T;
  timestamp: string;

  // OPTIONAL → FIXS YOUR ERROR
  userId?: string;
}