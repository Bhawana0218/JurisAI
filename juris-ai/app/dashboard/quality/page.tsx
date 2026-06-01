"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

interface Evaluation {
  id: string;
  overallScore: number;
  createdAt: string;
  passedGate: boolean;
}

interface QualityStats {
  avgScore?: number;
  hallucinationRate?: number;
  citationAccuracy?: number;
  evaluationsToday?: number;
}

export default function QualityPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [stats, setStats] = useState<QualityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/analytics/quality?range=${timeRange}`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/v1/analytics/evaluations?range=${timeRange}`).then(r => r.json()).catch(() => []),
    ]).then(([s, e]) => {
      setStats(s);
      setEvaluations(e);
    }).finally(() => setLoading(false));
  }, [timeRange]);

  const cards = [
    { label: "Overall Quality", value: stats?.avgScore ? `${(stats.avgScore * 100).toFixed(0)}%` : "—", icon: Shield, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950" },
    { label: "Hallucination Rate", value: stats?.hallucinationRate ? `${(stats.hallucinationRate * 100).toFixed(1)}%` : "—", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950" },
    { label: "Citation Accuracy", value: stats?.citationAccuracy ? `${(stats.citationAccuracy * 100).toFixed(0)}%` : "—", icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
    { label: "Evaluations Today", value: stats?.evaluationsToday ?? "—", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950" },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quality Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Monitor AI response quality, accuracy, and safety metrics</p>
        </div>
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Quality Score Trend</h3>
        <div className="h-48 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
          <p className="text-sm text-gray-400">Chart: Quality scores over time (requires chart library)</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Recent Evaluations</h3>
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />)}</div>
        ) : evaluations.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            <Shield className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            No evaluations yet. Start chatting to generate quality metrics.
          </div>
        ) : (
          <div className="space-y-3">
            {evaluations.map((ev: Evaluation, i) => (
              <motion.div key={ev.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  {ev.overallScore > 0.8 ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Quality: {(ev.overallScore * 100).toFixed(0)}%</p>
                    <p className="text-xs text-gray-400">{new Date(ev.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ev.passedGate ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {ev.passedGate ? "Passed" : "Flagged"}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
