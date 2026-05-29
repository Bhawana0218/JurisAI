"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { ChatInput } from "@/components/ui/chat/ChatInput";
import { ChatLayout } from "@/components/ui/chat/ChatLayout";
import { ChatMessage } from "@/components/ui/chat/ChatMessage";
import { ChatSidebar } from "@/components/ui/chat/ChatSidebar";
import { TypingIndicator } from "@/components/ui/chat/TypingIndicator";
import { useChatStore, type ChatSummary } from "@/store/chat-store";

export function ChatView({ chatId }: { chatId?: string }) {
  const router = useRouter();

  const {
    chats,
    messages,
    isStreaming,
    error,
    isLoadingChats,
    setChats,
    setCurrentChat,
    setMessages,
    addMessage,
    appendToLastMessage,
    setIsStreaming,
    setError,
    setIsLoadingChats,
  } = useChatStore();

  const [input, setInput] = React.useState("");
  const [agentMeta, setAgentMeta] = React.useState<{
    agentId?: string;
    routingReason?: string;
    confidence?: number;
    citations?: Array<{ documentId?: string; title?: string; snippet?: string }>;
  }>({});

  React.useEffect(() => {
    setCurrentChat(chatId ?? null);
  }, [chatId, setCurrentChat]);

  React.useEffect(() => {
    const fetchChats = async () => {
      setIsLoadingChats(true);
      try {
        const res = await fetch("/api/chats");
        if (res.ok) {
          const data = await res.json();
          setChats(data.chats ?? []);
        }
      } catch {
        // silently fail
      } finally {
        setIsLoadingChats(false);
      }
    };
    fetchChats();
  }, [setChats, setIsLoadingChats]);

  React.useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chats/${chatId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(
            (data.messages ?? []).map((m: { id: string; role: string; content: string; createdAt: string }) => ({
              id: m.id,
              role: m.role === "ASSISTANT" ? "assistant" : "user",
              content: m.content,
              createdAt: m.createdAt,
            }))
          );
        }
      } catch {
        // silently fail
      }
    };
    fetchMessages();
  }, [chatId, setMessages]);

  const ensureChat = React.useCallback(async (): Promise<string | null> => {
    if (chatId) return chatId;
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New conversation" }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const newId = data.chat.id;
      const chatSummary = { id: newId, title: "New conversation", agentType: data.chat.agentType ?? "GENERAL", createdAt: data.chat.createdAt, lastMessageAt: null };
      setChats([chatSummary, ...chats]);
      router.push(`/dashboard/chat/${newId}`);
      return newId;
    } catch {
      return null;
    }
  }, [chatId, chats, router, setChats]);

  const onSend = async () => {
    const userText = input.trim();
    if (!userText || isStreaming) return;

    setError(null);

    const resolvedChatId = chatId || (await ensureChat());
    if (!resolvedChatId) {
      setError("Failed to create chat session");
      return;
    }

    setIsStreaming(true);
    addMessage({ id: `user-${Date.now()}`, role: "user", content: userText });
    setInput("");

    try {
      const payload = {
        messages: [{ role: "user", content: userText }],
        chatId: resolvedChatId,
        useRag: true,
        language: "en",
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok || !res.body) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Chat failed (${res.status}). ${txt}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      addMessage({ id: `assistant-${Date.now()}`, role: "assistant", content: "" });

      setAgentMeta((prev) => ({
        ...prev,
        agentId: res.headers.get("X-Agent-Id") ?? undefined,
      }));

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        appendToLastMessage(chunk);
      }

      const currentChats = useChatStore.getState().chats;
      setChats(
        currentChats.map((c) =>
          c.id === resolvedChatId
            ? { ...c, lastMessageAt: new Date().toISOString(), title: c.title === "New conversation" && userText.length > 50 ? userText.slice(0, 50) + "..." : c.title }
            : c
        )
      );
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <ChatLayout
      sidebar={
        <ChatSidebar
          chats={chats.map((c: ChatSummary) => ({ id: c.id, title: c.title }))}
          onNewChat={() => router.push("/dashboard/chat")}
          currentChatId={chatId}
        />
      }
      header={
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              JurisAI — Legal Intelligence Chat
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              AI Agent: {agentMeta.agentId ?? "Analyzing..."}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Agent: <span className="font-medium text-zinc-900 dark:text-zinc-100">{agentMeta.agentId ?? "—"}</span>
            </div>
            {typeof agentMeta.confidence === "number" ? (
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Confidence: {Math.round(agentMeta.confidence * 100)}%
              </div>
            ) : null}
          </div>
        </div>
      }
    >
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto p-4">
          {messages.length === 0 ? (
            <div className="mx-auto mt-10 max-w-xl space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Ask a legal question
                </div>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  JurisAI will route your query to the best legal agent and ground answers with
                  AI-powered retrieval citations from uploaded documents and legal knowledge base.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "How do I file an FIR for cybercrime?",
                  "What are my consumer rights for a defective product?",
                  "Steps to file a domestic violence complaint",
                  "Explain the court procedure for a civil case",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setInput(suggestion)}
                    className="rounded-xl border border-zinc-200 bg-white p-3 text-left text-sm text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-3">
              {messages.map((m, idx) => (
                <ChatMessage
                  key={`${m.id || idx}`}
                  role={m.role}
                  content={m.content}
                />
              ))}
              {isStreaming ? <TypingIndicator /> : null}
            </div>
          )}
        </div>

        <div className="border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          {error ? (
            <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
              {error}
              <button
                type="button"
                className="ml-2 underline"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          ) : null}
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={onSend}
            isLoading={isStreaming}
          />
        </div>
      </div>

      <div className="fixed bottom-4 right-4 w-[360px] max-w-[90vw] rounded-2xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 p-3 text-sm font-semibold dark:border-zinc-800 dark:text-zinc-100">
          Retrieval Snapshot
        </div>
        <div className="p-3">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">Citations</div>
          <div className="mt-2 space-y-2">
            {(agentMeta.citations ?? []).length ? (
              agentMeta.citations!.map((c, i) => (
                <div key={i} className="rounded-xl bg-zinc-50 p-2 dark:bg-zinc-900">
                  <div className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    {c.title ?? "Untitled"}
                  </div>
                  {c.snippet ? (
                    <div className="mt-1 line-clamp-3 text-xs text-zinc-600 dark:text-zinc-400">
                      {c.snippet}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="text-xs text-zinc-500 dark:text-zinc-400">No citations captured yet.</div>
            )}
          </div>
        </div>
      </div>
    </ChatLayout>
  );
}
