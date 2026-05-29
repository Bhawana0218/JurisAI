import { auth } from "@/auth";
import { summarizeMeeting } from "@/features/productivity/services/productivity.service";
import { toErrorResponse } from "@/lib/errors/api-error";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const { title, transcript } = await req.json();
    const summary = await summarizeMeeting(session.user.id, title, transcript);
    return Response.json({ summary });
  } catch (error) {
    return toErrorResponse(error);
  }
}
