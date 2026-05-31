export const EventTypes = {
  // Chat events
  CHAT_CREATED: "chat.created",
  CHAT_UPDATED: "chat.updated",
  CHAT_DELETED: "chat.deleted",
  MESSAGE_CREATED: "message.created",

  // Document events
  DOCUMENT_UPLOADED: "document.uploaded",
  DOCUMENT_PROCESSED: "document.processed",
  DOCUMENT_FAILED: "document.failed",
  DOCUMENT_ANALYZED: "document.analyzed",

  // Agent events
  AGENT_EXECUTED: "agent.executed",
  AGENT_FAILED: "agent.failed",
  AGENT_INSTALLED: "agent.installed",
  AGENT_UNINSTALLED: "agent.uninstalled",

  // Workflow events
  WORKFLOW_STARTED: "workflow.started",
  WORKFLOW_STEP_COMPLETED: "workflow.step.completed",
  WORKFLOW_COMPLETED: "workflow.completed",
  WORKFLOW_FAILED: "workflow.failed",

  // Webhook events
  WEBHOOK_DELIVERED: "webhook.delivered",
  WEBHOOK_FAILED: "webhook.failed",

  // Subscription events
  SUBSCRIPTION_CREATED: "subscription.created",
  SUBSCRIPTION_UPDATED: "subscription.updated",
  SUBSCRIPTION_EXPIRED: "subscription.expired",
  USAGE_THRESHOLD_REACHED: "usage.threshold.reached",

  // Organization events
  ORGANIZATION_MEMBER_ADDED: "organization.member.added",
  ORGANIZATION_MEMBER_REMOVED: "organization.member.removed",
  ORGANIZATION_SETTINGS_CHANGED: "organization.settings.changed",

  // System events
  ERROR_OCCURRED: "error.occurred",
  DEPLOYMENT_STARTED: "deployment.started",
  DEPLOYMENT_COMPLETED: "deployment.completed",

  // Knowledge graph events
  KNOWLEDGE_NODE_CREATED: "knowledge.node.created",
  KNOWLEDGE_EDGE_CREATED: "knowledge.edge.created",
  KNOWLEDGE_SYNC_COMPLETED: "knowledge.sync.completed",

  // Plugin events
  PLUGIN_INSTALLED: "plugin.installed",
  PLUGIN_UNINSTALLED: "plugin.uninstalled",
  PLUGIN_UPDATED: "plugin.updated",
} as const;

export type EventType = (typeof EventTypes)[keyof typeof EventTypes];
