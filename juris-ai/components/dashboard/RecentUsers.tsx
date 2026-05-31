"use client";

import { Activity } from "lucide-react";

interface RecentUsersProps {
  dailyChats: Array<{ date: string; count: number }>;
}

export function RecentUsers({ dailyChats }: RecentUsersProps) {
  const recent = dailyChats.slice(-7).reverse();
  const maxCount = Math.max(...recent.map((d) => d.count), 1);

  return (
    <div className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#2a4f96] to-[#162d58]">
            <Activity className="h-3.5 w-3.5 text-[#c9a84c]" />
          </div>
          <div className="text-sm font-semibold text-white">Daily Chat Activity</div>
        </div>
        <span className="rounded-full border border-[#162d58] bg-[#050d1a] px-2.5 py-0.5 text-[10px] text-[#7aa0d8]">
          Last 7 days
        </span>
      </div>

      <div className="mt-5">
        {recent.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#4a72c4]">No activity yet</div>
        ) : (
          <div className="flex items-end gap-2">
            {recent.map((day) => {
              const heightPct = Math.max(8, (day.count / maxCount) * 100);
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="text-[10px] font-medium text-[#7aa0d8]">{day.count}</div>
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-[#2a4f96] to-[#4a72c4]"
                    style={{ height: `${heightPct * 0.6}px` }}
                  />
                  <div className="text-[10px] text-[#4a72c4]">
                    {new Date(day.date).toLocaleDateString("en-IN", { weekday: "short" })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
