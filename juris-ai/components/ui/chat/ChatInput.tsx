"use client";

import * as React from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
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
          placeholder="Ask JurisAI… e.g., Draft a complaint for consumer refund"
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
        />
        <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
          Tip: press <span className="font-medium">Ctrl/⌘ + Enter</span> to send.
        </div>
      </div>

      <Button type="submit" disabled={!canSend} className="h-11 w-11 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}

