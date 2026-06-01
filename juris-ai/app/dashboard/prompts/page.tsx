"use client";

import { useState, useEffect } from "react";
import { FlaskConical, Plus, GitFork, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface Variant {
  score?: number;
  runs?: number;
}

interface Experiment {
  id: string;
  name: string;
  status: string;
  description?: string;
  totalRuns?: number;
  variants?: Variant[];
  createdAt: string;
  winningVariant?: string;
}

export default function PromptsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/prompts/experiments").then(r => r.json()).then(setExperiments).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prompt Experiments</h1>
          <p className="mt-1 text-sm text-gray-500">A/B test prompts, optimize responses, track performance</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
          <Plus className="h-4 w-4" /> New Experiment
        </button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Active Experiments", value: experiments.filter(e => e.status === "RUNNING").length, icon: FlaskConical, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
          { label: "Variants Tested", value: experiments.reduce((a, e) => a + (e.variants?.length || 0), 0), icon: GitFork, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
          { label: "Avg Improvement", value: "—", icon: BarChart3, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950" },
        ].map((card, i) => (
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

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />)}</div>
      ) : experiments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 py-16 dark:border-gray-700">
          <FlaskConical className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No experiments yet</h3>
          <p className="mt-1 text-sm text-gray-500">Create your first A/B test to optimize prompt performance</p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiments.map((exp, i) => (
            <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{exp.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      exp.status === "RUNNING" ? "bg-green-100 text-green-700" : exp.status === "COMPLETED" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                    }`}>{exp.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{exp.description || "No description"}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                    <span>{exp.variants?.length || 0} variants</span>
                    <span>{exp.totalRuns || 0} runs</span>
                    <span>Created {new Date(exp.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{exp.winningVariant || "—"}</p>
                  <p className="text-xs text-gray-400">winner</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {exp.variants?.map((v: Variant, vi: number) => (
                  <div key={vi}
                    className="flex-1 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center dark:border-gray-800 dark:bg-gray-800">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Variant {vi + 1}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{v.score ? `${(v.score * 100).toFixed(0)}%` : "—"}</p>
                    <p className="text-xs text-gray-400">{v.runs || 0} runs</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
