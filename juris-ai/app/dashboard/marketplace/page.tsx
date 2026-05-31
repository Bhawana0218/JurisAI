"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Grid3X3, List } from "lucide-react";
import { AgentCard } from "@/components/marketplace/AgentCard";

export default function MarketplacePage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category) params.set("category", category);
    fetch(`/api/v1/marketplace/agents?${params}`)
      .then((r) => r.json())
      .then((data) => setAgents(data.agents || []))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Marketplace</h1>
        <p className="mt-1 text-sm text-gray-500">Discover and install AI agents for your legal workflows</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Categories</option>
          <option value="LEGAL_RESEARCH">Legal Research</option>
          <option value="DOCUMENT_REVIEW">Document Review</option>
          <option value="CONTRACT_ANALYSIS">Contract Analysis</option>
          <option value="COMPLIANCE">Compliance</option>
          <option value="LITIGATION">Litigation</option>
          <option value="CORPORATE">Corporate</option>
          <option value="CUSTOM">Custom</option>
        </select>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-800" />
              <div className="mb-2 h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="mb-4 h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
              <div className="flex gap-2">{Array.from({ length: 3 }).map((_, j) => <div key={j} className="h-5 w-16 rounded-full bg-gray-100 dark:bg-gray-800" />)}</div>
            </div>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 text-4xl">🤖</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No agents found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
        </div>
      )}
    </div>
  );
}
