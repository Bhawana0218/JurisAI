"use client";

import Link from "next/link";
import { Key, Webhook, Shield, FileText, Users, CreditCard, Gavel, ChevronRight } from "lucide-react";

const sections = [
  {
    href: "/dashboard/settings/api-keys",
    icon: Key,
    title: "API Keys",
    description: "Create and manage API keys for programmatic access to JurisAI.",
    color: "text-[#4a72c4]",
    bg: "bg-[#162d58]/40",
  },
  {
    href: "/dashboard/settings/webhooks",
    icon: Webhook,
    title: "Webhooks",
    description: "Configure webhook endpoints to receive real-time event notifications.",
    color: "text-[#c9a84c]",
    bg: "bg-[#c9a84c]/10",
  },
  {
    href: "/dashboard/settings/sso",
    icon: Shield,
    title: "Single Sign-On",
    description: "Set up SAML or OIDC SSO for your organization's identity provider.",
    color: "text-emerald-400",
    bg: "bg-emerald-900/30",
  },
  {
    href: "/dashboard/settings/audit",
    icon: FileText,
    title: "Audit Logs",
    description: "Review a complete history of actions taken across your organization.",
    color: "text-sky-400",
    bg: "bg-sky-900/30",
  },
  {
    href: "/dashboard/settings/governance",
    icon: Gavel,
    title: "AI Governance",
    description: "Define rules to control, filter, and audit AI responses at scale.",
    color: "text-violet-400",
    bg: "bg-violet-900/30",
  },
  {
    href: "/dashboard/settings/members",
    icon: Users,
    title: "Team Members",
    description: "Invite team members and manage roles and permissions.",
    color: "text-pink-400",
    bg: "bg-pink-900/30",
  },
  {
    href: "/dashboard/settings/billing",
    icon: CreditCard,
    title: "Billing & Usage",
    description: "Manage your subscription plan, payment methods, and usage limits.",
    color: "text-amber-400",
    bg: "bg-amber-900/30",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-[#7aa0d8]">Manage your workspace, integrations, and preferences</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex flex-col rounded-2xl border border-[#162d58] bg-[#0a1628] p-5 transition-all hover:border-[#2a4f96] hover:bg-[#0f2040]"
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <ChevronRight className="h-4 w-4 text-[#2a4f96] transition-transform group-hover:translate-x-0.5 group-hover:text-[#4a72c4]" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-white">{s.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#4a72c4]">{s.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
