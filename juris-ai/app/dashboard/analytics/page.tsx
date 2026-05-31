"use client";

import { useState, useEffect } from "react";
import { MessageSquare, FileText, Briefcase, Users, TrendingUp, Bot, BarChart3 } from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalChats: number;
  totalDocuments: number;
  totalCases: number;
  recentUsers: number;
  dailyChats: Array<{ date: string; count: number }>;
  agentDistribution: Array<{ agent: string; count: number }>;
  tokensUsedLast30Days: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body?.error ?? `Request failed with status ${r.status}`);
        }
        return r.json();
      })
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Users",     value: data?.totalUsers     ?? 0, icon: Users,        color: "text-[#4a72c4]", bg: "bg-[#162d58]/40" },
    { label: "Total Chats",     value: data?.totalChats     ?? 0, icon: MessageSquare, color: "text-emerald-400", bg: "bg-emerald-900/30" },
    { label: "Documents",       value: data?.totalDocuments ?? 0, icon: FileText,      color: "text-[#c9a84c]",  bg: "bg-[#c9a84c]/10" },
    { label: "Legal Cases",     value: data?.totalCases     ?? 0, icon: Briefcase,     color: "text-violet-400", bg: "bg-violet-900/30" },
    { label: "New Users (30d)", value: data?.recentUsers    ?? 0, icon: TrendingUp,    color: "text-sky-400",    bg: "bg-sky-900/30" },
    { label: "Tokens Used",     value: data?.tokensUsedLast30Days ? `${(data.tokensUsedLast30Days / 1000).toFixed(1)}k` : "0", icon: BarChart3, color: "text-pink-400", bg: "bg-pink-900/30" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="mt-1 text-sm text-[#7aa0d8]">Platform usage metrics and insights</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
          Unable to load analytics: {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#0a1628]" />
            ))
          : stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-[#4a72c4]">{s.label}</p>
                    <p className="text-2xl font-bold text-white">{s.value.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Agent distribution */}
      <div className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-6">
        <h2 className="mb-4 text-sm font-semibold text-white">Agent Distribution</h2>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-[#0f2040]" />
            ))}
          </div>
        ) : !data?.agentDistribution?.length ? (
          <div className="flex items-center justify-center py-10">
            <div className="text-center">
              <Bot className="mx-auto mb-2 h-8 w-8 text-[#2a4f96]" />
              <p className="text-sm text-[#4a72c4]">No agent data yet. Start chatting to see distribution.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {data.agentDistribution.map((a) => {
              const total = data.agentDistribution.reduce((s, x) => s + x.count, 0);
              const pct = total > 0 ? Math.round((a.count / total) * 100) : 0;
              return (
                <div key={a.agent} className="flex items-center gap-3">
                  <div className="w-32 shrink-0 text-xs text-[#7aa0d8]">{a.agent}</div>
                  <div className="flex-1 rounded-full bg-[#0f2040] h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#2a4f96] to-[#4a72c4]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-xs text-[#4a72c4]">{a.count}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Daily chats */}
      <div className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-6">
        <h2 className="mb-4 text-sm font-semibold text-white">Daily Chat Activity (Last 30 days)</h2>
        {loading ? (
          <div className="h-32 animate-pulse rounded-xl bg-[#0f2040]" />
        ) : !data?.dailyChats?.length ? (
          <div className="flex h-32 items-center justify-center rounded-xl bg-[#0f2040]">
            <p className="text-sm text-[#4a72c4]">No chat activity yet</p>
          </div>
        ) : (
          <div className="flex h-32 items-end gap-1">
            {data.dailyChats.slice(-30).map((d) => {
              const max = Math.max(...data.dailyChats.map((x) => x.count), 1);
              const h = Math.max(4, Math.round((d.count / max) * 100));
              return (
                <div key={d.date} className="group relative flex-1" title={`${d.date}: ${d.count}`}>
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-[#2a4f96] to-[#4a72c4] transition-all group-hover:from-[#c9a84c] group-hover:to-[#e8c97a]"
                    style={{ height: `${h}%` }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
