import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "../developer-sdk/keys/api-key-verifier";
import { rateLimiter } from "./middleware/rate-limiter";
import { auditMiddleware } from "./middleware/audit-middleware";
import { corsMiddleware } from "./middleware/cors-middleware";
import { logger } from "../observability/logging/logger";
import { auth } from "@/lib/auth";

export type GatewayRoute = {
  path: string;
  methods: string[];
  handler: (req: NextRequest, ctx: GatewayContext) => Promise<NextResponse>;
  scopes?: string[];
  rateLimit?: { max: number; window: number };
  audit?: boolean;
};

export type GatewayContext = {
  userId?: string;
  organizationId?: string;
  apiKeyId?: string;
  scopes: string[];
  isAuthenticated: boolean;
  isEnterprise: boolean;
};

class ApiGateway {
  private routes: Map<string, GatewayRoute> = new Map();
  private middleware: Array<(req: NextRequest, ctx: GatewayContext) => Promise<GatewayContext>> = [];

  use(mw: (req: NextRequest, ctx: GatewayContext) => Promise<GatewayContext>) {
    this.middleware.push(mw);
  }

  register(route: GatewayRoute) {
    const key = `${route.methods.sort().join(",")}:${route.path}`;
    this.routes.set(key, route);
  }

  async handle(req: NextRequest): Promise<NextResponse> {
    const start = performance.now();
    const method = req.method;
    const url = new URL(req.url);
    const path = url.pathname.replace("/api/v1", "");

    const routeKey = `${method}:${path}`;
    const route = this.routes.get(routeKey) || this.matchDynamicRoute(method, path);

    if (!route) {
      return NextResponse.json({ error: "Route not found", code: "NOT_FOUND" }, { status: 404 });
    }

    let ctx: GatewayContext = {
      scopes: [],
      isAuthenticated: false,
      isEnterprise: false,
    };

    try {
      const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
      if (apiKey) {
        const keyData = await verifyApiKey(apiKey);
        if (keyData) {
          ctx.userId = keyData.userId;
          ctx.organizationId = keyData.organizationId;
          ctx.scopes = keyData.scopes;
          ctx.isAuthenticated = true;
          ctx.apiKeyId = keyData.keyId;
        }
      }

      // Fall back to session auth for dashboard UI requests (no API key present)
      if (!ctx.isAuthenticated) {
        const session = await auth();
        if (session?.user?.id) {
          ctx.userId = session.user.id;
          ctx.isAuthenticated = true;
          // Grant full scopes to authenticated dashboard users
          ctx.scopes = ["READ", "WRITE", "ADMIN", "WEBHOOKS_READ", "WEBHOOKS_MANAGE", "AGENT_EXECUTE", "WORKFLOW_EXECUTE"];
        }
      }

      for (const mw of this.middleware) {
        ctx = await mw(req, ctx);
      }

      const cors = corsMiddleware(req);
      if (cors.status === 204) return cors;

      if (route.scopes && route.scopes.length > 0) {
        if (!ctx.isAuthenticated) {
          return NextResponse.json({ error: "Authentication required", code: "UNAUTHORIZED" }, { status: 401 });
        }
        const hasScope = route.scopes.some((s) => ctx.scopes.includes(s));
        if (!hasScope) {
          return NextResponse.json({ error: "Insufficient permissions", code: "FORBIDDEN" }, { status: 403 });
        }
      }

      if (route.rateLimit) {
        const identifier = ctx.apiKeyId || ctx.userId || "anonymous";
        await rateLimiter.check(identifier, route.rateLimit.max, route.rateLimit.window);
      }

      const response = await route.handler(req, ctx);

      if (route.audit !== false) {
        await auditMiddleware.log({
          action: `${method}:${path}`,
          userId: ctx.userId,
          organizationId: ctx.organizationId,
          statusCode: response.status,
          durationMs: Math.round(performance.now() - start),
        });
      }

      response.headers.set("x-request-id", crypto.randomUUID());
      response.headers.set("x-response-time", `${Math.round(performance.now() - start)}ms`);

      return response;
    } catch (error: any) {
      logger.error("Gateway error", { path, method, error: error.message });

      if (error.message?.includes("Rate limit")) {
        return NextResponse.json({ error: error.message, code: "RATE_LIMITED" }, { status: 429 });
      }

      return NextResponse.json(
        { error: "Internal server error", code: "INTERNAL_ERROR", requestId: crypto.randomUUID() },
        { status: 500 },
      );
    }
  }

  private matchDynamicRoute(method: string, path: string): GatewayRoute | undefined {
    for (const [key, route] of this.routes) {
      const [routeMethods, routePath] = key.split(":");
      if (!routeMethods.includes(method)) continue;
      const pattern = routePath.replace(/:(\w+)/g, "([^/]+)");
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(path)) return route;
    }
    return undefined;
  }
}

export const gateway = new ApiGateway();
