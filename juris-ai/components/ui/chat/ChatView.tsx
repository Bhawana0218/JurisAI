"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Scale, Shield, BookOpen, FileText,
  MessageSquare, Plus, Menu, X, Send,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { useChatStore, type ChatSummary } from "@/store/chat-store";

/* ─── Suggestion prompts ─────────────────────────────────────── */
const SUGGESTIONS = [
  { icon: Shield,   text: "How do I file an FIR for cybercrime?" },
  { icon: Scale,    text: "What are my consumer rights for a defective product?" },
  { icon: BookOpen, text: "Steps to file a domestic violence complaint" },
  { icon: FileText, text: "Explain the court procedure for a civil case" },
];

/* ─── Typing indicator ───────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#c9a84c]/30 bg-[#c9a84c]/10">
        <Scale className="h-4 w-4 text-[#c9a84c]" />
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-[#162d58] bg-[#0a1628] px-4 py-3">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#c9a84c]">JurisAI</div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-[#4a72c4] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Single message bubble ──────────────────────────────────── */
function Message({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex w-full gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
        isUser ? "bg-[#2a4f96] text-white" : "border border-[#c9a84c]/30 bg-[#c9a84c]/10 text-[#c9a84c]"
      )}>
        {isUser ? "U" : <Scale className="h-4 w-4" />}
      </div>
      <div className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
        isUser
          ? "rounded-tr-sm bg-[#1e3a70] text-white"
          : "rounded-tl-sm border border-[#162d58] bg-[#0a1628] text-[#d4e4f7]"
      )}>
        {!isUser && (
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#c9a84c]">JurisAI</div>
        )}
        <div className="prose prose-sm max-w-none prose-p:my-0 prose-headings:text-white prose-strong:text-white prose-code:text-[#c9a84c] prose-code:bg-[#0f2040] prose-code:px-1 prose-code:rounded prose-pre:bg-[#0f2040] prose-pre:border prose-pre:border-[#162d58] prose-ul:my-1 prose-li:my-0.5">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ChatView ──────────────────────────────────────────── */
export function ChatView({ chatId }: { chatId?: string }) {
  const router = useRouter();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const {
    chats, messages, isStreaming, error,
    setChats, setCurrentChat, setMessages, addMessage,
    appendToLastMessage, setIsStreaming, setError, setIsLoadingChats,
  } = useChatStore();

  const [input, setInput] = React.useState("");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [agentId, setAgentId] = React.useState<string | null>(null);

  /* scroll to bottom */
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  /* sync current chat */
  React.useEffect(() => {
    setCurrentChat(chatId ?? null);
  }, [chatId, setCurrentChat]);

  /* load chat list */
  React.useEffect(() => {
    setIsLoadingChats(true);
    fetch("/api/chats")
      .then((r) => r.ok ? r.json() : { chats: [] })
      .then((d) => setChats(d.chats ?? []))
      .catch(() => {})
      .finally(() => setIsLoadingChats(false));
  }, [setChats, setIsLoadingChats]);

  /* load messages for current chat */
  React.useEffect(() => {
    if (!chatId) { setMessages([]); return; }
    fetch(`/api/chats/${chatId}/messages`)
      .then((r) => r.ok ? r.json() : { messages: [] })
      .then((d) => setMessages(
        (d.messages ?? []).map((m: { id: string; role: string; content: string; createdAt: string }) => ({
          id: m.id,
          role: m.role === "ASSISTANT" ? "assistant" : "user",
          content: m.content,
          createdAt: m.createdAt,
        }))
      ))
      .catch(() => {});
  }, [chatId, setMessages]);

  /* create a new chat session */
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
      setChats([
        { id: newId, title: "New conversation", agentType: data.chat.agentType ?? "GENERAL", createdAt: data.chat.createdAt, lastMessageAt: null },
        ...chats,
      ]);
      router.push(`/dashboard/chat/${newId}`);
      return newId;
    } catch { return null; }
  }, [chatId, chats, router, setChats]);

  /* send message */
  const onSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setError(null);

    const resolvedId = chatId || (await ensureChat());
    if (!resolvedId) { setError("Failed to create chat session"); return; }

    setIsStreaming(true);
    addMessage({ id: `user-${Date.now()}`, role: "user", content: text });
    setInput("");
    inputRef.current?.focus();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: text }],
          chatId: resolvedId,
          useRag: true,
          language: "en",
        }),
      });

      if (!res.ok || !res.body) throw new Error(`Chat failed (${res.status})`);

      setAgentId(res.headers.get("X-Agent-Id"));
      addMessage({ id: `assistant-${Date.now()}`, role: "assistant", content: "" });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        appendToLastMessage(decoder.decode(value, { stream: true }));
      }

      /* update chat title in sidebar */
      setChats(
        useChatStore.getState().chats.map((c) =>
          c.id === resolvedId
            ? { ...c, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void onSend();
    }
  };

  /* navigate to a chat and close sidebar */
  const openChat = (id: string) => {
    setSidebarOpen(false);
    router.push(`/dashboard/chat/${id}`);
  };

  const newChat = () => {
    setSidebarOpen(false);
    router.push("/dashboard/chat");
  };

  /* ── Shared sidebar content (used by both mobile & desktop) ── */
  const SidebarPanel = (
    <div className="flex h-full flex-col bg-[#0a1628]">
      {/* Sidebar header */}
      <div className="flex items-center justify-between border-b border-[#162d58] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-[#2a4f96] to-[#162d58]">
            <Scale className="h-4 w-4 text-[#c9a84c]" />
          </div>
          <span className="text-sm font-semibold text-white">Conversations</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={newChat}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#162d58] bg-[#0f2040] text-[#7aa0d8] transition hover:bg-[#162d58] hover:text-white"
            title="New chat"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#7aa0d8] transition hover:bg-[#0f2040] hover:text-white"
            title="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {chats.length === 0 ? (
          <div className="py-14 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-[#162d58]" />
            <p className="mt-4 text-sm text-[#4a72c4]">No conversations yet</p>
            <button
              onClick={newChat}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-[#2a4f96] to-[#1e3a70] px-4 py-2 text-xs font-semibold text-white transition hover:from-[#4a72c4] hover:to-[#2a4f96]"
            >
              <Plus className="h-3.5 w-3.5" />
              Start a new chat
            </button>
          </div>
        ) : (
          <nav className="space-y-1">
            {chats.map((c: ChatSummary) => (
              <button
                key={c.id}
                onClick={() => openChat(c.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition",
                  c.id === chatId
                    ? "bg-linear-to-r from-[#1e3a70] to-[#162d58] text-white"
                    : "text-[#7aa0d8] hover:bg-[#0f2040] hover:text-white"
                )}
              >
                <MessageSquare className={cn("h-4 w-4 shrink-0", c.id === chatId ? "text-[#c9a84c]" : "text-[#4a72c4]")} />
                <span className="truncate">{c.title}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );

  /* ── Render ── */
  return (
    <div className="flex min-h-0 bg-[#050d1a]">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex lg:w-80 shrink-0 border-r border-[#162d58] bg-[#0a1628]">
        {SidebarPanel}
      </aside>

      {/* ── Sidebar overlay (mobile only) ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="relative z-50 w-80 max-w-[85vw] shadow-2xl">
            {SidebarPanel}
          </div>
        </div>
      )}

      {/* ── Main chat area ── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Top bar */}
        <div className="flex shrink-0 items-center gap-3 border-b border-[#162d58] bg-[#0a1628] px-4 py-3">
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#162d58] bg-[#0f2040] text-[#7aa0d8] transition hover:bg-[#162d58] hover:text-white lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-[#2a4f96] to-[#162d58]">
              <Scale className="h-3.5 w-3.5 text-[#c9a84c]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">JurisAI Legal Chat</div>
              <div className="text-[10px] text-[#4a72c4]">
                {agentId ? `Agent: ${agentId.replace(/_/g, " ")}` : "Routing to best agent…"}
              </div>
            </div>
          </div>

          {/* New chat button */}
          <button
            onClick={newChat}
            className="ml-auto flex items-center gap-1.5 rounded-xl border border-[#162d58] bg-[#0f2040] px-3 py-1.5 text-xs font-medium text-[#7aa0d8] transition hover:bg-[#162d58] hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New chat</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            /* Welcome / empty state */
            <div className="mx-auto max-w-2xl">
              <div className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-[#2a4f96] to-[#162d58] shadow-lg shadow-[#2a4f96]/20">
                  <Scale className="h-8 w-8 text-[#c9a84c]" />
                </div>
                <h2 className="mt-5 text-xl font-bold text-white">How can JurisAI help you?</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#7aa0d8]">
                  Ask any legal question. JurisAI routes your query to the best specialist agent
                  and grounds answers with retrieval from Indian legal knowledge.
                </p>
              </div>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {SUGGESTIONS.map(({ icon: Icon, text }) => (
                  <button
                    key={text}
                    onClick={() => { setInput(text); inputRef.current?.focus(); }}
                    className="flex items-start gap-3 rounded-xl border border-[#162d58] bg-[#0a1628] p-4 text-left text-sm text-[#7aa0d8] transition hover:border-[#2a4f96] hover:bg-[#0f2040] hover:text-white"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#4a72c4]" />
                    {text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-5">
              {messages.map((m, i) => (
                <Message key={m.id || i} role={m.role as "user" | "assistant"} content={m.content} />
              ))}
              {isStreaming && <TypingDots />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="shrink-0 border-t border-[#162d58] bg-[#0a1628] px-4 py-4">
          {error && (
            <div className="mb-3 flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-3 text-xs underline opacity-70 hover:opacity-100">
                Dismiss
              </button>
            </div>
          )}

          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-3 rounded-2xl border border-[#162d58] bg-[#050d1a] px-4 py-3 focus-within:border-[#4a72c4] transition">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a legal question… (Enter to send, Shift+Enter for new line)"
                rows={1}
                disabled={isStreaming}
                className="flex-1 resize-none bg-transparent text-sm text-white placeholder-[#2a4f96] outline-none disabled:opacity-50"
                style={{ maxHeight: "160px", overflowY: "auto" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
                }}
              />
              <button
                onClick={() => void onSend()}
                disabled={!input.trim() || isStreaming}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#2a4f96] to-[#1e3a70] text-white shadow-lg transition hover:from-[#4a72c4] hover:to-[#2a4f96] disabled:opacity-40"
              >
                {isStreaming ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-1.5 text-center text-[11px] text-[#2a4f96]">
              JurisAI can make mistakes. Verify important legal information with a qualified professional.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
