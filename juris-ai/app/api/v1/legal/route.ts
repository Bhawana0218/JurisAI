import { NextRequest, NextResponse } from "next/server";
import { gateway, type GatewayContext } from "@/platform/api-gateway/gateway";
import { aiRuntime } from "@/platform/ai-runtime/ai-runtime";
import { knowledgeGraph } from "@/platform/knowledge-graph/knowledge-graph-engine";

gateway.register({
  path: "/legal/research",
  methods: ["POST"],
  scopes: ["AI_RESEARCH", "WRITE"],
  rateLimit: {
    max: 20,
    window: 60000,
  },

  handler: async (
    req: NextRequest,
    ctx: GatewayContext,
  ) => {
    const body = await req.json();

    const {
      query,
      jurisdiction,
      maxResults,
    } = body;

    const [kgResults, llmResult] =
      await Promise.all([
        knowledgeGraph.query({
          query,
          maxResults: maxResults ?? 5,
        }),

        aiRuntime.executeAgent({
          agentType: "LEGAL_RESEARCH",

          systemPrompt: `
You are a legal research assistant.

Research the query and provide
structured legal analysis with citations.

Jurisdiction:
${jurisdiction ?? "India"}
          `,

          messages: [
            {
              role: "user",
              content: query,
            },
          ],

          userId: ctx.userId,
          organizationId: ctx.organizationId,
        }),
      ]);

    return NextResponse.json({
      research: llmResult.text,
      sources: kgResults.nodes,
      graph: kgResults,
      citations: llmResult.citations,
      executionId: llmResult.id,
      tokensUsed: llmResult.tokensUsed,
    });
  },
});

gateway.register({
  path: "/legal/citations",
  methods: ["POST"],
  scopes: ["READ"],

  handler: async (
    req: NextRequest,
    _ctx: GatewayContext,
  ) => {
    const body = await req.json();

    const results =
      await knowledgeGraph.query({
        query: body.query,
        maxResults: body.maxResults ?? 10,
      });

    return NextResponse.json(results);
  },
});

export async function POST(
  req: NextRequest,
) {
  return gateway.handle(req);
}