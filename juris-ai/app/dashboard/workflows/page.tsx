"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Play, Pause, Workflow, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/workflows")
      .then((r) => r.json())
      .then(setWorkflows)
      .finally(() => setLoading(false));
  }, []);

  const handleExecute = async (id: string) => {
    await fetch(`/api/v1/workflows/${id}/execute`, { method: "POST" });
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    PAUSED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
    FAILED: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workflows</h1>
          <p className="mt-1 text-sm text-gray-500">Automate legal processes with AI-powered workflows</p>
        </div>
        <Link
          href="/dashboard/workflows/builder"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" /> New Workflow
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-2 h-5 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-2/3 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      ) : workflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 py-16 dark:border-gray-700">
          <Workflow className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No workflows yet</h3>
          <p className="mt-1 text-sm text-gray-500">Create your first automated workflow</p>
          <Link
            href="/dashboard/workflows/builder"
            className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" /> Create Workflow
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {workflows.map((wf, i) => (
            <motion.div
              key={wf.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-indigo-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <Workflow className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <Link href={`/dashboard/workflows/${wf.id}`} className="font-semibold text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400">
                        {wf.name}
                      </Link>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[wf.status] || "bg-gray-100 text-gray-700"}`}>{wf.status}</span>
                    </div>
                    {wf.description && <p className="mt-1 text-sm text-gray-500">{wf.description}</p>}
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                      <span>{wf._count?.steps || 0} steps</span>
                      <span>{wf._count?.executions || 0} executions</span>
                      <span>v{wf.version}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => handleExecute(wf.id)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-800" title="Execute">
                    <Play className="h-4 w-4" />
                  </button>
                  <Link href={`/dashboard/workflows/${wf.id}`} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800">
                    <MoreHorizontal className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
