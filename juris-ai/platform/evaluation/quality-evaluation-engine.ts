import { generateText } from "ai";
import { getChatModel } from "@/lib/ai-provider";
import { prisma } from "@/lib/prisma";
import { RAG_CONFIG } from "@/components/config/rag.config";
import { logger } from "@/platform/observability/logging/logger";
import type { AIModel, AgentType } from "@prisma/client";

export type Citation = {
  chunkId?: string;
  documentId?: string;
  title?: string;
  snippet?: string;
  score?: number;
};

export type QualityEvaluationInput = {
  organizationId?: string;
  userId?: string;
  chatId?: string;
  messageId?: string;
  agentType?: AgentType | null;
  promptVersionId?: string | null;

  query: string;
  assistantOutput: string;
  retrievedCitations: Citation[];
  modelUsed?: AIModel | null;

  // Optional context for retrieval scoring
  retrievalTooling?: {
    topK?: number;
  };
};

export type QualityEvaluationResult = {
  retrievalScore: number;
  citationScore: number;
  hallucinationRiskScore: number;
  legalCorrectnessScore: number;
  reasoningQualityScore: number;
  responseUsefulnessScore: number;
  complianceScore: number;
  gateAction: "ALLOW" | "FLAG" | "ESCALATE" | "BLOCK";
  gateReason: string;
  retrievalAssessment?: any;
  citationValidation?: any;
  hallucinationDetection?: any;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Phase 12 evaluation engine.
 *
 * Implementation strategy:
 * - Retrieval/citation/hallucination scoring is primarily heuristic + LLM-judge for legal rubric.
 * - Gate action is derived from weighted scores.
 */
export class QualityEvaluationEngine {
  async evaluate(input: QualityEvaluationInput): Promise<QualityEvaluationResult> {
    const citations = input.retrievedCitations || [];

    // Retrieval score: prefer presence, diversity, and scoring distribution.
    const retrievalScore = clamp01(
      citations.length
        ? Math.min(0.95, 0.45 + citations.length * 0.08 + (citations.reduce((a, c) => a + (c.score ?? 0), 0) / Math.max(1, citations.length)) * 0.12)
        : 0.2,
    );

    // Citation score: penalize if citations exist but are weak / no snippet.
    const citationSnippetCoverage = citations.length
      ? citations.filter((c) => (c.snippet ?? "").trim().length > 40).length / citations.length
      : 0;
    const citationScore = clamp01(0.2 + citationSnippetCoverage * 0.7 + Math.min(0.1, citations.length * 0.01));

    // Hallucination risk: heuristic based on citation presence and judge check.
    // If no citations, hallucination risk is higher.
    let hallucinationRiskScore = clamp01(0.65 - citationScore * 0.45);

    // LLM-judge rubric for legal correctness + reasoning + usefulness.
    // Keep prompts strict to return JSON only.
    const judgePrompt = `You are a legal AI quality auditor for an enterprise legal assistant.

Task:
Given the user's query and the assistant's answer along with retrieved citations/snippets, assign quality scores from 0 to 1.
Also detect hallucination risk: claims that cannot be supported by retrieved citations.

Return ONLY valid JSON with this schema:
{
  "legalCorrectnessScore": number,
  "reasoningQualityScore": number,
  "responseUsefulnessScore": number,
  "complianceScore": number,
  "hallucinationUnsupportedClaims": number,
  "hallucinationContradictions": number,
  "hallucinationRiskScore": number,
  "citationsAdequacy": number,
  "notes": string
}

Scoring guidance:
- legalCorrectnessScore: correctness of legal statements and procedural guidance.
- reasoningQualityScore: structure, clarity, and grounded rationale.
- responseUsefulnessScore: actionability, completeness, helpful next steps.
- complianceScore: whether answer respects safety/compliance expectations (uncertainty disclosed, avoids definitive claims without basis).
- citationsAdequacy: how well the answer aligns with provided snippets/citations.
- hallucinationRiskScore: probability of unsupported claims (0..1).

Input:
QUERY:\n${input.query}\n\nASSISTANT_ANSWER:\n${input.assistantOutput}\n\nRETRIEVED_CITATIONS (snippets):\n${citations
        .slice(0, 8)
        .map((c, i) => `#${i + 1} title=${c.title ?? ""} docId=${c.documentId ?? ""} snippet=${(c.snippet ?? "").slice(0, 220)}`)
        .join("\n") || "<none>"}
`;

    const judge = await generateText({
      model: getChatModel(RAG_CONFIG.chatModel),
      system: "Return strict JSON only. No markdown.",
      prompt: judgePrompt,
      maxOutputTokens: 700,
      temperature: 0.1,
    });

    let judgeJson: any;
    try {
      judgeJson = JSON.parse(judge.text);
    } catch (e) {
      logger.warn("[QualityEvaluationEngine] Judge JSON parse failed; using heuristics", { error: (e as Error).message });
      judgeJson = {
        legalCorrectnessScore: 0.45,
        reasoningQualityScore: 0.45,
        responseUsefulnessScore: 0.5,
        complianceScore: 0.65,
        hallucinationUnsupportedClaims: 1,
        hallucinationContradictions: 0,
        hallucinationRiskScore: hallucinationRiskScore,
        citationsAdequacy: citationScore,
        notes: "fallback",
      };
    }

    // Combine hallucination risk: include judge risk if present.
    hallucinationRiskScore = clamp01(
      0.55 * hallucinationRiskScore + 0.45 * (typeof judgeJson.hallucinationRiskScore === "number" ? judgeJson.hallucinationRiskScore : hallucinationRiskScore),
    );

    const legalCorrectnessScore = clamp01(judgeJson.legalCorrectnessScore ?? 0.45);
    const reasoningQualityScore = clamp01(judgeJson.reasoningQualityScore ?? 0.45);
    const responseUsefulnessScore = clamp01(judgeJson.responseUsefulnessScore ?? 0.5);
    const complianceScore = clamp01(judgeJson.complianceScore ?? 0.65);

    // Gate policy (tunable):
    // - High legal correctness + low hallucination risk + strong citations => ALLOW
    // - Moderate => FLAG
    // - Low => BLOCK
    // - If likely unsafe/hallucination => ESCALATE
    const weightedQuality =
      0.25 * legalCorrectnessScore +
      0.15 * reasoningQualityScore +
      0.2 * responseUsefulnessScore +
      0.2 * citationScore +
      0.2 * (1 - hallucinationRiskScore);

    let gateAction: "ALLOW" | "FLAG" | "ESCALATE" | "BLOCK" = "FLAG";
    if (weightedQuality >= 0.78 && hallucinationRiskScore <= 0.35) gateAction = "ALLOW";
    else if (hallucinationRiskScore >= 0.55) gateAction = "BLOCK";
    else if (weightedQuality <= 0.55) gateAction = "ESCALATE";

    const gateReason =
      gateAction === "ALLOW"
        ? "Scores passed quality gates."
        : gateAction === "FLAG"
          ? "Quality below ideal; recommend review or prompt improvement."
          : gateAction === "ESCALATE"
            ? "Potential deficiencies detected (accuracy/reasoning/usefulness)."
            : "High hallucination risk / insufficient citation support.";

    return {
      retrievalScore,
      citationScore,
      hallucinationRiskScore,
      legalCorrectnessScore,
      reasoningQualityScore,
      responseUsefulnessScore,
      complianceScore,
      gateAction,
      gateReason,
      retrievalAssessment: {
        citationsCount: citations.length,
        topK: input.retrievalTooling?.topK,
      },
      citationValidation: {
        citationSnippetCoverage,
        citationCount: citations.length,
      },
      hallucinationDetection: {
        unsupportedClaims: judgeJson.hallucinationUnsupportedClaims ?? null,
        contradictions: judgeJson.hallucinationContradictions ?? null,
      },
    };
  }
}

