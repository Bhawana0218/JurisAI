import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { processDocument } from "@/lib/rag/document-processor";
import { toErrorResponse } from "@/lib/errors/api-error";
import { documentUploadSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const documents = await prisma.document.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        mimeType: true,
        fileSize: true,
        status: true,
        createdAt: true,
      },
    });
    return Response.json({ documents });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const parsed = documentUploadSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        title: parsed.data.title,
        fileUrl: parsed.data.fileUrl,
        mimeType: parsed.data.mimeType,
        fileSize: parsed.data.fileSize,
        userId: session.user.id,
        organizationId: parsed.data.organizationId,
        status: "PROCESSING",
      },
    });

    processDocument(document.id).catch((err) =>
      console.error(`[Documents] Background processing failed for ${document.id}:`, err)
    );

    return Response.json({ document }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
