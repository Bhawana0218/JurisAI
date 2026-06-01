"use client";

import { useState, useEffect } from "react";
import { Search, Bot, SlidersHorizontal } from "lucide-react";
import { AgentCard } from "@/components/marketplace/AgentCard";

interface Agent {
  id: string;
  name: string;
  shortDescription?: string;
  description: string;
  category: string;
  pricingModel: string;
  price: number;
  rating: number;
  totalInstalls: number;
  author?: { name?: string; image?: string };
  tags: string[];
}

const CATEGORIES = [
  "", "LEGAL_RESEARCH", "DOCUMENT_REVIEW", "CONTRACT_ANALYSIS",
  "COMPLIANCE", "LITIGATION", "CORPORATE", "CUSTOM",
];

const CATEGORY_LABELS: Record<string, string> = {
  "": "All Categories",
  LEGAL_RESEARCH: "Legal Research",
  DOCUMENT_REVIEW: "Document Review",
  CONTRACT_ANALYSIS: "Contract Analysis",
  COMPLIANCE: "Compliance",
  LITIGATION: "Litigation",
  CORPORATE: "Corporate",
  CUSTOM: "Custom",
};

export default function MarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Agent Marketplace</h1>
        <p className="mt-1 text-sm text-[#7aa0d8]">Discover and install AI agents for your legal workflows</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a72c4]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="w-full rounded-xl border border-[#162d58] bg-[#0a1628] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#4a72c4] outline-none transition focus:border-[#2a4f96]"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-xl border border-[#162d58] bg-[#0a1628] px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#2a4f96] sm:w-auto"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-[#162d58] bg-[#0a1628] p-6">
              <div className="mb-4 h-12 w-12 rounded-xl bg-[#0f2040]" />
              <div className="mb-2 h-5 w-3/4 rounded bg-[#0f2040]" />
              <div className="mb-4 h-4 w-full rounded bg-[#0f2040]" />
              <div className="flex gap-2">{Array.from({ length: 3 }).map((_, j) => <div key={j} className="h-5 w-16 rounded-full bg-[#0f2040]" />)}</div>
            </div>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#162d58] bg-[#0a1628] py-16 text-center">
          <Bot className="mb-4 h-12 w-12 text-[#2a4f96]" />
          <h3 className="text-lg font-semibold text-white">No agents found</h3>
          <p className="mt-1 text-sm text-[#7aa0d8]">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
        </div>
      )}
    </div>
  );
}
