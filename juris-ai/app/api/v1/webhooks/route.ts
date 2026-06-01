import { NextRequest, NextResponse } from "next/server";
import { gateway, type GatewayContext } from "@/platform/api-gateway/gateway";
import { prisma } from "@/lib/prisma";
import { webhookEngine } from "@/platform/webhooks/webhook-engine";

gateway.register({
  path: "/webhooks",
  methods: ["POST"],
  scopes: ["WEBHOOKS_MANAGE", "WRITE"],
  handler: async (req: NextRequest, ctx: GatewayContext) => {
    const body = await req.json();
    const webhook = await prisma.webhookConfig.create({
      data: {
        name: body.name,
        url: body.url,
        secret: body.secret || crypto.randomUUID(),
        events: body.events,
        status: "ACTIVE",
        retryCount: body.retryCount || 3,
        timeoutMs: body.timeoutMs || 10000,
        userId: ctx.userId,
        organizationId: ctx.organizationId,
      },
    });
    return NextResponse.json(webhook, { status: 201 });
  },
});

gateway.register({
  path: "/webhooks",
  methods: ["GET"],
  scopes: ["WEBHOOKS_READ", "READ"],
  handler: async (_req: NextRequest, ctx: GatewayContext) => {
    const webhooks = await prisma.webhookConfig.findMany({
      where: { organizationId: ctx.organizationId },
      include: { _count: { select: { deliveries: true } } },
    });
    return NextResponse.json(webhooks);
  },
});

gateway.register({
  path: "/webhooks/:id",
  methods: ["DELETE"],
  scopes: ["WEBHOOKS_MANAGE", "WRITE"],
  handler: async (req: NextRequest, _ctx: GatewayContext) => {
    const id = req.nextUrl.pathname.split("/").pop()!;
    await prisma.webhookConfig.delete({ where: { id } });
    return NextResponse.json({ success: true });
  },
});

gateway.register({
  path: "/webhooks/stats",
  methods: ["GET"],
  scopes: ["WEBHOOKS_READ", "READ"],
  handler: async (_req: NextRequest, ctx: GatewayContext) => {
    const stats = await webhookEngine.getDeliveryStats(ctx.organizationId!);
    return NextResponse.json(stats);
  },
});

gateway.register({
  path: "/webhooks/retry",
  methods: ["POST"],
  handler: async (_req: NextRequest, _ctx: GatewayContext) => {
    const count = await webhookEngine.retryFailedDeliveries();
    return NextResponse.json({ retried: count });
  },
});

export async function GET(req: NextRequest) { return gateway.handle(req); }
export async function POST(req: NextRequest) { return gateway.handle(req); }
export async function DELETE(req: NextRequest) { return gateway.handle(req); }
