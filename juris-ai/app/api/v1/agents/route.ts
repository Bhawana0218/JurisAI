import { NextRequest, NextResponse } from "next/server";
import type { WebhookEvent } from "@prisma/client";
import { gateway, type GatewayContext } from "@/platform/api-gateway/gateway";
import { aiRuntime } from "@/platform/ai-runtime/ai-runtime";
import { marketplaceService } from "@/platform/agent-marketplace/marketplace-service";
import { webhookEngine } from "@/platform/webhooks/webhook-engine";
import { metrics } from "@/platform/observability/metrics/metrics-collector";

gateway.register({
  path: "/agents/execute",
  methods: ["POST"],
  scopes: ["AGENT_EXECUTE", "WRITE"],
  rateLimit: { max: 30, window: 60000 },
  handler: async (req: NextRequest, ctx: GatewayContext) => {
    const body = await req.json();
    const { agentType, query, model } = body;

    if (!query) return NextResponse.json({ error: "Query is required" }, { status: 400 });

    const result = await aiRuntime.executeAgent({
      agentType: agentType || "GENERAL",
      systemPrompt: `You are a specialized legal AI assistant for ${agentType || "general"} queries.`,
      messages: [{ role: "user", content: query }],
      model,
      userId: ctx.userId,
      organizationId: ctx.organizationId,
    });

    await webhookEngine.dispatch("AGENT_EXECUTED" as WebhookEvent, {
      executionId: result.id,
      agentType,
      status: "completed",
      tokensUsed: result.tokensUsed,
    }, ctx.organizationId);

    metrics.increment("agent.executions", { agentType: agentType || "general" });

    return NextResponse.json(result, { status: 200 });
  },
});

gateway.register({
  path: "/agents",
  methods: ["GET"],
  scopes: ["READ"],
  handler: async (_req: NextRequest, _ctx: GatewayContext) => {
    const { agents } = await marketplaceService.searchAgents({ limit: 50 });
    return NextResponse.json(agents);
  },
});

gateway.register({
  path: "/agents/:id",
  methods: ["GET"],
  scopes: ["READ"],
  handler: async (_req: NextRequest, _ctx: GatewayContext) => {
    const agentId = _req.nextUrl.pathname.split("/").pop()!;
    const agent = await marketplaceService.getAgentDetails(agentId);
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    return NextResponse.json(agent);
  },
});

export async function GET(req: NextRequest) { return gateway.handle(req); }
export async function POST(req: NextRequest) { return gateway.handle(req); }
