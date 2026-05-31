import { NextRequest, NextResponse } from "next/server";
import { gateway, type GatewayContext } from "@/platform/api-gateway/gateway";
import { prisma } from "@/lib/prisma";
import { usageMeter } from "@/platform/billing/metering/usage-meter";

gateway.register({
  path: "/analytics/usage",
  methods: ["GET"],
  scopes: ["ANALYTICS_READ", "READ"],
  handler: async (req: NextRequest, ctx: GatewayContext) => {
    const url = new URL(req.url);
    const usage = await usageMeter.getUsage({
      organizationId: ctx.organizationId,
      startDate: url.searchParams.get("startDate") ? new Date(url.searchParams.get("startDate")!) : undefined,
      endDate: url.searchParams.get("endDate") ? new Date(url.searchParams.get("endDate")!) : undefined,
      granularity: (url.searchParams.get("granularity") as any) || "day",
    });
    return NextResponse.json(usage);
  },
});

gateway.register({
  path: "/analytics/current-period",
  methods: ["GET"],
  scopes: ["ANALYTICS_READ", "READ"],
  handler: async (_req: NextRequest, ctx: GatewayContext) => {
    const usage = await usageMeter.getCurrentPeriodUsage(ctx.organizationId!);
    return NextResponse.json(usage);
  },
});

gateway.register({
  path: "/analytics/overview",
  methods: ["GET"],
  scopes: ["ANALYTICS_READ", "READ"],
  handler: async (_req: NextRequest, ctx: GatewayContext) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalChats, totalDocuments, totalCases, totalUsers, totalTokens, totalApiCalls] = await Promise.all([
      prisma.chat.count({ where: { organizationId: ctx.organizationId } }),
      prisma.document.count({ where: { organizationId: ctx.organizationId } }),
      prisma.legalCase.count({ where: { organizationId: ctx.organizationId } }),
      prisma.organizationMember.count({ where: { organizationId: ctx.organizationId } }),
      prisma.aIUsageLog.aggregate({ where: { organizationId: ctx.organizationId, createdAt: { gte: thirtyDaysAgo } }, _sum: { totalTokens: true } }),
      prisma.aIUsageLog.count({ where: { organizationId: ctx.organizationId, createdAt: { gte: thirtyDaysAgo } } }),
    ]);

    return NextResponse.json({
      totalChats,
      totalDocuments,
      totalCases,
      totalUsers,
      tokensUsed: totalTokens._sum.totalTokens || 0,
      apiCalls: totalApiCalls,
    });
  },
});

export async function GET(req: NextRequest) { return gateway.handle(req); }
