"use client";

import { BarChart3 } from "lucide-react";

interface TopicChartsProps {
  agentDistribution: Array<{ agent: string; count: number }>;
  dailyChats: Array<{ date: string; count: number }>;
}

const AGENT_COLORS = [
  "from-[#2a4f96] to-[#4a72c4]",
  "from-[#1e3a70] to-[#2a4f96]",
  "from-[#c9a84c] to-[#e8c97a]",
  "from-[#162d58] to-[#1e3a70]",
  "from-[#4a72c4] to-[#7aa0d8]",
  "from-[#0f2040] to-[#162d58]",
  "from-[#2a4f96] to-[#162d58]",
  "from-[#c9a84c] to-[#2a4f96]",
];

export function TopicCharts({ agentDistribution }: TopicChartsProps) {
  const total = agentDistribution.reduce((sum, a) => sum + a.count, 0);

  return (
    <div className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#2a4f96] to-[#162d58]">
          <BarChart3 className="h-3.5 w-3.5 text-[#c9a84c]" />
        </div>
        <div className="text-sm font-semibold text-white">Agent Usage Distribution</div>
      </div>

      <div className="mt-5 space-y-3">
        {agentDistribution.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#4a72c4]">No data yet</div>
        ) : (
          agentDistribution.slice(0, 8).map((item, idx) => {
            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.agent}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#d4e4f7]">
                    {item.agent.replace(/_/g, " ")}
                  </span>
                  <span className="text-[#7aa0d8]">{item.count} · {percentage}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#0f2040]">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${AGENT_COLORS[idx % AGENT_COLORS.length]} transition-all duration-700`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
