import { prisma } from "@/lib/prisma";
import { generateEmbeddings } from "@/lib/rag/embeddings";
import { chunkText } from "@/lib/rag/chunking";
import { extractText } from "@/lib/documents/extractor";

export async function processDocument(documentId: string): Promise<void> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) throw new Error(`Document ${documentId} not found`);

  await prisma.document.update({
    where: { id: documentId },
    data: { status: "PROCESSING" },
  });

  try {
    const extractedText = await extractText(document.fileUrl, document.mimeType ?? undefined);

    if (!extractedText || extractedText.trim().length === 0) {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "FAILED", extractedText: "" },
      });
      return;
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { extractedText },
    });

    const chunks = chunkText(extractedText);

    if (chunks.length === 0) {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "READY" },
      });
      return;
    }

    const chunkContents = chunks.map((c) => c.content);
    const embeddings = await generateEmbeddings(chunkContents);

    await prisma.$transaction(async (tx) => {
      for (const [index, chunk] of chunks.entries()) {
        const createdChunk = await tx.documentChunk.create({
          data: {
            documentId,
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            tokenCount: chunk.tokenCount,
          },
        });

        const embedding = embeddings[index];

        if (embedding?.length) {
          await tx.$executeRaw`
            UPDATE "DocumentChunk"
            SET embedding = ${`[${embedding.join(",")}]`}::vector
            WHERE id = ${createdChunk.id}
          `;
        }
      }
    });

    await prisma.document.update({
      where: { id: documentId },
      data: { status: "READY" },
    });
  } catch (error) {
    console.error(`[DocumentProcessor] Failed to process ${documentId}:`, error);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "FAILED" },
    });
  }
}

export async function processLegalKnowledgeEntry(entryId: string): Promise<void> {
  const entry = await prisma.legalKnowledge.findUnique({
    where: { id: entryId },
  });

  if (!entry) throw new Error(`LegalKnowledge entry ${entryId} not found`);

  const chunks = chunkText(entry.content);

  if (chunks.length === 0) return;

  const chunkContents = chunks.map((c) => c.content);
  const embeddings = await generateEmbeddings(chunkContents);

  await prisma.$transaction(async (tx) => {
    for (const [index, chunk] of chunks.entries()) {
      const createdChunk = await tx.documentChunk.create({
        data: {
          legalKnowledgeId: entryId,
          content: chunk.content,
          chunkIndex: chunk.chunkIndex,
          tokenCount: chunk.tokenCount,
        },
      });

      const embedding = embeddings[index];

      if (embedding?.length) {
        await tx.$executeRaw`
          UPDATE "DocumentChunk"
          SET embedding = ${`[${embedding.join(",")}]`}::vector
          WHERE id = ${createdChunk.id}
        `;
      }
    }
  });
}
