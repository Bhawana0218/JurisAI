import { generateText, streamText, embed, embedMany, tool } from "ai";
import { getChatModel, getEmbeddingModel } from "@/lib/ai-provider";
import { prisma } from "@/lib/prisma";
import { AIModel, ExecutionStatus } from "@prisma/client";
import { eventBus } from "../event-bus/event-bus";
import { logger } from "../observability/logging/logger";
import { z } from "zod";

type AgentExecutionInput = {
  agentType: string;
  systemPrompt: string;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  model?: AIModel;
  maxTokens?: number;
  temperature?: number;
  tools?: Array<{ name: string; description: string; parameters: Record<string, unknown>; handler: (args: any) => Promise<any> }>;
  userId?: string;
  organizationId?: string;
  workflowExecutionId?: string;
};

type AgentExecutionResult = {
  id: string;
  text: string;
  tokensUsed: number;
  promptTokens: number;
  completionTokens: number;
  durationMs: number;
  modelUsed: AIModel;
  cost: number;
  citations: Array<{ chunkId?: string; documentId?: string; title?: string; snippet?: string; score?: number }>;
};

class AiRuntime {
  private readonly MODEL_COST_PER_1K: Record<string, { input: number; output: number }> = {
    GPT_4_1_MINI: { input: 0.0015, output: 0.006 },
    GPT_4_O: { input: 0.005, output: 0.015 },
    GPT_4_TURBO: { input: 0.01, output: 0.03 },
    GPT_4: { input: 0.03, output: 0.06 },
  };

  async executeAgent(input: AgentExecutionInput): Promise<AgentExecutionResult> {
    const start = performance.now();
    const modelKey = (input.model || "GPT_4_1_MINI") as keyof typeof this.MODEL_COST_PER_1K;

    const execution = await prisma.agentExecution.create({
      data: {
        agentType: input.agentType as any,
        userId: input.userId,
        organizationId: input.organizationId,
        input: input.messages as any,
        status: "RUNNING" as ExecutionStatus,
        workflowExecutionId: input.workflowExecutionId,
      },
    });

    try {
      const tools: Record<string, any> = {};
      if (input.tools) {
        for (const t of input.tools) {
          tools[t.name] = tool({
            description: t.description,
            inputSchema: z.object(t.parameters as any),
          execute: t.handler as any,
        });
      }
    }

    const result = await generateText({
        model: getChatModel(this.mapModel(input.model || "GPT_4_1_MINI")),
        system: input.systemPrompt,
        messages: input.messages.map((m) => ({ role: m.role, content: m.content })),
        maxOutputTokens: input.maxTokens || 4096,
        temperature: input.temperature ?? 0.7,
        tools: Object.keys(tools).length > 0 ? tools : undefined,
      });

      const durationMs = Math.round(performance.now() - start);
      const promptTokens = result.usage?.inputTokens || 0;
      const completionTokens = result.usage?.outputTokens || 0;
      const totalTokens = promptTokens + completionTokens;

      const costModel = this.MODEL_COST_PER_1K[modelKey] || this.MODEL_COST_PER_1K.GPT_4_1_MINI;
      const cost = (promptTokens / 1000) * costModel.input + (completionTokens / 1000) * costModel.output;

      await prisma.agentExecution.update({
        where: { id: execution.id },
        data: {
          status: "COMPLETED" as ExecutionStatus,
          output: { text: result.text } as any,
          modelUsed: input.model || "GPT_4_1_MINI",
          tokensUsed: totalTokens,
          promptTokens,
          completionTokens,
          durationMs,
          cost,
          completedAt: new Date(),
        },
      });

      await prisma.aIUsageLog.create({
        data: {
          userId: input.userId,
          organizationId: input.organizationId,
          model: input.model || "GPT_4_1_MINI",
          promptTokens,
          completionTokens,
          totalTokens,
          operation: `agent.${input.agentType}`,
          agentType: input.agentType as any,
          cost,
          durationMs,
        },
      });

      await eventBus.publish({
        type: "agent.executed",
        source: "jurisai:ai-runtime",
        data: {
          executionId: execution.id,
          agentType: input.agentType,
          tokensUsed: totalTokens,
          durationMs,
          cost,
        },
        metadata: { userId: input.userId, organizationId: input.organizationId, version: 1 },
      });

      return {
        id: execution.id,
        text: result.text,
        tokensUsed: totalTokens,
        promptTokens,
        completionTokens,
        durationMs,
        modelUsed: input.model || "GPT_4_1_MINI",
        cost,
        citations: [],
      };
    } catch (error: any) {
      await prisma.agentExecution.update({
        where: { id: execution.id },
        data: {
          status: "FAILED" as ExecutionStatus,
          error: error.message,
          completedAt: new Date(),
        },
      });

      throw error;
    }
  }

  async executeAgentStreaming(input: AgentExecutionInput) {
    const modelKey = (input.model || "GPT_4_1_MINI") as keyof typeof this.MODEL_COST_PER_1K;

    const tools: Record<string, any> = {};
    if (input.tools) {
      for (const t of input.tools) {
        tools[t.name] = tool({
          description: t.description,
          inputSchema: z.object(t.parameters as any),
          execute: t.handler as any,
        });
      }
    }

    return streamText({
      model: getChatModel(this.mapModel(input.model || "GPT_4_1_MINI")),
      system: input.systemPrompt,
      messages: input.messages.map((m) => ({ role: m.role, content: m.content })),
      maxOutputTokens: input.maxTokens || 4096,
      temperature: input.temperature ?? 0.7,
      tools: Object.keys(tools).length > 0 ? tools : undefined,
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const { embedding } = await embed({
      model: getEmbeddingModel("text-embedding-3-small"),
      value: text,
    });
    return embedding;
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const { embeddings } = await embedMany({
      model: getEmbeddingModel("text-embedding-3-small"),
      values: texts,
    });
    return embeddings;
  }

  async modelRouter(input: { query: string; complexity?: number; preferredModel?: AIModel; latencyTolerance?: "low" | "medium" | "high" }): Promise<AIModel> {
    if (input.preferredModel) return input.preferredModel;

    const complexity = input.complexity || this.estimateComplexity(input.query);

    if (complexity > 0.8) return "GPT_4_O";
    if (complexity > 0.5) return "GPT_4_TURBO";
    if (input.latencyTolerance === "low") return "GPT_4_1_MINI";

    return "GPT_4_1_MINI";
  }

  private estimateComplexity(query: string): number {
    const length = query.length;
    const legalTerms = (query.match(/(juris|legal|court|statute|precedent|appeal|constitution|amendment|act|section|clause|contract|tort)/gi) || []).length;
    const questions = (query.match(/\?/g) || []).length;

    return Math.min(1.0, (length / 2000) * 0.4 + (legalTerms / 10) * 0.4 + (questions / 5) * 0.2);
  }

  private mapModel(model: AIModel): string {
    const modelMap: Record<string, string> = {
      GPT_4: "gpt-4",
      GPT_4_TURBO: "gpt-4-turbo",
      GPT_4_1_MINI: "gpt-4.1-mini",
      GPT_4_O: "gpt-4o",
      GPT_4_1_NANO: "gpt-4.1-nano",
    };
    return modelMap[model] || "gpt-4.1-mini";
  }

  async getTokenUsage(userId: string, periodStart: Date, periodEnd: Date) {
    const usage = await prisma.aIUsageLog.aggregate({
      where: {
        userId,
        createdAt: { gte: periodStart, lte: periodEnd },
      },
      _sum: { totalTokens: true, cost: true, promptTokens: true, completionTokens: true },
    });

    return {
      totalTokens: usage._sum.totalTokens || 0,
      totalCost: usage._sum.cost || 0,
      promptTokens: usage._sum.promptTokens || 0,
      completionTokens: usage._sum.completionTokens || 0,
    };
  }
}

export const aiRuntime = new AiRuntime();
