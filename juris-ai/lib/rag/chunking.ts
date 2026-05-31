import { RAG_CONFIG } from "@/components/config/rag.config";

export interface Chunk {
  content: string;
  chunkIndex: number;
  tokenCount: number;
}

function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

export function chunkText(text: string): Chunk[] {
  const { chunkSize, chunkOverlap } = RAG_CONFIG;
  const chunks: Chunk[] = [];

  if (!text || text.trim().length === 0) return chunks;

  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = "";
  let index = 0;

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    const wouldBeText = currentChunk ? `${currentChunk}\n\n${trimmed}` : trimmed;
    const wouldBeTokens = estimateTokenCount(wouldBeText);

    if (wouldBeTokens > chunkSize && currentChunk) {
      chunks.push({
        content: currentChunk.trim(),
        chunkIndex: index++,
        tokenCount: estimateTokenCount(currentChunk),
      });

      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-Math.floor(chunkOverlap / 2));
      currentChunk = overlapWords.join(" ") + "\n\n" + trimmed;
    } else {
      currentChunk = currentChunk ? `${currentChunk}\n\n${trimmed}` : trimmed;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      chunkIndex: index,
      tokenCount: estimateTokenCount(currentChunk),
    });
  }

  return chunks;
}
