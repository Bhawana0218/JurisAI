import { NextRequest, NextResponse } from "next/server";
import { gateway, type GatewayContext } from "@/platform/api-gateway/gateway";
import { workflowEngine } from "@/platform/workflow-engine/workflow-engine";
import { enterpriseRbac } from "@/platform/enterprise/rbac/enterprise-rbac";
import { metrics } from "@/platform/observability/metrics/metrics-collector";

gateway.register({
  path: "/workflows",
  methods: ["POST"],
  scopes: ["WRITE", "WORKFLOW_EXECUTE"],
  handler: async (req: NextRequest, ctx: GatewayContext) => {
    const body = await req.json();
    const workflow = await workflowEngine.createWorkflow({
      ...body,
      userId: ctx.userId!,
      organizationId: ctx.organizationId,
    });
    return NextResponse.json(workflow, { status: 201 });
  },
});

gateway.register({
  path: "/workflows",
  methods: ["GET"],
  scopes: ["READ"],
  handler: async (_req: NextRequest, ctx: GatewayContext) => {
    const workflows = await workflowEngine.listWorkflows(ctx.organizationId!);
    return NextResponse.json(workflows);
  },
});

gateway.register({
  path: "/workflows/:id/execute",
  methods: ["POST"],
  scopes: ["WORKFLOW_EXECUTE", "WRITE"],
  handler: async (req: NextRequest, ctx: GatewayContext) => {
    const id = req.nextUrl.pathname.split("/")[3];
    const body = await req.json().catch(() => ({}));
    const executionId = await workflowEngine.executeWorkflow(id, body.input, ctx.userId);
    return NextResponse.json({ executionId, status: "running" }, { status: 202 });
  },
});

gateway.register({
  path: "/workflows/:id/activate",
  methods: ["POST"],
  scopes: ["WRITE"],
  handler: async (req: NextRequest, ctx: GatewayContext) => {
    const id = req.nextUrl.pathname.split("/")[3];
    const workflow = await workflowEngine.activateWorkflow(id);
    return NextResponse.json(workflow);
  },
});

export async function GET(req: NextRequest) { return gateway.handle(req); }
export async function POST(req: NextRequest) { return gateway.handle(req); }
