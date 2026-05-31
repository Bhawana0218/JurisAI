import { NextRequest, NextResponse } from "next/server";
import { gateway, type GatewayContext } from "@/platform/api-gateway/gateway";
import { workflowEngine } from "@/platform/workflow-engine/workflow-engine";

gateway.register({
  path: "/executions/:id",
  methods: ["GET"],
  scopes: ["READ"],
  handler: async (req: NextRequest, ctx: GatewayContext) => {
    const id = req.nextUrl.pathname.split("/").pop()!;
    const execution = await workflowEngine.getExecution(id);
    if (!execution) return NextResponse.json({ error: "Execution not found" }, { status: 404 });
    return NextResponse.json(execution);
  },
});

gateway.register({
  path: "/executions/:id/cancel",
  methods: ["POST"],
  scopes: ["WRITE"],
  handler: async (req: NextRequest, ctx: GatewayContext) => {
    const id = req.nextUrl.pathname.split("/")[3];
    const execution = await workflowEngine.cancelExecution(id);
    return NextResponse.json(execution);
  },
});

export async function GET(req: NextRequest) { return gateway.handle(req); }
export async function POST(req: NextRequest) { return gateway.handle(req); }
