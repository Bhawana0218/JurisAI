import { prisma } from "@/lib/prisma";
import { logger } from "@/platform/observability/logging/logger";
import { QualityEvaluationEngine } from "./quality-evaluation-engine";
import type { QualityEvaluationInput } from "./types";


export async function runQualityEvaluation(params: QualityEvaluationInput) {
  const engine = new QualityEvaluationEngine();

  const evaluation = await prisma.qualityEvaluation.create({
    data: {
      organizationId: params.organizationId,
      userId: params.userId,
      chatId: params.chatId,
      messageId: params.messageId,
      agentType: (params.agentType ?? null) as any,
      promptVersionId: params.promptVersionId ?? null,
      query: params.query,
      assistantOutput: params.assistantOutput,
      retrievedCitations: params.retrievedCitations as any,
      modelUsed: (params.modelUsed ?? null) as any,
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  try {
    const result = await engine.evaluate(params);

    // Persist sub-assessments
    const retrievalAssessment = await prisma.retrievalQualityAssessment.create({
      data: {
        evaluationId: evaluation.id,
        score: result.retrievalScore,
        coverage: result.retrievalAssessment?.citationsCount ? Math.min(1, result.retrievalAssessment.citationsCount / 6) : null,
        relevance: null,
        contextDensity: null,
        evidenceIds: [],
        details: result.retrievalAssessment ?? {},
      },
    });

    const citationValidation = await prisma.citationValidation.create({
      data: {
        evaluationId: evaluation.id,
        score: result.citationScore,
        citationCount: params.retrievedCitations?.length ?? 0,
        failedCitations: 0,
        details: result.citationValidation ?? {},
      },
    });

    const hallucinationDetection = await prisma.hallucinationDetection.create({
      data: {
        evaluationId: evaluation.id,
        score: result.hallucinationRiskScore,
        unsupportedClaims: result.hallucinationDetection?.unsupportedClaims ?? 0,
        contradictions: result.hallucinationDetection?.contradictions ?? 0,
        details: result.hallucinationDetection ?? {},
      },
    });

    await prisma.qualityEvaluation.update({
      where: { id: evaluation.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        gateAction: result.gateAction,
        gateReason: result.gateReason,
        retrievalScore: result.retrievalScore,
        citationScore: result.citationScore,
        hallucinationRiskScore: result.hallucinationRiskScore,
        legalCorrectnessScore: result.legalCorrectnessScore,
        reasoningQualityScore: result.reasoningQualityScore,
        responseUsefulnessScore: result.responseUsefulnessScore,
        complianceScore: result.complianceScore,
        gateDetails: {
          retrievalAssessmentId: retrievalAssessment.id,
          citationValidationId: citationValidation.id,
          hallucinationDetectionId: hallucinationDetection.id,
        },
      },
    });

    const { gateAction, ...restResult } = result;
    return { evaluationId: evaluation.id, gateAction, ...restResult };
  } catch (error: any) {
    logger.error("[evaluation-orchestrator] quality evaluation failed", { error: error?.message });

    await prisma.qualityEvaluation.update({
      where: { id: evaluation.id },
      data: {
        status: "FAILED",
        error: error?.message ?? String(error),
        completedAt: new Date(),
      },
    });

    return { evaluationId: evaluation.id, gateAction: "FLAG", error: error?.message ?? String(error) };
  }
}

