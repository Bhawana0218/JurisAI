import { eventBus, type EventEnvelope } from "../event-bus";
import { WebhookEvent } from "@prisma/client";

class WebhookEventProducer {
  async emitWebhookEvent(
    event: WebhookEvent,
    data: Record<string, unknown>,
    context?: { userId?: string; organizationId?: string },
  ): Promise<string> {
    return eventBus.publish({
      type: `webhook.${event.toLowerCase().replace(/_/g, ".")}`,
      source: "jurisai:webhook-engine",
      subject: `webhook:${event}`,
      data,
      metadata: {
        userId: context?.userId,
        organizationId: context?.organizationId,
        version: 1,
      },
    });
  }

  async emitAgentExecuted(execution: {
    agentType: string;
    userId: string;
    organizationId?: string;
    durationMs: number;
    status: string;
  }): Promise<string> {
    return this.emitWebhookEvent("AGENT_EXECUTED" as WebhookEvent, execution, {
      userId: execution.userId,
      organizationId: execution.organizationId,
    });
  }

  async emitWorkflowCompleted(workflow: {
    workflowId: string;
    status: string;
    userId: string;
    organizationId?: string;
    durationMs: number;
  }): Promise<string> {
    return this.emitWebhookEvent("WORKFLOW_COMPLETED" as WebhookEvent, workflow, {
      userId: workflow.userId,
      organizationId: workflow.organizationId,
    });
  }

  async emitUsageThreshold(params: {
    metric: string;
    currentValue: number;
    threshold: number;
    organizationId: string;
  }): Promise<string> {
    return this.emitWebhookEvent("USAGE_THRESHOLD" as WebhookEvent, params, {
      organizationId: params.organizationId,
    });
  }
}

export const webhookEventProducer = new WebhookEventProducer();
