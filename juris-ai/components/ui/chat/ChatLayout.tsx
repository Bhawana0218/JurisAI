"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export type ChatLayoutProps = {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  sidebarOpen?: boolean;
  onOpenSidebar?: () => void;
  onCloseSidebar?: () => void;
};

export function ChatLayout({
  sidebar,
  header,
  children,
  sidebarOpen,
  onOpenSidebar,
  onCloseSidebar,
}: ChatLayoutProps) {
  const [localMobileOpen, setLocalMobileOpen] = React.useState(false);
  const mobileOpen = sidebarOpen ?? localMobileOpen;

  const handleOpenChange = (open: boolean) => {
    if (open) {
      onOpenSidebar?.();
    } else {
      onCloseSidebar?.();
    }
    if (sidebarOpen === undefined) {
      setLocalMobileOpen(open);
    }
  };

  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 border-r border-[#162d58] bg-[#050d1a]">
        {sidebar}
      </aside>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={handleOpenChange}>
        <SheetContent side="left" className="w-72 bg-[#050d1a] p-0 border-r border-[#162d58]">
          {sidebar}
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col bg-[#050d1a]">
        <header className="flex shrink-0 items-center gap-3 border-b border-[#162d58] bg-[#0a1628] px-4 py-3.5 lg:px-5">
          {/* Hamburger (mobile only) */}
          <button
            onClick={() => handleOpenChange(true)}
            className="flex lg:hidden rounded-lg p-1.5 text-[#4a72c4] transition hover:bg-[#0f2040] hover:text-white"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          {header}
        </header>
        <main className="flex min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
