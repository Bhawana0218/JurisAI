"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, MessageSquare, FileText, Briefcase, Network,
  Workflow, BarChart3, Settings, HelpCircle, ChevronLeft, ChevronRight,
  Bot, Key, Webhook, Shield, Users, CreditCard, Puzzle, Scale, Menu,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const navigation = [
  {
    section: "Workspace",
    items: [
      { label: "Dashboard",  href: "/dashboard",            icon: LayoutDashboard },
      { label: "Chat",       href: "/dashboard/chat",        icon: MessageSquare },
      { label: "Documents",  href: "/dashboard/documents",   icon: FileText },
      { label: "Cases",      href: "/dashboard/cases",       icon: Briefcase },
    ],
  },
  {
    section: "AI Platform",
    items: [
      { label: "Agents",          href: "/dashboard/marketplace",     icon: Bot },
      { label: "Workflows",       href: "/dashboard/workflows",        icon: Workflow },
      { label: "Knowledge Graph", href: "/dashboard/knowledge-graph",  icon: Network },
      { label: "Integrations",    href: "/dashboard/integrations",     icon: Puzzle },
    ],
  },
  {
    section: "Analytics",
    items: [
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { label: "Quality",   href: "/dashboard/quality",   icon: Shield },
      { label: "Prompts",   href: "/dashboard/prompts",   icon: Bot },
    ],
  },
  {
    section: "Settings",
    items: [
      { label: "API Keys",    href: "/dashboard/settings/api-keys",    icon: Key },
      { label: "Webhooks",    href: "/dashboard/settings/webhooks",    icon: Webhook },
      { label: "SSO",         href: "/dashboard/settings/sso",         icon: Shield },
      { label: "Audit Logs",  href: "/dashboard/settings/audit",       icon: FileText },
      { label: "Governance",  href: "/dashboard/settings/governance",  icon: Shield },
      { label: "Members",     href: "/dashboard/settings/members",     icon: Users },
      { label: "Billing",     href: "/dashboard/settings/billing",     icon: CreditCard },
      { label: "Settings",    href: "/dashboard/settings",             icon: Settings },
    ],
  },
];

function SidebarContent({ collapsed, pathname, onNavClick }: {
  collapsed: boolean;
  pathname: string;
  onNavClick?: () => void;
}) {
  return (
    <>
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#162d58] px-4">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-[#2a4f96] to-[#162d58]">
              <Scale className="h-3.5 w-3.5 text-[#c9a84c]" />
            </div>
            <span className="text-sm font-bold text-white">JurisAI</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {navigation.map((group) => (
          <div key={group.section} className="mb-5">
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#2a4f96]">
                {group.section}
              </p>
            )}
            {group.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  onClick={onNavClick}
                  className={`mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    active
                      ? "bg-linear-to-r from-[#1e3a70] to-[#162d58] text-white shadow-sm"
                      : "text-[#4a72c4] hover:bg-[#0f2040] hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 shrink-0 ${active ? "text-[#c9a84c]" : ""}`}
                  />
                  {!collapsed && item.label}
                  {active && !collapsed && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c9a84c]" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-[#162d58] px-2 py-3">
        <Link
          href="/dashboard/settings"
          title={collapsed ? "Settings" : undefined}
          onClick={onNavClick}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#4a72c4] transition hover:bg-[#0f2040] hover:text-white"
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && "Settings"}
        </Link>
        <Link
          href="/dashboard/support"
          title={collapsed ? "Help" : undefined}
          onClick={onNavClick}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#4a72c4] transition hover:bg-[#0f2040] hover:text-white"
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          {!collapsed && "Help & Support"}
        </Link>
        {!collapsed && (
          <div className="mt-3 rounded-xl border border-[#162d58] bg-[#0a1628] px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-[#7aa0d8]">All systems operational</span>
            </div>
            <div className="mt-0.5 text-[10px] text-[#2a4f96]">JurisAI v0.1 · AI-powered</div>
          </div>
        )}
      </div>
    </>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isChat = pathname.startsWith("/dashboard/chat");

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050d1a]">

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-[#162d58] bg-[#050d1a] transition-all duration-300 shrink-0 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <SidebarContent collapsed={collapsed} pathname={pathname} />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 bg-[#050d1a] p-0 border-r border-[#162d58]">
          <SidebarContent collapsed={false} pathname={pathname} onNavClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#162d58] bg-[#050d1a] px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex lg:hidden rounded-lg p-1.5 text-[#4a72c4] transition hover:bg-[#0f2040] hover:text-white"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex rounded-lg p-1.5 text-[#4a72c4] transition hover:bg-[#0f2040] hover:text-white"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            <span className="text-sm font-medium text-[#7aa0d8]">
              {navigation
                .flatMap((g) => g.items)
                .find((i) => pathname === i.href || pathname.startsWith(i.href + "/"))?.label ?? "Dashboard"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-linear-to-br from-[#2a4f96] to-[#162d58] flex items-center justify-center text-xs font-bold text-white">
              U
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex min-h-0 flex-1 bg-[#050d1a]">
          {isChat ? (
            /* Chat: full height, no padding */
            <div className="flex min-h-0 flex-1">{children}</div>
          ) : (
            /* Other pages: padded, scrollable */
            <div className="flex min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">{children}</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
