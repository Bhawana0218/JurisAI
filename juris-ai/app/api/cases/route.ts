import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { publishEvent, RealtimeEvents } from "@/lib/realtime/publisher";
import { channelForUser } from "@/lib/realtime/channels";
import { toErrorResponse } from "@/lib/errors/api-error";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const cases = await prisma.legalCase.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: { tasks: { take: 5 } },
    });
    return Response.json({ cases });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const legalCase = await prisma.legalCase.create({
      data: {
        userId: session.user.id,
        organizationId: body.organizationId,
        title: body.title,
        description: body.description,
        courtName: body.courtName,
        caseNumber: body.caseNumber,
      },
    });

    await publishEvent(channelForUser(session.user.id), {
      type: RealtimeEvents.caseUpdated,
      payload: legalCase,
      userId: session.user.id,
    });

    return Response.json({ case: legalCase }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
