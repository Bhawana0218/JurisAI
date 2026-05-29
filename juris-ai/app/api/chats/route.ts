import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertRateLimit } from "@/lib/security/rate-limit";
import { toErrorResponse } from "@/lib/errors/api-error";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await assertRateLimit(session.user.id, "chats");

    const chats = await prisma.chat.findMany({
      where: { userId: session.user.id, isArchived: false },
      select: { id: true, title: true, createdAt: true, lastMessageAt: true, agentType: true },
      orderBy: { lastMessageAt: "desc" },
      take: 50,
    });

    return Response.json({ chats });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const chat = await prisma.chat.create({
      data: {
        title: body.title || "New conversation",
        userId: session.user.id,
        agentType: body.agentType ?? "GENERAL",
        organizationId: body.organizationId,
        visibility: body.visibility ?? "PRIVATE",
      },
    });

    return Response.json({ chat }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id, title, visibility, isArchived } = await req.json();
    if (!id) return new Response("chat id required", { status: 400 });

    const existing = await prisma.chat.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) return new Response("Not found", { status: 404 });

    const updated = await prisma.chat.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(visibility ? { visibility } : {}),
        ...(typeof isArchived === "boolean" ? { isArchived } : {}),
      },
    });

    return Response.json({ chat: updated });
  } catch (error) {
    return toErrorResponse(error);
  }
}

