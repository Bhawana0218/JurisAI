import { NextRequest, NextResponse } from "next/server";
import type { AuditEventType } from "@prisma/client";
import { gateway, type GatewayContext } from "@/platform/api-gateway/gateway";
import { auditMiddleware } from "@/platform/api-gateway/middleware/audit-middleware";

gateway.register({
  path: "/audit/logs",
  methods: ["GET"],
  scopes: ["AUDIT_READ", "READ"],
  handler: async (req: NextRequest, ctx: GatewayContext) => {
    const url = new URL(req.url);
    const logs = await auditMiddleware.query({
      organizationId: ctx.organizationId!,
      eventTypes: url.searchParams.getAll("eventType") as AuditEventType[],
      startDate: url.searchParams.get("startDate") ? new Date(url.searchParams.get("startDate")!) : undefined,
      endDate: url.searchParams.get("endDate") ? new Date(url.searchParams.get("endDate")!) : undefined,
      actorId: url.searchParams.get("actorId") || undefined,
      limit: parseInt(url.searchParams.get("limit") || "50"),
      offset: parseInt(url.searchParams.get("offset") || "0"),
    });
    return NextResponse.json(logs);
  },
});

gateway.register({
  path: "/audit/export",
  methods: ["GET"],
  scopes: ["AUDIT_EXPORT", "WRITE"],
  handler: async (req: NextRequest, ctx: GatewayContext) => {
    const url = new URL(req.url);
    const startDate = new Date(url.searchParams.get("startDate")!);
    const endDate = new Date(url.searchParams.get("endDate")!);
    const csv = await auditMiddleware.export(ctx.organizationId!, startDate, endDate);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="audit-${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}.csv"`,
      },
    });
  },
});

export async function GET(req: NextRequest) { return gateway.handle(req); }
