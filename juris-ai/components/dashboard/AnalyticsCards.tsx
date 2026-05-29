"use client";

import { FileText, MessageSquare, Users, Gavel } from "lucide-react";

interface AnalyticsCardsProps {
  totalUsers: number;
  totalChats: number;
  totalDocuments: number;
  totalCases: number;
}

export function AnalyticsCards({
  totalUsers,
  totalChats,
  totalDocuments,
  totalCases,
}: AnalyticsCardsProps) {
  const cards = [
    {
      label: "Total Users",
      value: totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
    },
    {
      label: "Total Chats",
      value: totalChats.toLocaleString(),
      icon: MessageSquare,
      color: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30",
    },
    {
      label: "Documents",
      value: totalDocuments.toLocaleString(),
      icon: FileText,
      color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
    },
    {
      label: "Legal Cases",
      value: totalCases.toLocaleString(),
      icon: Gavel,
      color: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{card.label}</div>
            <div className={`rounded-xl p-2 ${card.color}`}>
              <card.icon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
