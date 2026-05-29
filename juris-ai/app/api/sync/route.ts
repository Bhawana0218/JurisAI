import { auth } from "@/auth";
import {
  getSyncCursor,
  pushSyncOperations,
} from "@/features/sync/services/offline-sync.service";
import { toErrorResponse } from "@/lib/errors/api-error";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const cursor = await getSyncCursor(session.user.id);
    return Response.json({ cursor });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const { operations } = await req.json();
    if (!Array.isArray(operations)) {
      return Response.json({ error: "operations array required" }, { status: 400 });
    }

    const result = await pushSyncOperations(session.user.id, operations);
    return Response.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
