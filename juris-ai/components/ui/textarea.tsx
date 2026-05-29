"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({
  className,
  minRows,
  maxRows,
  style,
  ...props
}: React.ComponentProps<"textarea"> & { minRows?: number; maxRows?: number }) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el || !minRows) return;

    const resize = () => {
      el.style.height = "auto";
      const lineHeight = parseInt(getComputedStyle(el).lineHeight, 10) || 20;
      const padding = el.offsetHeight - el.clientHeight;
      const minHeight = minRows * lineHeight + padding;
      const maxH = maxRows ? maxRows * lineHeight + padding : Infinity;
      const scrollHeight = el.scrollHeight;
      el.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxH)}px`;
    };

    resize();
    el.addEventListener("input", resize);
    return () => el.removeEventListener("input", resize);
  }, [minRows, maxRows]);

  return (
    <textarea
      ref={textareaRef}
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      style={style}
      {...props}
    />
  );
}

export { Textarea };
