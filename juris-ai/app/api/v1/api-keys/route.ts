import { NextRequest, NextResponse } from "next/server";
import { gateway, type GatewayContext } from "@/platform/api-gateway/gateway";
import { apiKeyManager } from "@/platform/developer-sdk/keys/api-key-manager";

gateway.register({
  path: "/api-keys",
  methods: ["POST"],
  scopes: ["API_KEYS_MANAGE", "WRITE"],
  handler: async (req: NextRequest, ctx: GatewayContext) => {
    const body = await req.json();
    const apiKey = await apiKeyManager.create({
      name: body.name,
      userId: ctx.userId,
      organizationId: ctx.organizationId,
      scopes: body.scopes || ["READ"],
      rateLimit: body.rateLimit,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });
    return NextResponse.json(apiKey, { status: 201 });
  },
});

gateway.register({
  path: "/api-keys",
  methods: ["GET"],
  scopes: ["API_KEYS_READ", "READ"],
  handler: async (_req: NextRequest, ctx: GatewayContext) => {
    const keys = await apiKeyManager.list(ctx.organizationId!);
    return NextResponse.json(keys);
  },
});

gateway.register({
  path: "/api-keys/:id/revoke",
  methods: ["POST"],
  scopes: ["API_KEYS_MANAGE", "WRITE"],
  handler: async (req: NextRequest, _ctx: GatewayContext) => {
    const id = req.nextUrl.pathname.split("/")[3];
    await apiKeyManager.revoke(id);
    return NextResponse.json({ success: true });
  },
});

export async function GET(req: NextRequest) { return gateway.handle(req); }
export async function POST(req: NextRequest) { return gateway.handle(req); }
