import { prisma } from "@/lib/prisma";
import { WebhookEvent, WebhookStatus } from "@prisma/client";
import { logger } from "../observability/logging/logger";

type WebhookPayload = {
  event: WebhookEvent;
  data: Record<string, unknown>;
  timestamp: string;
  organizationId?: string;
};

class WebhookEngine {
  private readonly MAX_RETRIES = 5;
  private readonly BASE_DELAY = 1000;

  async dispatch(event: WebhookEvent, data: Record<string, unknown>, organizationId?: string): Promise<void> {
    const configs = await prisma.webhookConfig.findMany({
      where: {
        status: "ACTIVE" as WebhookStatus,
        events: { has: event },
        ...(organizationId ? { organizationId } : {}),
      },
    });

    if (configs.length === 0) return;

    const payload: WebhookPayload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      organizationId,
    };

    const deliveries = configs.map((config) => this.deliver(config, payload));
    await Promise.allSettled(deliveries);
  }

  private async deliver(config: { id: string; url: string; secret: string | null; retryCount: number; timeoutMs: number; headers: any }, payload: WebhookPayload): Promise<void> {
    const maxAttempts = config.retryCount || 3;
    const body = JSON.stringify(payload);
    const signature = config.secret ? await this.sign(body, config.secret) : undefined;

    let attempt = 1;
    while (attempt <= maxAttempts) {
      const start = performance.now();
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), config.timeoutMs || 10000);

        const response = await fetch(config.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "JurisAI-Webhook/1.0",
            "X-JurisAI-Event": payload.event,
            "X-JurisAI-Delivery": crypto.randomUUID(),
            "X-JurisAI-Timestamp": payload.timestamp,
            ...(signature ? { "X-JurisAI-Signature": signature } : {}),
            ...(config.headers || {}),
          },
          body,
          signal: controller.signal,
        });

        clearTimeout(timeout);
        const durationMs = Math.round(performance.now() - start);

        await this.recordDelivery(config.id, payload, {
          status: response.ok ? "delivered" : "failed",
          responseCode: response.status,
          responseBody: await response.text().catch(() => null),
          attempt,
          durationMs,
        });

        if (response.ok) return;

        logger.warn(`[Webhook] Delivery failed (${response.status}), attempt ${attempt}/${maxAttempts}`, {
          url: config.url,
          event: payload.event,
        });
      } catch (error: any) {
        const durationMs = Math.round(performance.now() - start);
        await this.recordDelivery(config.id, payload, {
          status: "failed",
          errorMessage: error.message,
          attempt,
          durationMs,
        });

        logger.error(`[Webhook] Delivery error, attempt ${attempt}/${maxAttempts}`, {
          url: config.url,
          error: error.message,
        });
      }

      if (attempt < maxAttempts) {
        const delay = this.BASE_DELAY * Math.pow(2, attempt - 1) + Math.random() * 500;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      attempt++;
    }

    await prisma.webhookConfig.update({
      where: { id: config.id },
      data: { status: "FAILED" as WebhookStatus },
    });
  }

  private async recordDelivery(
    webhookConfigId: string,
    payload: WebhookPayload,
    result: { status: string; responseCode?: number; responseBody?: string | null; errorMessage?: string; attempt: number; durationMs: number },
  ): Promise<void> {
    try {
      await prisma.webhookDelivery.create({
        data: {
          webhookConfigId,
          event: payload.event,
          payload: payload.data as any,
          responseCode: result.responseCode,
          responseBody: result.responseBody,
          status: result.status,
          attempt: result.attempt,
          maxAttempts: this.MAX_RETRIES,
          errorMessage: result.errorMessage,
          durationMs: result.durationMs,
          completedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error("[Webhook] Failed to record delivery", { error });
    }
  }

  private async sign(payload: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async retryFailedDeliveries(): Promise<number> {
    const failedDeliveries = await prisma.webhookDelivery.findMany({
      where: { status: "failed", attempt: { lt: this.MAX_RETRIES } },
      include: { webhookConfig: true },
      take: 100,
    });

    let retried = 0;
    for (const delivery of failedDeliveries) {
      if (delivery.webhookConfig.status !== "ACTIVE") continue;
      const payload: WebhookPayload = {
        event: delivery.event as WebhookEvent,
        data: delivery.payload as Record<string, unknown>,
        timestamp: new Date().toISOString(),
      };
      await this.deliver(delivery.webhookConfig, payload);
      retried++;
    }

    return retried;
  }

  async getDeliveryStats(organizationId: string): Promise<{
    total: number;
    successful: number;
    failed: number;
    pending: number;
    avgResponseTime: number;
  }> {
    const deliveries = await prisma.webhookDelivery.findMany({
      where: {
        webhookConfig: { organizationId },
      },
      select: { status: true, durationMs: true },
    });

    const stats = {
      total: deliveries.length,
      successful: deliveries.filter((d) => d.status === "delivered").length,
      failed: deliveries.filter((d) => d.status === "failed").length,
      pending: deliveries.filter((d) => d.status === "pending").length,
      avgResponseTime: 0,
    };

    const withDuration = deliveries.filter((d) => d.durationMs != null);
    stats.avgResponseTime = withDuration.length > 0 ? Math.round(withDuration.reduce((a, b) => a + (b.durationMs || 0), 0) / withDuration.length) : 0;

    return stats;
  }
}

export const webhookEngine = new WebhookEngine();
