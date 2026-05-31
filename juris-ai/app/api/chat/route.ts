import { getChatModel } from "@/lib/ai-provider";
import {
  streamText,
  convertToModelMessages,
  type UIMessage,
} from "ai";
import type { AgentType } from "@prisma/client";

import { auth } from "@/auth";
import { orchestrateAgents, postChatMemoryUpdate } from "@/ai/agents/orchestrator";
import { RAG_CONFIG } from "@/components/config/rag.config";
import { setTyping } from "@/features/realtime/services/typing.service";
import { runQualityEvaluation } from "@/platform/evaluation/evaluation-orchestrator";

import { publishEvent, RealtimeEvents } from "@/lib/realtime/publisher";
import { channelForChat } from "@/lib/realtime/channels";
import { assertRateLimit } from "@/lib/security/rate-limit";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  return new Response(null, { status: 204 });
}

export async function POST(req: Request) {
  let chatId: string | undefined;
  let organizationId: string | undefined;
  let userId: string | undefined;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }
    userId = session.user.id;

    const body = await req.json();
    const {
      messages,
      chatId: bodyChatId,
      documentIds,
      useRag = true,
      agentId,
      organizationId: bodyOrganizationId,
      language = "en",
    } = body;
    const currentChatId = bodyChatId;
    const currentOrganizationId = bodyOrganizationId;
    const currentUserId = session.user.id;
    chatId = currentChatId;
    organizationId = currentOrganizationId;
    userId = currentUserId;

    // Tenant safety (Phase A): verify org membership when organizationId is provided.
    if (organizationId) {
      const membership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: currentOrganizationId,
            userId: currentUserId,
          },
        },
      });
      if (!membership) return new Response("Forbidden", { status: 403 });
    }


    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("Bad Request", { status: 400 });
    }

    const rawMessages = messages as Array<Record<string, unknown>>;
    const normalizedMessages = rawMessages.map((m) => ({
      ...m,
      content: m.content ?? "",
      parts: m.parts ?? [{ type: "text", text: (m.content as string) ?? "" }],
    })) as Array<{ role: string; content: string; parts: { type: string; text: string }[] }>;

    await assertRateLimit(currentUserId, "chat");

    const latestMessage = normalizedMessages[normalizedMessages.length - 1];
    const userText = Array.isArray(latestMessage.parts)
      ? latestMessage.parts
          .filter((p: { type: string; text?: string }) => p.type === "text")
          .map((p: { text: string }) => p.text)
          .join("")
      : "";

    if (currentChatId) {
      void setTyping(currentChatId, currentUserId, true);
    }

    if (currentChatId && userText) {
      const chat = await prisma.chat.findFirst({
        where: { id: currentChatId, userId: currentUserId },
      });
      if (!chat) return new Response("Chat not found", { status: 404 });

      await prisma.message.create({
        data: { role: "USER", content: userText, chatId: currentChatId },
      });

      const prevRecord = await prisma.chat.findUnique({ where: { id: currentChatId }, select: { title: true } });
      if (prevRecord && prevRecord.title === "New conversation") {
        const autoTitle = userText.length > 60 ? userText.slice(0, 57) + "..." : userText;
        await prisma.chat.update({ where: { id: currentChatId }, data: { title: autoTitle } });
      }

      await publishEvent(channelForChat(currentChatId), {
        type: RealtimeEvents.messageCreated,
        payload: { role: "user", content: userText },
        userId: currentUserId,
      });
    }

    const orchestration = useRag
      ? await orchestrateAgents({
          query: userText,
          userId: currentUserId,
          chatId: currentChatId,
          agentId: agentId as AgentType | undefined,
          documentIds: Array.isArray(documentIds) ? documentIds : undefined,
          organizationId: currentOrganizationId,
          language,
        })
      : {
          primaryAgent: "GENERAL" as AgentType,
          consultedAgents: [] as AgentType[],
          systemPrompt: "You are JurisAI, an Indian legal AI assistant.",
          citations: [],
          routingReason: "RAG disabled",
          confidence: 1,
          toolsUsed: [] as string[],
        };

    const modelMessages = await convertToModelMessages(normalizedMessages as unknown as Array<Omit<UIMessage, 'id'>>);

    const result = streamText({
      model: getChatModel(RAG_CONFIG.chatModel),
      system: orchestration.systemPrompt,
      messages: modelMessages,
      maxOutputTokens: 4096,
      onFinish: async ({ text: textContent }) => {
        if (currentChatId) {
          void setTyping(currentChatId, currentUserId, false);
        }

        if (!currentChatId || !textContent) return;

        try {
          // Persist assistant message once and capture its id for evaluation linking.
          const created = await prisma.message.create({
            data: {
              role: "ASSISTANT",
              content: textContent,
              chatId: currentChatId,
              modelUsed: "GPT_4_1_MINI",
              metadata: {
                agent: orchestration.primaryAgent,
                citations: orchestration.citations,
              },
            },
            select: { id: true },
          });

          await prisma.chat.update({
            where: { id: currentChatId },
            data: { lastMessageAt: new Date(), agentType: orchestration.primaryAgent },
          });

          await publishEvent(channelForChat(currentChatId), {
            type: RealtimeEvents.messageCreated,
            payload: { role: "assistant", content: textContent },
            userId: currentUserId,
          });

          void postChatMemoryUpdate({
            userId: currentUserId,
            organizationId: currentOrganizationId,
            userMessage: userText,
            assistantMessage: textContent,
          });

          // Run evaluation (non-blocking).
          void runQualityEvaluation({
            organizationId: currentOrganizationId,
            userId: currentUserId,
            chatId: currentChatId,
            messageId: created.id,
            agentType: orchestration.primaryAgent,
            promptVersionId: null,
            query: userText,
            assistantOutput: textContent,
            retrievedCitations: orchestration.citations,
            modelUsed: "GPT_4_1_MINI" as any,
            retrievalTooling: { topK: orchestration.citations?.length ?? 0 },
          });
        } catch (persistError) {
          console.error("[/api/chat] failed to persist assistant response", persistError);
        }
      },
    });

    return result.toTextStreamResponse({
      headers: {
        "X-Agent-Id": orchestration.primaryAgent,
      },
    });
  } catch (error) {
    console.error("[/api/chat]", error);
    if (chatId) {
      void setTyping(chatId, userId ?? "", false);
    }
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(`Chat failed: ${msg}`, { status: 500 });
  }
}
