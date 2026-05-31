// Realtime
export type RealtimeEventType =
  | "message.new"
  | "message.updated"
  | "message.deleted"
  | "typing.start"
  | "typing.stop"
  | "presence.change"
  | "chat.updated"
  | "agent.executing"
  | "agent.completed"
  | "workflow.update"
  | "collaboration.join"
  | "collaboration.leave"
  | "notification";

export interface RealtimeEnvelope<T = unknown> {
  type: RealtimeEventType;
  channel: string;
  payload: T;
  timestamp: string;
  senderId?: string;
  id: string;
}

export interface SyncOperation {
  id: string;
  entityType: string;
  entityId: string;
  operation: "CREATE" | "UPDATE" | "DELETE";
  payload: unknown;
  timestamp: number;
}

export interface PresenceState {
  userId: string;
  status: "online" | "away" | "offline";
  device?: "web" | "ios" | "android";
  lastSeenAt: string;
}

export interface OfflineChatMessage {
  clientId: string;
  chatId: string;
  content: string;
  role: "user" | "assistant";
  timestamp: number;
}

export interface MobileDeviceRegistration {
  deviceId: string;
  platform: "ios" | "android";
  pushToken?: string;
  appVersion?: string;
  biometricEnabled?: boolean;
}

// Platform types
export interface ApiKeyResponse {
  id: string;
  name: string;
  keyPrefix: string;
  fullKey: string;
  scopes: string[];
  createdAt: string;
}

export interface WebhookConfigResponse {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "paused" | "failed";
  createdAt: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "active" | "paused" | "archived";
  steps: WorkflowStep[];
  createdAt: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: "ai_agent" | "condition" | "transform" | "api_call" | "human_review" | "webhook" | "delay" | "notification";
  order: number;
  config: Record<string, unknown>;
}

export interface WorkflowExecutionResponse {
  id: string;
  workflowId: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  currentStep: number;
  totalSteps: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  stepResults?: WorkflowStepResult[];
}

export interface WorkflowStepResult {
  id: string;
  stepName: string;
  stepType: string;
  status: string;
  output?: unknown;
  error?: string;
  durationMs?: number;
}

export interface AgentExecutionResponse {
  id: string;
  text: string;
  tokensUsed: number;
  durationMs: number;
  modelUsed: string;
  cost: number;
  citations: Array<{ chunkId?: string; documentId?: string; title?: string; snippet?: string; score?: number }>;
}

export interface MarketplaceAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  pricingModel: string;
  price: number;
  rating: number;
  totalInstalls: number;
  author: { name?: string; image?: string };
  tags: string[];
}

export interface KnowledgeGraphQueryResult {
  nodes: Array<{ id: string; label: string; type: string; score: number }>;
  edges: Array<{ id: string; source: string; target: string; relation: string }>;
}

export interface GovernanceCheckResult {
  allowed: boolean;
  action: string;
  ruleId?: string;
  reason?: string;
  maskedOutput?: string;
}

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  checks: {
    database: { status: string; latencyMs?: number };
    redis: { status: string; latencyMs?: number };
    eventBus: { status: string };
    memory: { status: string };
  };
  timestamp: string;
}

export interface UsageStats {
  totalTokens: number;
  tokenLimit: number;
  apiCalls: number;
  apiCallLimit: number;
  agentCalls: number;
  agentLimit: number;
  percentageUsed: number;
}
