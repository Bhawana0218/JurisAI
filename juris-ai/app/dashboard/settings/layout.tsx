"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Key, Webhook, Shield, Gavel, Users, CreditCard, FileText } from "lucide-react";

const navItems = [
  { href: "/dashboard/settings/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/settings/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/dashboard/settings/sso", label: "SSO", icon: Shield },
  { href: "/dashboard/settings/audit", label: "Audit Logs", icon: FileText },
  { href: "/dashboard/settings/governance", label: "Governance", icon: Gavel },
  { href: "/dashboard/settings/members", label: "Members", icon: Users },
  { href: "/dashboard/settings/billing", label: "Billing", icon: CreditCard },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-8">
      <nav className="w-56 shrink-0">
        <div className="sticky top-24 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                }`}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
