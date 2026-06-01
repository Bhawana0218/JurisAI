"use client";

import { Scale } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#c9a84c]/30 bg-linear-to-br from-[#c9a84c]/20 to-[#162d58]">
        <Scale className="h-4 w-4 text-[#c9a84c]" />
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-[#162d58] bg-[#0a1628] px-4 py-3">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#c9a84c]">
          JurisAI
        </div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-[#4a72c4]"
              style={{
                animation: "bounce 1.2s infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
