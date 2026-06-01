import { NextRequest, NextResponse } from "next/server";
import type { AgentCategory, AgentPricingModel } from "@prisma/client";
import { gateway, type GatewayContext } from "@/platform/api-gateway/gateway";
import { marketplaceService } from "@/platform/agent-marketplace/marketplace-service";

gateway.register({
  path: "/marketplace/agents",
  methods: ["GET"],
  scopes: ["READ"],
  handler: async (req: NextRequest, ctx: GatewayContext) => {
    const url = new URL(req.url);
    const params = {
      query: url.searchParams.get("q") || undefined,
      category: url.searchParams.get("category") as AgentCategory || undefined,
      pricingModel: url.searchParams.get("pricing") as AgentPricingModel || undefined,
      limit: parseInt(url.searchParams.get("limit") || "20"),
      offset: parseInt(url.searchParams.get("offset") || "0"),
    };
    const result = await marketplaceService.searchAgents(params);
    return NextResponse.json(result);
  },
});

gateway.register({
  path: "/marketplace/agents",
  methods: ["POST"],
  scopes: ["WRITE"],
  handler: async (req: NextRequest, ctx: GatewayContext) => {
    const body = await req.json();
    const agent = await marketplaceService.submitAgent({
      ...body,
      userId: ctx.userId!,
      organizationId: ctx.organizationId,
    });
    return NextResponse.json(agent, { status: 201 });
  },
});

gateway.register({
  path: "/marketplace/agents/:id/review",
  methods: ["POST"],
  scopes: ["WRITE"],
  handler: async (req: NextRequest, ctx: GatewayContext) => {
    const id = req.nextUrl.pathname.split("/")[4];
    const body = await req.json();
    const review = await marketplaceService.reviewAgent(id, ctx.userId!, body.rating, body.comment);
    return NextResponse.json(review);
  },
});

gateway.register({
  path: "/marketplace/agents/:id/install",
  methods: ["POST"],
  scopes: ["AGENTS_INSTALL", "WRITE"],
  handler: async (req: NextRequest, ctx: GatewayContext) => {
    const id = req.nextUrl.pathname.split("/")[4];
    const body = await req.json().catch(() => ({}));
    const installation = await marketplaceService.installAgent(id, ctx.organizationId!, ctx.userId!, body.config);
    return NextResponse.json(installation, { status: 201 });
  },
});

gateway.register({
  path: "/marketplace/installed",
  methods: ["GET"],
  scopes: ["READ"],
  handler: async (_req: NextRequest, ctx: GatewayContext) => {
    const installations = await marketplaceService.getOrganizationInstallations(ctx.organizationId!);
    return NextResponse.json(installations);
  },
});

export async function GET(req: NextRequest) { return gateway.handle(req); }
export async function POST(req: NextRequest) { return gateway.handle(req); }
