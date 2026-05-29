import { RAG_CONFIG } from "@/config/rag.config";
import { generateEmbedding, hybridSearch } from "@/lib/rag";
import { prisma } from "@/lib/prisma";

import type { AgentType } from "@prisma/client";


export type OrchestrateAgentsInput = {
  query: string;
  userId: string;
  chatId?: string;
  agentId?: AgentType;
  documentIds?: string[];
  organizationId?: string;
  language?: string;
};

export type OrchestrationResult = {
  primaryAgent: AgentType;
  consultedAgents: AgentType[];
  systemPrompt: string;
  citations: Array<{
    chunkId?: string;
    documentId?: string;
    title?: string;
    snippet?: string;
    score?: number;
  }>;
  routingReason: string;
  confidence: number;
  toolsUsed: string[];
};

function inferPrimaryAgent(query: string, requested?: AgentType): AgentType {
  if (requested) return requested;

  const q = query.toLowerCase();
  if (/(cyber|hack|phishing|ransomware|data breach)/.test(q)) return "CYBERCRIME";
  if (/(consumer|refund|warranty|defect|service)/.test(q)) return "CONSUMER_RIGHTS";
  if (/(women|domestic violence|safety|dowry|harass|harassment)/.test(q)) return "WOMEN_SAFETY";
  if (/(employment|workplace|salary|termination|dismissal|harassment at work)/.test(q)) return "EMPLOYMENT_LAW";
  if (/(court|hearing|case|petition|affidavit|order)/.test(q)) return "COURT_PROCEDURE";
  if (/(review|clause|agreement|contract)/.test(q)) return "DOCUMENT_REVIEW";

  return "LEGAL_RESEARCH";
}

function systemPromptForAgent(agent: AgentType, language: string | undefined) {
  const lang = language && language.trim().length ? language : "en";

  switch (agent) {
    case "CYBERCRIME":
      return `You are JurisAI, an expert Indian legal assistant specializing in cybercrime. \n- Provide practical guidance for reporting and evidence preservation.\n- Cite relevant Indian legal concepts and explain steps in a clear, careful tone.\n- Respond in ${lang}.`;
    case "CONSUMER_RIGHTS":
      return `You are JurisAI, an expert Indian legal assistant specializing in consumer rights. \n- Explain likely consumer law remedies and complaint filing steps.\n- Respond in ${lang}.`;
    case "EMPLOYMENT_LAW":
      return `You are JurisAI, an expert Indian legal assistant specializing in employment law. \n- Provide guidance on workplace harassment, termination, and salary/payment disputes.\n- Respond in ${lang}.`;
    case "WOMEN_SAFETY":
      return `You are JurisAI, an expert Indian legal assistant specializing in women safety and domestic violence guidance. \n- Provide safety-first, trauma-informed guidance and reporting pathways.\n- Respond in ${lang}.`;
    case "COURT_PROCEDURE":
      return `You are JurisAI, an expert Indian legal assistant specializing in court procedures. \n- Outline the procedural flow and typical documents with caution.\n- Respond in ${lang}.`;
    case "DOCUMENT_REVIEW":
      return `You are JurisAI, an expert Indian legal assistant specializing in contract/document review. \n- Summarize key terms, risks, obligations, and suggest questions to ask counsel.\n- Respond in ${lang}.`;
    case "LEGAL_RESEARCH":
      return `You are JurisAI, an expert Indian legal assistant for legal research. \n- Provide structured legal analysis.\n- If you use retrieved context, incorporate citations.\n- Respond in ${lang}.`;
    case "GENERAL":
    default:
      return `You are JurisAI, an Indian legal AI assistant. \n- Provide accurate, cautious legal information and practical next steps.\n- If you are unsure, say so and suggest consulting a qualified professional.\n- Respond in ${lang}.`;
  }
}

async function retrieveCitationsHybrid(params: {
  query: string;
  documentIds?: string[];
  organizationId?: string;
  topK: number;
}) {
  const { query, documentIds, organizationId, topK } = params;
  const q = query.trim();
  if (!q) return [];

  try {
    const embedding = await generateEmbedding(q);
    const results = await hybridSearch(q, embedding, {
      topK,
      documentIds,
      organizationId,
    });

    return results.map((r) => ({
      chunkId: r.chunkId,
      documentId: r.documentId,
      title: r.title,
      snippet: r.content.slice(0, 420),
      score: r.score,
    }));
  } catch (error) {
    console.error("[Orchestrator] Hybrid search failed, using keyword fallback:", error);
    return [];
  }
}

export async function orchestrateAgents(
  input: OrchestrateAgentsInput,
): Promise<OrchestrationResult> {
  const {
    query,
    agentId,
    userId: _userId,
    chatId: _chatId,
    documentIds,
    organizationId,
    language,
  } = input;

  const primaryAgent = inferPrimaryAgent(query, agentId);
  const consultedAgents: AgentType[] = [primaryAgent];

  // Retrieval (citations) — currently keyword-based fallback.
  const citations = await retrieveCitationsHybrid({
    query,
    documentIds,
    organizationId,
    topK: RAG_CONFIG.maxChunksInContext,
  });

  const toolsUsed = citations.length ? ["retrieval.hybrid_search"] : [];

  const confidence = citations.length
    ? Math.min(0.95, 0.6 + citations.reduce((a, c) => a + (c.score ?? 0), 0) / Math.max(1, citations.length) / 2)
    : 0.45;

  const routingReason = citations.length
    ? `Routed to ${primaryAgent} with ${citations.length} citation(s) via hybrid vector+keyword search.`
    : `Routed to ${primaryAgent} without strong retrieval matches; answer using general legal guidance.`;

  const systemPrompt = systemPromptForAgent(primaryAgent, language);

  return {
    primaryAgent,
    consultedAgents,
    systemPrompt,
    citations,
    routingReason,
    confidence,
    toolsUsed,
  };
}

export async function postChatMemoryUpdate(params: {
  userId: string;
  organizationId?: string;
  userMessage: string;
  assistantMessage: string;
}) {
  const { userId, organizationId, userMessage, assistantMessage } = params;

  // Minimal memory update: store a short summary on the most recent chat if possible.
  // Later phases will create a dedicated AI memory graph.

  const chat = await prisma.chat.findFirst({
    where: {
      userId,
      ...(organizationId ? { organizationId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  if (!chat) return;

  const memorySummary = `${userMessage.slice(0, 180)} -> ${assistantMessage.slice(0, 260)}`;

  await prisma.chat.update({
    where: { id: chat.id },
    data: {
      memorySummary,
    },
  });
}

