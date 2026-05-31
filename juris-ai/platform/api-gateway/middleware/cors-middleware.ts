import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"];
const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
const ALLOWED_HEADERS = [
  "Content-Type",
  "Authorization",
  "x-api-key",
  "x-request-id",
  "x-idempotency-key",
  "x-organization-id",
];

export function corsMiddleware(req: NextRequest): NextResponse {
  const origin = req.headers.get("origin") || "";
  const isAllowed = ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin);

  if (req.method === "OPTIONS") {
    const preflight = new NextResponse(null, { status: 204 });
    preflight.headers.set("Access-Control-Allow-Origin", isAllowed ? origin : ALLOWED_ORIGINS[0]);
    preflight.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS.join(", "));
    preflight.headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS.join(", "));
    preflight.headers.set("Access-Control-Max-Age", "86400");
    return preflight;
  }

  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", isAllowed ? origin : ALLOWED_ORIGINS[0]);
  response.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS.join(", "));
  response.headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS.join(", "));
  response.headers.set("Access-Control-Expose-Headers", "x-request-id, x-response-time");

  return response;
}
