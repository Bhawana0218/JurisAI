import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toErrorResponse } from "@/lib/errors/api-error";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const { id } = await params;
    const chat = await prisma.chat.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!chat) return new Response("Not found", { status: 404 });

    const messages = await prisma.message.findMany({
      where: { chatId: id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        role: true,
        content: true,
        modelUsed: true,
        createdAt: true,
      },
    });

    return Response.json({ messages });
  } catch (error) {
    return toErrorResponse(error);
  }
}
