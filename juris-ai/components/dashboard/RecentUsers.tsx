"use client";

import { Clock } from "lucide-react";

interface RecentUsersProps {
  dailyChats: Array<{ date: string; count: number }>;
}

export function RecentUsers({ dailyChats }: RecentUsersProps) {
  const recent = dailyChats.slice(-7).reverse();
  const maxCount = Math.max(...recent.map((d) => d.count), 1);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Daily Chat Activity</div>
        <Clock className="h-4 w-4 text-zinc-400" />
      </div>
      <div className="mt-4">
        {recent.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-400">No activity yet</div>
        ) : (
          <div className="flex items-end gap-2">
            {recent.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                <div className="text-xs text-zinc-500">{day.count}</div>
                <div
                  className="w-full rounded-md bg-zinc-900 dark:bg-zinc-100"
                  style={{
                    height: `${Math.max(4, (day.count / maxCount) * 60)}px`,
                    opacity: 0.3 + (day.count / maxCount) * 0.7,
                  }}
                />
                <div className="text-[10px] text-zinc-400">
                  {new Date(day.date).toLocaleDateString("en-IN", { weekday: "short" })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
