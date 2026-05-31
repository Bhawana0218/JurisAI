"use client";

import * as React from "react";

export type ChatLayoutProps = {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
};

export function ChatLayout({ sidebar, header, children }: ChatLayoutProps) {
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 border-r border-[#162d58] bg-[#050d1a]">
        {sidebar}
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col bg-[#050d1a]">
        <header className="shrink-0 border-b border-[#162d58] bg-[#0a1628] px-5 py-3.5">
          {header}
        </header>
        <main className="flex min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
