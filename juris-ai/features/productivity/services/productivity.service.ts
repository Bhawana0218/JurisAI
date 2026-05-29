import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { Prisma } from "@prisma/client";

import { RAG_CONFIG } from "@/config/rag.config";
import { prisma } from "@/lib/prisma";

export async function createAINote(userId: string, title: string, content: string) {
  const { text: summary } = await generateText({
    model: openai(RAG_CONFIG.chatModel),
    prompt: `Summarize this legal note in 3 bullet points:\n${content.slice(0, 3000)}`,
  });

  return prisma.aINote.create({
    data: { userId, title, content, summary },
  });
}

export async function generateTasksFromCase(userId: string, caseId: string) {
  const legalCase = await prisma.legalCase.findFirst({
    where: { id: caseId, userId },
  });
  if (!legalCase) throw new Error("Case not found");

  const { text } = await generateText({
    model: openai(RAG_CONFIG.chatModel),
    prompt: `Generate 5 legal action tasks as JSON array [{title, description, dueInDays}] for case: ${legalCase.title}\n${legalCase.description ?? ""}`,
  });

  let tasks: { title: string; description?: string; dueInDays?: number }[] = [];
  try {
    tasks = JSON.parse(text.replace(/```json\n?|\n?```/g, ""));
  } catch {
    tasks = [{ title: "Review case documents", description: text.slice(0, 200) }];
  }

  const created = await Promise.all(
    tasks.map((t) =>
      prisma.legalTask.create({
        data: {
          userId,
          caseId,
          title: t.title,
          description: t.description,
          status: "TODO",
          aiGenerated: true,
          dueAt: t.dueInDays
            ? new Date(Date.now() + t.dueInDays * 86400000)
            : undefined,
        },
      })
    )
  );

  return created;
}

export async function summarizeMeeting(
  userId: string,
  title: string,
  transcript: string
) {
  const { text } = await generateText({
    model: openai(RAG_CONFIG.chatModel),
    prompt: `Summarize this legal meeting. Provide summary + action items as JSON {summary, actionItems:[]}:\n${transcript.slice(0, 8000)}`,
  });

  let summary = text;
  let actionItems: unknown[] = [];
  try {
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ""));
    summary = parsed.summary ?? text;
    actionItems = parsed.actionItems ?? [];
  } catch {
    /* use raw text */
  }

  return prisma.meetingSummary.create({
    data: {
      userId,
      title,
      transcript,
      summary,
      actionItems: actionItems as Prisma.InputJsonValue,
    },
  });
}

export async function draftEmail(
  userId: string,
  params: { subject: string; context: string; tone?: string }
) {
  const { text } = await generateText({
    model: openai(RAG_CONFIG.chatModel),
    prompt: `Draft a professional legal email. Subject: ${params.subject}. Context: ${params.context}. Tone: ${params.tone ?? "formal"}.`,
  });

  return prisma.emailDraft.create({
    data: {
      userId,
      subject: params.subject,
      body: text,
      metadata: { context: params.context },
    },
  });
}
