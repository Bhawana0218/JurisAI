export type Citation = {
  chunkId?: string;
  documentId?: string;
  title?: string;
  snippet?: string;
  score?: number;
};

import type { AgentType, AIModel } from "@prisma/client";

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

  retrievalTooling?: {
    topK?: number;
  };
};


export type EvaluationResult = {
  score: number;
  reasoning: string;
  citations?: Citation[];
};

