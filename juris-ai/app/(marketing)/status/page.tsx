"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const services = [
  { name: "API", status: "operational", uptime: "99.99%" },
  { name: "Dashboard", status: "operational", uptime: "99.97%" },
  { name: "Agent Execution", status: "operational", uptime: "99.95%" },
  { name: "Workflow Engine", status: "operational", uptime: "99.93%" },
  { name: "Knowledge Graph", status: "degraded", uptime: "99.50%" },
  { name: "Webhooks", status: "operational", uptime: "99.99%" },
];

export default function StatusPage() {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          All Systems Normal
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">System Status</h1>
        <p className="mt-2 text-gray-500">Current operational status of JurisAI services</p>
      </div>

      <div className="space-y-3">
        {services.map((s, i) => (
          <motion.div key={s.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full ${s.status === "operational" ? "bg-green-500" : s.status === "degraded" ? "bg-yellow-500" : "bg-red-500"}`} />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{s.name}</p>
                <p className="text-xs text-gray-400">{s.status === "operational" ? "Operational" : "Degraded Performance"}</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">{s.uptime} uptime</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <button onClick={() => setShowHistory(!showHistory)} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          {showHistory ? "Hide" : "Show"} incident history
        </button>
        {showHistory && (
          <div className="mt-4 space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-lg border border-gray-100 bg-white p-3 text-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="font-medium text-gray-900 dark:text-white">{["API latency spike", "Knowledge graph indexing delay", "Scheduled maintenance"][i]}</p>
                <p className="text-xs text-gray-400">{["Resolved", "Resolved", "Completed"][i]} — {["May 15, 2026", "May 10, 2026", "May 5, 2026"][i]}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
