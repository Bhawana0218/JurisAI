import { prisma } from "@/lib/prisma";
import { RAG_CONFIG } from "@/components/config/rag.config";

export interface VectorSearchResult {
  chunkId: string;
  documentId?: string;
  legalKnowledgeId?: string;
  content: string;
  title?: string;
  score: number;
}

export async function vectorSearch(
  embedding: number[],
  options?: {
    topK?: number;
    documentIds?: string[];
    organizationId?: string;
    minScore?: number;
  }
): Promise<VectorSearchResult[]> {
  const topK = options?.topK ?? RAG_CONFIG.topK;
  const minScore = options?.minScore ?? RAG_CONFIG.minSimilarityScore;

  const embeddingStr = `[${embedding.join(",")}]`;

  let query = `
    SELECT
      dc.id AS "chunkId",
      dc."documentId",
      dc."legalKnowledgeId",
      dc.content,
      COALESCE(d.title, lk.title) AS title,
      1 - (dc.embedding <=> $1::vector) AS score
    FROM "DocumentChunk" dc
    LEFT JOIN "Document" d ON d.id = dc."documentId"
    LEFT JOIN "LegalKnowledge" lk ON lk.id = dc."legalKnowledgeId"
    WHERE dc.embedding IS NOT NULL
  `;

  const params: unknown[] = [embeddingStr];
  let paramIndex = 2;

  if (options?.documentIds?.length) {
    const placeholders = options.documentIds.map(() => `$${paramIndex++}`).join(",");
    query += ` AND dc."documentId" IN (${placeholders})`;
    params.push(...options.documentIds);
  }

  if (options?.organizationId) {
    query += ` AND (d."organizationId" = $${paramIndex} OR d."organizationId" IS NULL)`;
    params.push(options.organizationId);
    paramIndex++;
  }

  query += ` ORDER BY score DESC LIMIT $${paramIndex}`;
  params.push(topK);

  try {
    const rawResults = await prisma.$queryRawUnsafe<VectorSearchResult[]>(query, ...params);
    // Filter by minScore in application layer (avoids subquery complexity)
    return rawResults.filter((r) => (r.score ?? 0) >= minScore);
  } catch (error) {
    console.error("[Vector Search] Error:", error);
    return [];
  }
}

export async function keywordSearch(
  query: string,
  options?: {
    topK?: number;
    documentIds?: string[];
    organizationId?: string;
  }
): Promise<VectorSearchResult[]> {
  const topK = options?.topK ?? RAG_CONFIG.topK;
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const keywords = q.split(/\W+/).filter(Boolean);

  const chunks = await prisma.documentChunk.findMany({
    where: {
      ...(options?.documentIds?.length ? { documentId: { in: options.documentIds } } : {}),
      ...(options?.organizationId
        ? {
            document: {
              organizationId: options.organizationId,
            },
          }
        : {}),
    },
    take: topK * 3,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      documentId: true,
      legalKnowledgeId: true,
      content: true,
      document: { select: { title: true } },
      legalKnowledge: { select: { title: true } },
    },
  });

  const scored = chunks
    .map((c) => {
      const content = (c.content ?? "").toLowerCase();
      const title = c.document?.title ?? c.legalKnowledge?.title;
      let score = 0;

      const exactMatches = (content.match(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
      score += exactMatches * 0.3;

      const keywordMatches = keywords.filter((k) => content.includes(k)).length;
      score += (keywordMatches / Math.max(keywords.length, 1)) * 0.5;

      if (title?.toLowerCase().includes(q)) {
        score += 0.3;
      }

      return {
        chunkId: c.id,
        documentId: c.documentId ?? undefined,
        legalKnowledgeId: c.legalKnowledgeId ?? undefined,
        content: c.content ?? "",
        title: title ?? undefined,
        score: Math.min(score, 1.0),
      };
    })
    .filter((x) => x.score >= RAG_CONFIG.minSimilarityScore - 0.3);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

export async function hybridSearch(
  query: string,
  embedding?: number[],
  options?: {
    topK?: number;
    documentIds?: string[];
    organizationId?: string;
  }
): Promise<VectorSearchResult[]> {
  const topK = options?.topK ?? RAG_CONFIG.topK;
  const semanticWeight = RAG_CONFIG.hybridSemanticWeight;
  const keywordWeight = RAG_CONFIG.hybridKeywordWeight;

  const [vectorResults, keywordResults] = await Promise.all([
    embedding ? vectorSearch(embedding, { ...options, topK: topK * 2 }) : Promise.resolve([] as VectorSearchResult[]),
    keywordSearch(query, { ...options, topK: topK * 2 }),
  ]);

  const seen = new Set<string>();
  const combined: VectorSearchResult[] = [];

  for (const r of vectorResults) {
    if (!seen.has(r.chunkId)) {
      seen.add(r.chunkId);
      combined.push({ ...r, score: r.score * semanticWeight });
    }
  }

  for (const r of keywordResults) {
    if (seen.has(r.chunkId)) {
      const existing = combined.find((c) => c.chunkId === r.chunkId);
      if (existing) {
        existing.score += r.score * keywordWeight;
      }
    } else {
      seen.add(r.chunkId);
      combined.push({ ...r, score: r.score * keywordWeight });
    }
  }

  combined.sort((a, b) => b.score - a.score);
  return combined.slice(0, topK);
}
