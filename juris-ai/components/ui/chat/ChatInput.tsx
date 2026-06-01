"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void | Promise<void>;
  isLoading?: boolean;
};

export function ChatInput({ value, onChange, onSend, isLoading }: ChatInputProps) {
  const [isComposing, setIsComposing] = React.useState(false);
  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <form
      className="flex items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSend) return;
        void onSend();
      }}
    >
      <div className="flex-1">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask JurisAI… e.g., How do I file an FIR for cybercrime?"
          minRows={1}
          maxRows={6}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isComposing && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              if (!canSend) return;
              void onSend();
            }
          }}
          className="w-full resize-none rounded-xl border border-[#162d58] bg-[#0a1628] px-4 py-3 text-sm text-white placeholder-[#2a4f96] outline-none transition focus:border-[#4a72c4] focus:ring-1 focus:ring-[#4a72c4]/40"
        />
        <div className="mt-1.5 text-[11px] text-[#2a4f96]">
          <span className="hidden sm:inline">
            Press <span className="font-medium text-[#4a72c4]">Ctrl/⌘ + Enter</span> to send
          </span>
          <span className="sm:hidden">Tap Send to submit</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSend}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#2a4f96] to-[#1e3a70] text-white shadow-lg shadow-[#2a4f96]/20 transition hover:from-[#4a72c4] hover:to-[#2a4f96] disabled:opacity-40"
        aria-label="Send message"
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </button>
    </form>
  );
}
