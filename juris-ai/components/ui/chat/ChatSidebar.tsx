"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, MessageSquare, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChatSidebarProps = {
  chats: Array<{ id: string; title: string }>;
  onNewChat: () => void;
  currentChatId?: string;
};

export function ChatSidebar({ chats, onNewChat, currentChatId }: ChatSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-[#162d58] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#2a4f96] to-[#162d58]">
              <Scale className="h-3.5 w-3.5 text-[#c9a84c]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Conversations</div>
              <div className="text-[10px] text-[#4a72c4]">Legal intelligence chats</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onNewChat}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#162d58] bg-[#0f2040] text-[#7aa0d8] transition hover:border-[#2a4f96] hover:bg-[#162d58] hover:text-white"
            aria-label="New chat"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {chats.length ? (
          <nav className="space-y-0.5">
            {chats.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/chat/${encodeURIComponent(c.id)}`}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition",
                  c.id === currentChatId
                    ? "bg-gradient-to-r from-[#1e3a70] to-[#162d58] text-white"
                    : "text-[#7aa0d8] hover:bg-[#0f2040] hover:text-white"
                )}
              >
                <MessageSquare
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    c.id === currentChatId ? "text-[#c9a84c]" : "text-[#4a72c4]"
                  )}
                />
                <span className="truncate">{c.title}</span>
              </Link>
            ))}
          </nav>
        ) : (
          <div className="px-3 py-10 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-[#162d58]" />
            <p className="mt-3 text-xs text-[#4a72c4]">No conversations yet.</p>
            <p className="text-xs text-[#2a4f96]">Start a new chat to begin.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#162d58] p-4">
        <div className="rounded-xl border border-[#162d58] bg-[#0a1628] px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-[#7aa0d8]">All systems operational</span>
          </div>
          <div className="mt-0.5 text-[10px] text-[#2a4f96]">JurisAI v0.1 · AI-powered</div>
        </div>
      </div>
    </div>
  );
}
