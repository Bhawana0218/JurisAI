import { runQualityEvaluation } from "./evaluation-orchestrator";
import type { QualityEvaluationInput } from "./types";

export async function evaluateChatCompletion(input: QualityEvaluationInput) {
  return runQualityEvaluation(input);
}

