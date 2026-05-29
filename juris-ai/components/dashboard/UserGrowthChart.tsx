"use client";

interface UserGrowthChartProps {
  recentUsers: number;
  tokensUsedLast30Days: number;
}

export function UserGrowthChart({ recentUsers, tokensUsedLast30Days }: UserGrowthChartProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">30-Day Activity</div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">New Users</div>
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {recentUsers}
          </div>
          <div className="mt-1 text-xs text-zinc-400">Last 30 days</div>
        </div>
        <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">AI Tokens Used</div>
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {(tokensUsedLast30Days / 1000).toFixed(1)}K
          </div>
          <div className="mt-1 text-xs text-zinc-400">Last 30 days</div>
        </div>
      </div>
    </div>
  );
}
