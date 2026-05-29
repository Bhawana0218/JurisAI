import { auth } from "@/auth";
import { updatePresence, getOrgPresence } from "@/features/realtime/services/presence.service";
import type { DevicePlatform, PresenceStatus } from "@prisma/client";
import { toErrorResponse } from "@/lib/errors/api-error";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const orgId = new URL(req.url).searchParams.get("organizationId");
    if (!orgId) return Response.json({ presence: [] });

    const presence = await getOrgPresence(orgId);
    return Response.json({ presence });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const { status, organizationId, device } = await req.json();
    const presence = await updatePresence({
      userId: session.user.id,
      status: (status as PresenceStatus) ?? "ONLINE",
      organizationId,
      device: device as DevicePlatform | undefined,
    });

    return Response.json({ presence });
  } catch (error) {
    return toErrorResponse(error);
  }
}
