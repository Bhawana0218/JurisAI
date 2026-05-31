import { prisma } from "@/lib/prisma";
import { AuditEventType } from "@prisma/client";

type AuditEntry = {
  action: string;
  userId?: string;
  organizationId?: string;
  statusCode: number;
  durationMs: number;
  resourceId?: string;
  resourceType?: string;
  details?: Record<string, unknown>;
};

class AuditMiddleware {
  async log(entry: AuditEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          eventType: this.mapActionToEventType(entry.action),
          actorId: entry.userId,
          organizationId: entry.organizationId,
          resourceId: entry.resourceId,
          resourceType: entry.resourceType,
          action: entry.action,
          details: {
            ...entry.details,
            statusCode: entry.statusCode,
            durationMs: entry.durationMs,
          } as any,
          severity: entry.statusCode >= 500 ? "error" : entry.statusCode >= 400 ? "warning" : "info",
        },
      });
    } catch (error) {
      console.error("[Audit] Failed to log entry:", error);
    }
  }

  async query(params: {
    organizationId: string;
    eventTypes?: AuditEventType[];
    startDate?: Date;
    endDate?: Date;
    actorId?: string;
    limit?: number;
    offset?: number;
  }) {
    return prisma.auditLog.findMany({
      where: {
        organizationId: params.organizationId,
        ...(params.eventTypes?.length ? { eventType: { in: params.eventTypes } } : {}),
        ...(params.startDate ? { createdAt: { gte: params.startDate } } : {}),
        ...(params.endDate ? { createdAt: { lte: params.endDate } } : {}),
        ...(params.actorId ? { actorId: params.actorId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: params.limit || 50,
      skip: params.offset || 0,
      include: { actor: { select: { name: true, email: true } } },
    });
  }

  async export(organizationId: string, startDate: Date, endDate: Date): Promise<Blob> {
    const logs = await prisma.auditLog.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate, lte: endDate },
      },
      orderBy: { createdAt: "desc" },
    });

    const csvHeader = "Timestamp,Event Type,Actor,Resource,Action,Details,Severity\n";
    const csvRows = logs
      .map((l) =>
        [
          l.createdAt.toISOString(),
          l.eventType,
          l.actorId || "system",
          `${l.resourceType}/${l.resourceId || "unknown"}`,
          l.action,
          JSON.stringify(l.details || {}).replace(/"/g, '""'),
          l.severity,
        ].join(","),
      )
      .join("\n");

    return new Blob([csvHeader + csvRows], { type: "text/csv" });
  }

  private mapActionToEventType(action: string): AuditEventType {
    if (action.startsWith("GET")) return "API_CALL";
    if (action.startsWith("POST") || action.startsWith("PUT") || action.startsWith("PATCH")) return "DATA_MODIFICATION";
    if (action.startsWith("DELETE")) return "DATA_MODIFICATION";
    if (action.includes("login") || action.includes("Login")) return "USER_LOGIN";
    if (action.includes("logout")) return "USER_LOGOUT";
    return "API_CALL";
  }
}

export const auditMiddleware = new AuditMiddleware();
