"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, MessageSquare, TrendingUp } from "lucide-react";

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
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-[#7aa0d8]">Platform overview and analytics</p>
        </div>
        <Link
          href="/dashboard/chat"
          className="group flex items-center gap-2 rounded-xl bg-linear-to-r from-[#2a4f96] to-[#1e3a70] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#2a4f96]/20 transition hover:from-[#4a72c4] hover:to-[#2a4f96]"
        >
          <MessageSquare className="h-4 w-4" />
          Open Chat
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-[#162d58] bg-[#0a1628]"
            />
          ))}
        </div>
      ) : data ? (
        <div className="space-y-6">
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

            {/* Quick actions */}
            <div className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#c9a84c]" />
                <div className="text-sm font-semibold text-white">Quick Actions</div>
              </div>
              <div className="mt-4 space-y-2.5">
                {[
                  { label: "Upload a legal document", href: "#" },
                  { label: "Create a new case", href: "#" },
                  { label: "View all conversations", href: "/dashboard/chat" },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center justify-between rounded-xl border border-[#162d58] bg-[#050d1a] px-4 py-3 text-sm text-[#7aa0d8] transition hover:border-[#2a4f96] hover:bg-[#0f2040] hover:text-white"
                  >
                    {action.label}
                    <ArrowRight className="h-3.5 w-3.5 text-[#4a72c4]" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-10 text-center">
          <p className="text-[#7aa0d8]">Unable to load analytics. Check database connection.</p>
        </div>
      )}
    </div>
  );
}
