"use client";

import { useState, useEffect } from "react";
import { Network, Search, GitBranch, Share2, Layers } from "lucide-react";

interface KnowledgeGraphStats {
  totalNodes: number;
  totalEdges: number;
  nodeTypes: number;
  nodeTypeBreakdown?: Record<string, number>;
}

export default function KnowledgeGraphPage() {
  const [stats, setStats] = useState<KnowledgeGraphStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/v1/knowledge-graph/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats({ totalNodes: 0, totalEdges: 0, nodeTypes: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total Nodes",  value: stats?.totalNodes ?? 0, icon: GitBranch, color: "text-[#4a72c4]",  bg: "bg-[#162d58]/40" },
    { label: "Total Edges",  value: stats?.totalEdges ?? 0, icon: Share2,    color: "text-[#c9a84c]",  bg: "bg-[#c9a84c]/10" },
    { label: "Entity Types", value: stats?.nodeTypes  ?? 0, icon: Layers,    color: "text-emerald-400", bg: "bg-emerald-900/30" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Knowledge Graph</h1>
          <p className="mt-1 text-sm text-[#7aa0d8]">
            Visual map of legal entities, statutes, cases, and their relationships
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#0a1628]" />
            ))
          : cards.map((c) => (
              <div key={c.label} className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg}`}>
                    <c.icon className={`h-5 w-5 ${c.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-[#4a72c4]">{c.label}</p>
                    <p className="text-2xl font-bold text-white">{c.value.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a72c4]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search entities, statutes, cases..."
          className="w-full rounded-xl border border-[#162d58] bg-[#0a1628] py-3 pl-10 pr-4 text-sm text-white placeholder-[#2a4f96] focus:border-[#4a72c4] focus:outline-none"
        />
      </div>

      {/* Graph visualization area */}
      <div className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-[#162d58] to-[#0f2040] shadow-lg">
            <Network className="h-10 w-10 text-[#4a72c4]" />
          </div>
          <h3 className="text-lg font-semibold text-white">Knowledge Graph Visualization</h3>
          <p className="mt-2 max-w-md text-sm text-[#7aa0d8]">
            Upload legal documents and process them to automatically extract entities, statutes,
            and case relationships. The graph will appear here once data is available.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["STATUTE", "CASE", "COURT", "PARTY", "DOCTRINE", "SECTION"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-[#162d58] bg-[#0f2040] px-3 py-1 text-xs text-[#4a72c4]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Node type breakdown */}
      {stats?.nodeTypeBreakdown && Object.keys(stats.nodeTypeBreakdown).length > 0 && (
        <div className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-6">
          <h2 className="mb-4 text-sm font-semibold text-white">Entity Type Breakdown</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(stats.nodeTypeBreakdown).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between rounded-xl bg-[#0f2040] px-4 py-2.5">
                <span className="text-xs text-[#7aa0d8]">{type}</span>
                <span className="text-sm font-bold text-white">{String(count)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
