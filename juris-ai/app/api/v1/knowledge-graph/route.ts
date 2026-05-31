import { NextRequest, NextResponse } from "next/server";
import {
  gateway,
  type GatewayContext,
} from "@/platform/api-gateway/gateway";
import { knowledgeGraph } from "@/platform/knowledge-graph/knowledge-graph-engine";

gateway.register({
  path: "/knowledge-graph/query",
  methods: ["POST"],
  scopes: ["READ"],
  handler: async (
    req: NextRequest,
    _ctx: GatewayContext,
  ) => {
    const body = await req.json();

    const result = await knowledgeGraph.query({
      query: body.query,
      types: body.types,
      maxResults: body.maxResults ?? 20,
      maxDepth: body.maxDepth ?? 2,
    });

    return NextResponse.json(result);
  },
});

gateway.register({
  path: "/knowledge-graph/nodes/:id",
  methods: ["GET"],
  scopes: ["READ"],
  handler: async (
    req: NextRequest,
    _ctx: GatewayContext,
  ) => {
    const id = req.nextUrl.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Node ID is required" },
        { status: 400 },
      );
    }

    const result =
      await knowledgeGraph.getNodeWithNeighbors(id);

    return NextResponse.json(result);
  },
});

gateway.register({
  path: "/knowledge-graph/extract",
  methods: ["POST"],
  scopes: ["WRITE"],
  handler: async (
    req: NextRequest,
    _ctx: GatewayContext,
  ) => {
    const body = await req.json();

    const result =
      await knowledgeGraph.buildFromText(
        body.text,
        body.sourceId,
        body.legalKnowledgeId,
      );

    return NextResponse.json(
      result,
      { status: 201 },
    );
  },
});

gateway.register({
  path: "/knowledge-graph/stats",
  methods: ["GET"],
  scopes: ["READ"],
  handler: async (
    _req: NextRequest,
    _ctx: GatewayContext,
  ) => {
    const stats =
      await knowledgeGraph.stats();

    return NextResponse.json(stats);
  },
});

export async function GET(
  req: NextRequest,
) {
  return gateway.handle(req);
}

export async function POST(
  req: NextRequest,
) {
  return gateway.handle(req);
}