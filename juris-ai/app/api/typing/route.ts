import { auth } from "@/auth";
import { setTyping } from "@/features/realtime/services/typing.service";
import { toErrorResponse } from "@/lib/errors/api-error";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const { chatId, isTyping } = await req.json();
    if (!chatId) return Response.json({ error: "chatId required" }, { status: 400 });

    await setTyping(chatId, session.user.id, isTyping !== false);
    return Response.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
