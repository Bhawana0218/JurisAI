import { auth } from "@/auth";
import { createAINote } from "@/features/productivity/services/productivity.service";
import { prisma } from "@/lib/prisma";
import { toErrorResponse } from "@/lib/errors/api-error";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const notes = await prisma.aINote.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });
    return Response.json({ notes });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const { title, content } = await req.json();
    const note = await createAINote(session.user.id, title, content);
    return Response.json({ note }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
