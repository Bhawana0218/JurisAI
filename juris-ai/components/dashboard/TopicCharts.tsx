"use client";

interface TopicChartsProps {
  agentDistribution: Array<{ agent: string; count: number }>;
  dailyChats: Array<{ date: string; count: number }>;
}

export function TopicCharts({ agentDistribution, dailyChats }: TopicChartsProps) {
  const total = agentDistribution.reduce((sum, a) => sum + a.count, 0);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Agent Usage Distribution</div>
      <div className="mt-4 space-y-3">
        {agentDistribution.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-400">No data yet</div>
        ) : (
          agentDistribution.slice(0, 8).map((item) => {
            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.agent}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {item.agent.replace(/_/g, " ")}
                  </span>
                  <span className="text-zinc-500">{item.count}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-zinc-900 transition-all dark:bg-zinc-100"
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
