"use client";

import { useState, useEffect } from "react";
import { Gavel, ShieldCheck, ShieldAlert, ShieldX, Plus } from "lucide-react";

interface GovernanceRule {
  id: string;
  name: string;
  ruleType: string;
  priority: number;
  action: string;
  enabled: boolean;
}

const ACTION_STYLES: Record<string, string> = {
  ALLOW:    "bg-emerald-900/40 text-emerald-400",
  BLOCK:    "bg-red-900/40 text-red-400",
  FLAG:     "bg-amber-900/40 text-amber-400",
  ESCALATE: "bg-orange-900/40 text-orange-400",
  REVIEW:   "bg-sky-900/40 text-sky-400",
  MASK:     "bg-violet-900/40 text-violet-400",
  REDACT:   "bg-pink-900/40 text-pink-400",
};

export default function GovernancePage() {
  const [rules, setRules] = useState<GovernanceRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/governance")
      .then((r) => r.json())
      .then((d) => setRules(Array.isArray(d) ? d : []))
      .catch(() => setRules([]))
      .finally(() => setLoading(false));
  }, []);

  const active = rules.filter((r) => r.enabled).length;
  const blocked = rules.filter((r) => r.action === "BLOCK").length;
  const flagged = rules.filter((r) => r.action === "FLAG").length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Governance</h1>
          <p className="mt-1 text-sm text-[#7aa0d8]">Define rules to control, filter, and audit AI responses</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-[#2a4f96] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e3a70]">
          <Plus className="h-4 w-4" /> New Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Active Rules",      value: active,  icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-900/30" },
          { label: "Block Rules",       value: blocked, icon: ShieldX,     color: "text-red-400",     bg: "bg-red-900/30" },
          { label: "Flag Rules",        value: flagged, icon: ShieldAlert,  color: "text-amber-400",   bg: "bg-amber-900/30" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-5">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg}`}>
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <div>
                <p className="text-xs text-[#4a72c4]">{c.label}</p>
                <p className="text-2xl font-bold text-white">{c.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-[#0a1628]" />)}</div>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#162d58] py-16 text-center">
          <Gavel className="mb-4 h-12 w-12 text-[#2a4f96]" />
          <h3 className="text-lg font-semibold text-white">No governance rules yet</h3>
          <p className="mt-1 text-sm text-[#4a72c4]">Create rules to control AI behavior and ensure compliance</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between rounded-2xl border border-[#162d58] bg-[#0a1628] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f2040]">
                  <Gavel className="h-4 w-4 text-[#4a72c4]" />
                </div>
                <div>
                  <p className="font-medium text-white">{rule.name}</p>
                  <p className="text-xs text-[#4a72c4]">{rule.ruleType} · Priority {rule.priority}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ACTION_STYLES[rule.action] ?? "bg-[#162d58] text-[#7aa0d8]"}`}>
                  {rule.action}
                </span>
                <span className={`h-2 w-2 rounded-full ${rule.enabled ? "bg-emerald-400" : "bg-[#2a4f96]"}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
