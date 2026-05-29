"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";

export type ChatMessageProps = {
  role: "user" | "assistant" | "system";
  content: string;
};

function getBubbleClass(role: ChatMessageProps["role"]) {
  if (role === "user") {
    return "ml-auto bg-black text-white dark:bg-white dark:text-black";
  }
  if (role === "system") {
    return "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200";
  }
  return "bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100";
}

function MessageContent({ content }: { content: string }) {
  return (
    <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="my-0">{children}</p>,
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
  return (
    <div className={cn("flex w-full", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[820px] rounded-2xl px-4 py-3 text-sm shadow-sm border border-zinc-200 dark:border-zinc-800",
          getBubbleClass(role),
        )}
      >
        <MessageContent content={content} />
      </div>
    </div>
  );
}
