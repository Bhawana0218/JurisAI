"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ChatSidebarProps = {
  chats: Array<{ id: string; title: string }>;
  onNewChat: () => void;
  currentChatId?: string;
};

export function ChatSidebar({ chats, onNewChat, currentChatId }: ChatSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Conversations</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Legal intelligence chats</div>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="h-9 w-9 rounded-xl bg-zinc-100/70 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-100 dark:hover:bg-zinc-800"
            onClick={onNewChat}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-2 pb-4">
        <nav className="space-y-1 px-2">
          {chats.length ? (
            chats.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/chat/${encodeURIComponent(c.id)}`}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                  c.id === currentChatId
                    ? "bg-zinc-200/70 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                )}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{c.title}</span>
              </Link>
            ))
          ) : (
            <div className="px-3 py-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
              No conversations yet.<br />
              Start a new chat to begin.
            </div>
          )}
        </nav>
      </div>

      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>All systems operational</span>
        </div>
        <div className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          JurisAI v0.1 • AI-powered
        </div>
      </div>
    </div>
  );
}
