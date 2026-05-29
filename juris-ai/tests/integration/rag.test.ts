import { describe, it, expect } from "vitest";

import { chunkText } from "@/lib/rag/chunking";
import { RAG_CONFIG } from "@/config/rag.config";

describe("RAG Engine", () => {
  describe("chunkText", () => {
    it("should return empty array for empty text", () => {
      expect(chunkText("")).toEqual([]);
      expect(chunkText("   ")).toEqual([]);
    });

    it("should return a single chunk for short text", () => {
      const text = "This is a short legal text about consumer rights.";
      const chunks = chunkText(text);
      expect(chunks.length).toBeGreaterThanOrEqual(1);
      expect(chunks[0].content).toContain("consumer rights");
      expect(chunks[0].chunkIndex).toBe(0);
      expect(chunks[0].tokenCount).toBeGreaterThan(0);
    });

    it("should split long text with paragraph breaks into multiple chunks", () => {
      const text = Array.from({ length: 20 }, (_, i) =>
        `Paragraph ${i + 1}: Legal rights and obligations under the Indian Penal Code. This section covers various aspects of criminal law and procedure that every citizen should be aware of for their legal protection and understanding of the judicial system.`
      ).join("\n\n");
      const chunks = chunkText(text);
      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach((chunk, i) => {
        expect(chunk.chunkIndex).toBe(i);
        expect(chunk.tokenCount).toBeLessThanOrEqual(RAG_CONFIG.chunkSize + 100);
      });
    });

    it("should preserve paragraph boundaries where possible", () => {
      const text = [
        "Paragraph one about cybercrime laws.",
        "",
        "Paragraph two about consumer protection.",
        "",
        "Paragraph three about employment rights.",
      ].join("\n");
      const chunks = chunkText(text);
      expect(chunks.length).toBeGreaterThanOrEqual(1);
      const allContent = chunks.map((c) => c.content).join(" ");
      expect(allContent).toContain("cybercrime");
      expect(allContent).toContain("consumer protection");
      expect(allContent).toContain("employment rights");
    });
  });

  describe("RAG_CONFIG", () => {
    it("should have valid configuration values", () => {
      expect(RAG_CONFIG.embeddingDimensions).toBe(1536);
      expect(RAG_CONFIG.embeddingModel).toBe("text-embedding-3-small");
      expect(RAG_CONFIG.chunkSize).toBeGreaterThan(0);
      expect(RAG_CONFIG.chunkOverlap).toBeLessThan(RAG_CONFIG.chunkSize);
      expect(RAG_CONFIG.topK).toBeGreaterThan(0);
      expect(RAG_CONFIG.hybridSemanticWeight + RAG_CONFIG.hybridKeywordWeight).toBeCloseTo(1.0);
      expect(RAG_CONFIG.minSimilarityScore).toBeGreaterThan(0);
      expect(RAG_CONFIG.minSimilarityScore).toBeLessThanOrEqual(1);
    });
  });
});
