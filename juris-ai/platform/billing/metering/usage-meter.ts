import { prisma } from "@/lib/prisma";
import { eventBus } from "../../event-bus/event-bus";
import { logger } from "../../observability/logging/logger";

type UsageRecord = {
  organizationId?: string;
  userId?: string;
  metric: string;
  value: number;
  unit: string;
  dimensions?: Record<string, string>;
};

class UsageMeter {
  private readonly USAGE_ALERT_THRESHOLDS: Record<string, number> = {
    tokens_total: 0.8,
    api_calls: 0.8,
    agent_calls: 0.8,
    storage_gb: 0.9,
  };

  async record(records: UsageRecord | UsageRecord[]): Promise<void> {
    const items = Array.isArray(records) ? records : [records];

    await prisma.usageMeter.createMany({
      data: items.map((r) => ({
        organizationId: r.organizationId,
        userId: r.userId,
        metric: r.metric,
        value: r.value,
        unit: r.unit,
        dimensions: (r.dimensions || {}) as any,
      })),
    });

    for (const item of items) {
      if (item.organizationId) {
        await this.checkThresholds(item.organizationId, item.metric);
      }
    }
  }

  async getUsage(params: {
    organizationId?: string;
    userId?: string;
    metric?: string;
    startDate?: Date;
    endDate?: Date;
    granularity?: "hour" | "day" | "week" | "month";
  }): Promise<Array<{ period: string; metric: string; value: number; unit: string }>> {
    const where: any = {};
    if (params.organizationId) where.organizationId = params.organizationId;
    if (params.userId) where.userId = params.userId;
    if (params.metric) where.metric = params.metric;
    if (params.startDate) where.recordedAt = { ...(where.recordedAt || {}), gte: params.startDate };
    if (params.endDate) where.recordedAt = { ...(where.recordedAt || {}), lte: params.endDate };

    const records = await prisma.usageMeter.findMany({
      where,
      orderBy: { recordedAt: "asc" },
    });

    const granularity = params.granularity || "day";
    const grouped = new Map<string, { value: number; unit: string }>();

    for (const r of records) {
      const period = this.formatPeriod(r.recordedAt, granularity);
      const key = `${period}:${r.metric}`;
      const existing = grouped.get(key) || { value: 0, unit: r.unit };
      existing.value += r.value;
      grouped.set(key, existing);
    }

    return Array.from(grouped.entries()).map(([key, val]) => {
      const [period, metric] = key.split(":");
      return { period, metric, value: val.value, unit: val.unit };
    });
  }

  async getCurrentPeriodUsage(organizationId: string): Promise<{
    tokensUsed: number;
    tokenLimit: number;
    apiCalls: number;
    apiCallLimit: number;
    agentCalls: number;
    agentLimit: number;
    percentageUsed: number;
  }> {
    const subscription = await prisma.subscription.findFirst({
      where: { organizationId, status: "ACTIVE" },
    });

    const periodStart = subscription?.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd.getTime() - 30 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const usage = await prisma.usageMeter.groupBy({
      where: {
        organizationId,
        recordedAt: { gte: periodStart },
        metric: { in: ["tokens_total", "api_calls", "agent_calls"] },
      },
      _sum: { value: true },
      by: ["metric"],
    });

    const tokensUsed = usage.find((u: any) => u.metric === "tokens_total")?._sum.value || 0;
    const apiCalls = usage.find((u: any) => u.metric === "api_calls")?._sum.value || 0;
    const agentCalls = usage.find((u: any) => u.metric === "agent_calls")?._sum.value || 0;

    return {
      tokensUsed,
      tokenLimit: subscription?.monthlyTokenLimit || 50000,
      apiCalls,
      apiCallLimit: subscription?.monthlyApiCallLimit || 1000,
      agentCalls,
      agentLimit: subscription?.monthlyAgentLimit || 100,
      percentageUsed: Math.max(tokensUsed / (subscription?.monthlyTokenLimit || 50000), apiCalls / (subscription?.monthlyApiCallLimit || 1000)) * 100,
    };
  }

  private async checkThresholds(organizationId: string, metric: string): Promise<void> {
    const threshold = this.USAGE_ALERT_THRESHOLDS[metric];
    if (!threshold) return;

    const usage = await this.getCurrentPeriodUsage(organizationId);
    const usagePercent =
      metric === "tokens_total"
        ? usage.tokensUsed / usage.tokenLimit
        : metric === "api_calls"
          ? usage.apiCalls / usage.apiCallLimit
          : metric === "agent_calls"
            ? usage.agentCalls / usage.agentLimit
            : 0;

    if (usagePercent >= threshold) {
      const existingAlert = await prisma.usageAlert.findFirst({
        where: { organizationId, metric, status: "ACTIVE" },
      });

      if (!existingAlert) {
        await prisma.usageAlert.create({
          data: {
            organizationId,
            metric,
            threshold: threshold * 100,
            currentValue: usagePercent * 100,
          },
        });

        await eventBus.publish({
          type: "usage.threshold.reached",
          source: "jurisai:usage-meter",
          data: { organizationId, metric, usagePercent, threshold },
          metadata: { organizationId, version: 1 },
        });
      }
    }
  }

  private formatPeriod(date: Date, granularity: string): string {
    const d = date.toISOString();
    switch (granularity) {
      case "hour": return d.slice(0, 13);
      case "day": return d.slice(0, 10);
      case "week": {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay());
        return start.toISOString().slice(0, 10);
      }
      case "month": return d.slice(0, 7);
      default: return d.slice(0, 10);
    }
  }
}

export const usageMeter = new UsageMeter();
