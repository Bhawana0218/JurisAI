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
      iconBg: "from-[#2a4f96] to-[#162d58]",
      iconColor: "text-[#7aa0d8]",
      trend: "+12%",
    },
    {
      label: "Total Chats",
      value: totalChats.toLocaleString(),
      icon: MessageSquare,
      iconBg: "from-[#1e3a70] to-[#0f2040]",
      iconColor: "text-[#c9a84c]",
      trend: "+8%",
    },
    {
      label: "Documents",
      value: totalDocuments.toLocaleString(),
      icon: FileText,
      iconBg: "from-[#162d58] to-[#0a1628]",
      iconColor: "text-[#7aa0d8]",
      trend: "+5%",
    },
    {
      label: "Legal Cases",
      value: totalCases.toLocaleString(),
      icon: Gavel,
      iconBg: "from-[#2a4f96] to-[#162d58]",
      iconColor: "text-[#c9a84c]",
      trend: "+3%",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="group rounded-2xl border border-[#162d58] bg-[#0a1628] p-5 transition hover:border-[#2a4f96] hover:bg-[#0f2040]"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-[#7aa0d8]">{card.label}</div>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${card.iconBg}`}>
              <card.icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold tracking-tight text-white">
            {card.value}
          </div>
          <div className="mt-1 text-xs text-emerald-400">{card.trend} this month</div>
        </div>
      ))}
    </div>
  );
}
