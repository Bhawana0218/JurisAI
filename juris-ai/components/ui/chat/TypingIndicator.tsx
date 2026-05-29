"use client";

import * as React from "react";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
      <span>JurisAI is typing</span>
      <span className="inline-flex items-center">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-[bounce_1s_infinite]" style={{ animationDelay: "0ms" }} />
        <span className="ml-1 h-1.5 w-1.5 rounded-full bg-zinc-400 animate-[bounce_1s_infinite]" style={{ animationDelay: "120ms" }} />
        <span className="ml-1 h-1.5 w-1.5 rounded-full bg-zinc-400 animate-[bounce_1s_infinite]" style={{ animationDelay: "240ms" }} />
      </span>
      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-3px); }
        }
        .animate-\[bounce_1s_infinite\] { animation: bounce 1s infinite; }
      `}</style>
    </div>
  );
}

