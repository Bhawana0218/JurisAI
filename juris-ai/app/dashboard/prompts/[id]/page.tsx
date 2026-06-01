"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Play, GitBranch, BarChart3 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Variant {
  score?: number;
  content?: string;
  runs?: number;
  avgLatency?: number;
  avgTokens?: number;
}

interface Experiment {
  id: string;
  name: string;
  status: string;
  description?: string;
  totalRuns?: number;
  variants?: Variant[];
  avgScore?: number;
  confidence?: number;
}

export default function ExperimentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [exp, setExp] = useState<Experiment | null>(null);

  useEffect(() => {
    fetch(`/api/v1/prompts/experiments/${id}`).then(r => r.json()).then(setExp);
  }, [id]);

  if (!exp) return <div className="h-96 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />;

  return (
    <div>
      <Link href="/dashboard/prompts" className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Experiments
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{exp.name}</h1>
            <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${
              exp.status === "RUNNING" ? "bg-green-100 text-green-700" : exp.status === "COMPLETED" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
            }`}>{exp.status}</span>
          </div>
          <p className="mt-1 text-gray-500">{exp.description}</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
          <Play className="h-4 w-4" /> Run Experiment
        </button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Runs", value: exp.totalRuns || 0, icon: Play },
          { label: "Variants", value: exp.variants?.length || 0, icon: GitBranch },
          { label: "Avg Score", value: exp.avgScore ? `${(exp.avgScore * 100).toFixed(0)}%` : "—", icon: BarChart3 },
          { label: "Confidence", value: exp.confidence ? `${(exp.confidence * 100).toFixed(0)}%` : "—", icon: BarChart3 },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <s.icon className="h-4 w-4 text-gray-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Variants</h3>
        <div className="space-y-4">
          {exp.variants?.map((v: Variant, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 dark:text-white">Variant {i + 1}</p>
                <span className="text-sm font-bold text-indigo-600">{v.score ? `${(v.score * 100).toFixed(0)}%` : "—"}</span>
              </div>
              <pre className="mt-2 overflow-x-auto rounded bg-white p-3 text-xs dark:bg-gray-950">{v.content?.substring(0, 500)}</pre>
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                <span>{v.runs || 0} runs</span>
                <span>{v.avgLatency ? `${v.avgLatency}ms` : "—"} avg latency</span>
                <span>{v.avgTokens ? `${v.avgTokens} tokens` : "—"} avg tokens</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
