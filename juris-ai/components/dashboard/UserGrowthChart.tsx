"use client";

import { Users, Zap } from "lucide-react";

interface UserGrowthChartProps {
  recentUsers: number;
  tokensUsedLast30Days: number;
}

export function UserGrowthChart({ recentUsers, tokensUsedLast30Days }: UserGrowthChartProps) {
  return (
    <div className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-[#2a4f96] to-[#162d58]">
          <Users className="h-3.5 w-3.5 text-[#c9a84c]" />
        </div>
        <div className="text-sm font-semibold text-white">30-Day Activity</div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#162d58] bg-[#050d1a] p-4">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[#4a72c4]" />
            <div className="text-xs text-[#7aa0d8]">New Users</div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{recentUsers}</div>
          <div className="mt-1 text-xs text-[#4a72c4]">Last 30 days</div>
        </div>
        <div className="rounded-xl border border-[#162d58] bg-[#050d1a] p-4">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-[#c9a84c]" />
            <div className="text-xs text-[#7aa0d8]">AI Tokens</div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {(tokensUsedLast30Days / 1000).toFixed(1)}K
          </div>
          <div className="mt-1 text-xs text-[#4a72c4]">Last 30 days</div>
        </div>
      </div>

      {/* Mini bar chart decoration */}
      <div className="mt-5 flex items-end gap-1">
        {[30, 55, 40, 70, 45, 80, 60, 90, 50, 75, 85, 65].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-linear-to-t from-[#2a4f96] to-[#4a72c4] opacity-60"
            style={{ height: `${h * 0.5}px` }}
          />
        ))}
      </div>
      <div className="mt-1 text-[10px] text-[#2a4f96]">Activity trend (illustrative)</div>
    </div>
  );
}
