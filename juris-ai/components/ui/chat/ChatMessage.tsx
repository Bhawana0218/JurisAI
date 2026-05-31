"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import { Scale, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChatMessageProps = {
  role: "user" | "assistant" | "system";
  content: string;
};

function MessageContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none prose-p:my-0 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:text-white prose-strong:text-white prose-code:text-[#c9a84c] prose-code:bg-[#0f2040] prose-code:px-1 prose-code:rounded prose-pre:bg-[#0f2040] prose-pre:border prose-pre:border-[#162d58]">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="my-0 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="my-1">{children}</ul>,
          ol: ({ children }) => <ol className="my-1">{children}</ol>,
          li: ({ children }) => <li className="my-0.5">{children}</li>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex w-full gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
          isUser
            ? "bg-gradient-to-br from-[#2a4f96] to-[#162d58]"
            : "bg-gradient-to-br from-[#c9a84c]/20 to-[#162d58] border border-[#c9a84c]/30"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Scale className="h-4 w-4 text-[#c9a84c]" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm",
          isUser
            ? "rounded-tr-sm bg-gradient-to-br from-[#1e3a70] to-[#162d58] text-white"
            : "rounded-tl-sm border border-[#162d58] bg-[#0a1628] text-[#d4e4f7]"
        )}
      >
        {!isUser && (
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#c9a84c]">
              JurisAI
            </span>
          </div>
        )}
        <MessageContent content={content} />
      </div>
    </div>
  );
}
