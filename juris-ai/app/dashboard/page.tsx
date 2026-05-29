"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";

import { AnalyticsCards } from "@/components/dashboard/AnalyticsCards";
import { UserGrowthChart } from "@/components/dashboard/UserGrowthChart";
import { TopicCharts } from "@/components/dashboard/TopicCharts";
import { RecentUsers } from "@/components/dashboard/RecentUsers";

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

export default function DashboardPage() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Platform overview and analytics
            </p>
          </div>
          <Link
            href="/dashboard/chat"
            className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            <MessageSquare className="h-4 w-4" />
            Open Chat
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        ) : data ? (
          <div className="mt-8 space-y-6">
            <AnalyticsCards
              totalUsers={data.totalUsers}
              totalChats={data.totalChats}
              totalDocuments={data.totalDocuments}
              totalCases={data.totalCases}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <UserGrowthChart
                recentUsers={data.recentUsers}
                tokensUsedLast30Days={data.tokensUsedLast30Days}
              />
              <RecentUsers dailyChats={data.dailyChats} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <TopicCharts
                agentDistribution={data.agentDistribution}
                dailyChats={data.dailyChats}
              />
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Quick Actions
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { label: "Upload a legal document", href: "#" },
                    { label: "Create a new case", href: "#" },
                    { label: "View all conversations", href: "/dashboard/chat" },
                  ].map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      {action.label}
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-zinc-500 dark:text-zinc-400">Unable to load analytics. Check database connection.</p>
          </div>
        )}
      </div>
    </div>
  );
}
