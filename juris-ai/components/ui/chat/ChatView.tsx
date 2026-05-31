"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Scale, Zap, Shield, BookOpen, FileText } from "lucide-react";

import { ChatInput } from "@/components/ui/chat/ChatInput";
import { ChatLayout } from "@/components/ui/chat/ChatLayout";
import { ChatMessage } from "@/components/ui/chat/ChatMessage";
import { ChatSidebar } from "@/components/ui/chat/ChatSidebar";
import { TypingIndicator } from "@/components/ui/chat/TypingIndicator";
import { useChatStore, type ChatSummary } from "@/store/chat-store";

const SUGGESTIONS = [
  { icon: Shield, text: "How do I file an FIR for cybercrime?" },
  { icon: Scale, text: "What are my consumer rights for a defective product?" },
  { icon: BookOpen, text: "Steps to file a domestic violence complaint" },
  { icon: FileText, text: "Explain the court procedure for a civil case" },
];

export function ChatView({ chatId }: { chatId?: string }) {
  const router = useRouter();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const {
    chats, messages, isStreaming, error, isLoadingChats,
    setChats, setCurrentChat, setMessages, addMessage,
    appendToLastMessage, setIsStreaming, setError, setIsLoadingChats,
  } = useChatStore();

  const [input, setInput] = React.useState("");
  const [agentMeta, setAgentMeta] = React.useState<{
    agentId?: string;
    confidence?: number;
    citations?: Array<{ documentId?: string; title?: string; snippet?: string }>;
  }>({});

  // Scroll to bottom on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

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
      } catch { /* silently fail */ } finally {
        setIsLoadingChats(false);
      }
    };
    fetchChats();
  }, [setChats, setIsLoadingChats]);

  React.useEffect(() => {
    if (!chatId) { setMessages([]); return; }
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
      } catch { /* silently fail */ }
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
      setChats([{ id: newId, title: "New conversation", agentType: data.chat.agentType ?? "GENERAL", createdAt: data.chat.createdAt, lastMessageAt: null }, ...chats]);
      router.push(`/dashboard/chat/${newId}`);
      return newId;
    } catch { return null; }
  }, [chatId, chats, router, setChats]);

  const onSend = async () => {
    const userText = input.trim();
    if (!userText || isStreaming) return;
    setError(null);

    const resolvedChatId = chatId || (await ensureChat());
    if (!resolvedChatId) { setError("Failed to create chat session"); return; }

    setIsStreaming(true);
    addMessage({ id: `user-${Date.now()}`, role: "user", content: userText });
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: userText }], chatId: resolvedChatId, useRag: true, language: "en" }),
      });

      if (!res.ok || !res.body) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Chat failed (${res.status}). ${txt}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      addMessage({ id: `assistant-${Date.now()}`, role: "assistant", content: "" });
      setAgentMeta((prev) => ({ ...prev, agentId: res.headers.get("X-Agent-Id") ?? undefined }));

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        appendToLastMessage(decoder.decode(value, { stream: true }));
      }

      const currentChats = useChatStore.getState().chats;
      setChats(currentChats.map((c) =>
        c.id === resolvedChatId
          ? { ...c, lastMessageAt: new Date().toISOString(), title: c.title === "New conversation" && userText.length > 50 ? userText.slice(0, 50) + "..." : c.title }
          : c
      ));
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
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#2a4f96] to-[#162d58]">
              <Scale className="h-3.5 w-3.5 text-[#c9a84c]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">JurisAI Legal Chat</div>
              <div className="text-[10px] text-[#4a72c4]">
                {agentMeta.agentId ? `Agent: ${agentMeta.agentId.replace(/_/g, " ")}` : "Routing to best agent…"}
              </div>
            </div>
          </div>
          {typeof agentMeta.confidence === "number" && (
            <div className="flex items-center gap-1.5 rounded-full border border-[#162d58] bg-[#0f2040] px-3 py-1">
              <Zap className="h-3 w-3 text-[#c9a84c]" />
              <span className="text-[10px] font-medium text-[#7aa0d8]">
                {Math.round(agentMeta.confidence * 100)}% confidence
              </span>
            </div>
          )}
        </div>
      }
    >
      <div className="flex h-full flex-col">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="mx-auto mt-6 max-w-2xl">
              {/* Welcome card */}
              <div className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2a4f96] to-[#162d58] shadow-lg shadow-[#2a4f96]/20">
                  <Scale className="h-7 w-7 text-[#c9a84c]" />
                </div>
                <h2 className="mt-4 text-lg font-bold text-white">Ask a legal question</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#7aa0d8]">
                  JurisAI routes your query to the best specialist agent and grounds answers
                  with AI-powered retrieval from your documents and the Indian legal knowledge base.
                </p>
              </div>

              {/* Suggestion chips */}
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {SUGGESTIONS.map(({ icon: Icon, text }) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => setInput(text)}
                    className="flex items-start gap-3 rounded-xl border border-[#162d58] bg-[#0a1628] p-3.5 text-left text-sm text-[#7aa0d8] transition hover:border-[#2a4f96] hover:bg-[#0f2040] hover:text-white"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#4a72c4]" />
                    {text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map((m, idx) => (
                <ChatMessage key={m.id || idx} role={m.role} content={m.content} />
              ))}
              {isStreaming && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t border-[#162d58] bg-[#0a1628] p-4">
          {error && (
            <div className="mb-3 flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} className="ml-3 text-xs underline opacity-70 hover:opacity-100">
                Dismiss
              </button>
            </div>
          )}
          <ChatInput value={input} onChange={setInput} onSend={onSend} isLoading={isStreaming} />
        </div>
      </div>

      {/* Citations panel */}
      {(agentMeta.citations ?? []).length > 0 && (
        <div className="fixed bottom-4 right-4 w-80 rounded-2xl border border-[#162d58] bg-[#0a1628] shadow-2xl shadow-[#2a4f96]/20">
          <div className="flex items-center gap-2 border-b border-[#162d58] px-4 py-3">
            <BookOpen className="h-3.5 w-3.5 text-[#c9a84c]" />
            <span className="text-xs font-semibold text-white">Retrieval Citations</span>
          </div>
          <div className="max-h-64 overflow-y-auto p-3 space-y-2">
            {agentMeta.citations!.map((c, i) => (
              <div key={i} className="rounded-xl border border-[#162d58] bg-[#050d1a] p-2.5">
                <div className="truncate text-xs font-medium text-[#7aa0d8]">{c.title ?? "Untitled"}</div>
                {c.snippet && (
                  <div className="mt-1 line-clamp-2 text-[11px] text-[#4a72c4]">{c.snippet}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </ChatLayout>
  );
}
