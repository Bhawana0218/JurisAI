import { NextRequest, NextResponse } from "next/server";
import { gateway, type GatewayContext } from "@/platform/api-gateway/gateway";
import { enterpriseSso } from "@/platform/enterprise/sso/sso-service";

gateway.register({
  path: "/sso/connections",
  methods: ["POST"],
  scopes: ["SSO_MANAGE", "WRITE"],
  handler: async (req: NextRequest, ctx: GatewayContext) => {
    const body = await req.json();
    const connection = await enterpriseSso.createConnection({
      ...body,
      organizationId: ctx.organizationId!,
      userId: ctx.userId!,
    });
    return NextResponse.json(connection, { status: 201 });
  },
});

gateway.register({
  path: "/sso/connections",
  methods: ["GET"],
  scopes: ["SSO_MANAGE", "READ"],
  handler: async (_req: NextRequest, ctx: GatewayContext) => {
    const connections = await enterpriseSso.getConnections(ctx.organizationId!);
    return NextResponse.json(connections);
  },
});

gateway.register({
  path: "/sso/connections/:id/toggle",
  methods: ["POST"],
  scopes: ["SSO_MANAGE", "WRITE"],
  handler: async (req: NextRequest, _ctx: GatewayContext) => {
    const id = req.nextUrl.pathname.split("/")[4];
    const body = await req.json();
    const connection = await enterpriseSso.toggleConnection(id, body.enabled);
    return NextResponse.json(connection);
  },
});

gateway.register({
  path: "/sso/connections/:id",
  methods: ["DELETE"],
  scopes: ["SSO_MANAGE", "WRITE"],
  handler: async (req: NextRequest, _ctx: GatewayContext) => {
    const id = req.nextUrl.pathname.split("/").pop()!;
    await enterpriseSso.deleteConnection(id);
    return NextResponse.json({ success: true });
  },
});

export async function GET(req: NextRequest) { return gateway.handle(req); }
export async function POST(req: NextRequest) { return gateway.handle(req); }
export async function DELETE(req: NextRequest) { return gateway.handle(req); }
