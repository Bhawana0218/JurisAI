import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";

import { RAG_CONFIG } from "@/config/rag.config";

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding(RAG_CONFIG.embeddingModel),
    value: text,
  });
  return embedding;
}

export async function generateEmbeddings(chunks: string[]): Promise<number[][]> {
  if (chunks.length === 0) return [];

  const results: number[][] = [];
  for (let i = 0; i < chunks.length; i += 10) {
    const batch = chunks.slice(i, i + 10);
    const { embeddings } = await embedMany({
      model: openai.embedding(RAG_CONFIG.embeddingModel),
      values: batch,
    });
    results.push(...embeddings);
  }
  return results;
}
