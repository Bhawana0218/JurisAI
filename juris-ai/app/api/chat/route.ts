import { openai } from "@ai-sdk/openai";
import {
  streamText,
  convertToModelMessages,
  type UIMessage,
} from "ai";
import type { AgentType } from "@prisma/client";

import { auth } from "@/auth";
import { orchestrateAgents, postChatMemoryUpdate } from "@/ai/agents/orchestrator";
import { RAG_CONFIG } from "@/config/rag.config";
import { setTyping } from "@/features/realtime/services/typing.service";
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
  const startTime = Date.now();

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { messages, chatId, documentIds, useRag = true, agentId, organizationId, language = "en" } = body;

    // Tenant safety (Phase A): verify org membership when organizationId is provided.
    if (organizationId) {
      const membership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId: session.user.id,
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
      parts: m.parts ?? [{ type: "text", text: m.content ?? "" }],
    })) as Array<{ role: string; parts: { type: string; text: string }[] }>;

    await assertRateLimit(session.user.id, "chat");

    const latestMessage = normalizedMessages[normalizedMessages.length - 1];
    const userText = latestMessage.parts
      .filter((p: { type: string; text?: string }) => p.type === "text")
      .map((p: { text: string }) => p.text)
      .join("");

    if (chatId) {
      void setTyping(chatId, session.user.id, true);
    }

    if (chatId && userText) {
      const chat = await prisma.chat.findFirst({
        where: { id: chatId, userId: session.user.id },
      });
      if (!chat) return new Response("Chat not found", { status: 404 });

      await prisma.message.create({
        data: { role: "USER", content: userText, chatId },
      });

      const prevRecord = await prisma.chat.findUnique({ where: { id: chatId }, select: { title: true } });
      if (prevRecord && prevRecord.title === "New conversation") {
        const autoTitle = userText.length > 60 ? userText.slice(0, 57) + "..." : userText;
        await prisma.chat.update({ where: { id: chatId }, data: { title: autoTitle } });
      }

      await publishEvent(channelForChat(chatId), {
        type: RealtimeEvents.messageCreated,
        payload: { role: "user", content: userText },
        userId: session.user.id,
      });
    }

    const orchestration = useRag
      ? await orchestrateAgents({
          query: userText,
          userId: session.user.id,
          chatId,
          agentId: agentId as AgentType | undefined,
          documentIds: Array.isArray(documentIds) ? documentIds : undefined,
          organizationId,
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

    const modelMessages = await convertToModelMessages(normalizedMessages);

    const result = streamText({
      model: openai(RAG_CONFIG.chatModel),
      system: orchestration.systemPrompt,
      messages: modelMessages,
      maxTokens: 4096,
    });

    return result.toUIMessageStreamResponse({
      originalMessages: normalizedMessages,
      headers: {
        "X-Agent-Id": orchestration.primaryAgent,
      },
      onFinish: async ({ messages: finishedMessages }) => {
        if (chatId) {
          void setTyping(chatId, session.user.id, false);
        }

        if (!chatId) return;

        const assistantMessage = finishedMessages.find((m: UIMessage) => m.role === "assistant");
        const textContent = assistantMessage?.parts
          ?.filter((part: { type: string }) => part.type === "text")
          .map((part: { type: string; text: string }) => part.text)
          .join("");

        if (textContent) {
          await prisma.message.create({
            data: {
              role: "ASSISTANT",
              content: textContent,
              chatId,
              modelUsed: "GPT_4_1_MINI",
              metadata: {
                agent: orchestration.primaryAgent,
                citations: orchestration.citations,
              },
            },
          });

          await prisma.chat.update({
            where: { id: chatId },
            data: { lastMessageAt: new Date(), agentType: orchestration.primaryAgent },
          });

          await publishEvent(channelForChat(chatId), {
            type: RealtimeEvents.messageCreated,
            payload: { role: "assistant", content: textContent },
            userId: session.user.id,
          });

          void postChatMemoryUpdate({
            userId: session.user.id,
            organizationId,
            userMessage: userText,
            assistantMessage: textContent,
          });
        }
      },
    });
  } catch (error) {
    console.error("[/api/chat]", error);
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(`Chat failed: ${msg}`, { status: 500 });
  }
}
