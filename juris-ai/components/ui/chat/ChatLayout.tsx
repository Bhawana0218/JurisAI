"use client";

import * as React from "react";

export type ChatLayoutProps = {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
};

export function ChatLayout({ sidebar, header, children }: ChatLayoutProps) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex h-screen max-w-[1280px] gap-0 bg-zinc-50 dark:bg-black">
        <aside className="w-[320px] shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/50 backdrop-blur">
          {sidebar}
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="shrink-0 border-b border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/50 backdrop-blur">
            {header}
          </header>
          <main className="flex min-h-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

