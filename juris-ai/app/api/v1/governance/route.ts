import { NextRequest, NextResponse } from "next/server";
import { gateway, type GatewayContext } from "@/platform/api-gateway/gateway";
import { governanceEngine } from "@/platform/governance/governance-engine";
import { GovernanceAction } from "@prisma/client";

gateway.register({
  path: "/governance/check",
  methods: ["POST"],
  scopes: ["WRITE"],
  handler: async (req: NextRequest, ctx: GatewayContext) => {
    const body = await req.json();
    const result = await governanceEngine.checkContent({
      content: body.content,
      userId: ctx.userId!,
      organizationId: ctx.organizationId,
      context: body.context,
    });
    return NextResponse.json(result);
  },
});

gateway.register({
  path: "/governance/rules",
  methods: ["POST"],
  scopes: ["GOVERNANCE_MANAGE", "WRITE"],
  handler: async (req: NextRequest, ctx: GatewayContext) => {
    const body = await req.json();
    const rule = await governanceEngine.createRule({
      ...body,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    });
    return NextResponse.json(rule, { status: 201 });
  },
});

gateway.register({
  path: "/governance/rules",
  methods: ["GET"],
  scopes: ["GOVERNANCE_READ", "READ"],
  handler: async (_req: NextRequest, ctx: GatewayContext) => {
    const rules = await governanceEngine.listRules(ctx.organizationId);
    return NextResponse.json(rules);
  },
});

gateway.register({
  path: "/governance/stats",
  methods: ["GET"],
  scopes: ["GOVERNANCE_READ", "READ"],
  handler: async (_req: NextRequest, ctx: GatewayContext) => {
    const stats = await governanceEngine.getStats(ctx.organizationId!);
    return NextResponse.json(stats);
  },
});

export async function GET(req: NextRequest) { return gateway.handle(req); }
export async function POST(req: NextRequest) { return gateway.handle(req); }
