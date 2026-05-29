import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toErrorResponse } from "@/lib/errors/api-error";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const tasks = await prisma.legalTask.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: { legalCase: { select: { id: true, title: true } } },
    });
    return Response.json({ tasks });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const task = await prisma.legalTask.create({
      data: {
        userId: session.user.id,
        caseId: body.caseId,
        title: body.title,
        description: body.description,
        dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
        status: body.status ?? "TODO",
        aiGenerated: body.aiGenerated ?? false,
      },
    });
    return Response.json({ task }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return new Response("task id required", { status: 400 });

    const task = await prisma.legalTask.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!task) return new Response("Not found", { status: 404 });

    const updated = await prisma.legalTask.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.dueAt ? { dueAt: new Date(data.dueAt) } : {}),
      },
    });
    return Response.json({ task: updated });
  } catch (error) {
    return toErrorResponse(error);
  }
}
