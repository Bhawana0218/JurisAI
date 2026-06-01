"use client";

import { CreditCard, CheckCircle } from "lucide-react";

const plans = [
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For individual lawyers and solo practitioners",
    features: ["500K tokens/month", "100 agent executions", "5 GB document storage", "Priority support", "API access"],
    color: "border-[#162d58]",
    badge: null,
    cta: "Upgrade to Pro",
    ctaStyle: "bg-[#2a4f96] hover:bg-[#1e3a70] text-white",
  },
  {
    name: "Team",
    price: "$99",
    period: "/month",
    description: "For small law firms and legal teams",
    features: ["2M tokens/month", "500 agent executions", "25 GB document storage", "Team collaboration", "Webhooks & SSO", "Dedicated support"],
    color: "border-[#c9a84c]",
    badge: "Most Popular",
    cta: "Upgrade to Team",
    ctaStyle: "bg-[#c9a84c] hover:bg-[#e8c97a] text-[#050d1a]",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large firms and enterprise legal departments",
    features: ["Unlimited tokens", "Unlimited executions", "Unlimited storage", "Custom AI models", "On-premise option", "SLA guarantee", "Dedicated CSM"],
    color: "border-[#162d58]",
    badge: null,
    cta: "Contact Sales",
    ctaStyle: "bg-[#0f2040] hover:bg-[#162d58] text-white border border-[#162d58]",
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing & Usage</h1>
        <p className="mt-1 text-sm text-[#7aa0d8]">Manage your subscription and monitor usage</p>
      </div>

      {/* Current plan */}
      <div className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#162d58]/40">
              <CreditCard className="h-5 w-5 text-[#4a72c4]" />
            </div>
            <div>
              <p className="text-xs text-[#4a72c4]">Current Plan</p>
              <p className="text-lg font-bold text-white">Free</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-900/40 px-3 py-1 text-xs font-medium text-emerald-400">Active</span>
        </div>

        {/* Usage meters */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Tokens Used",       used: 0,  max: 50000,  unit: "tokens" },
            { label: "Agent Executions",  used: 0,  max: 100,    unit: "calls" },
            { label: "API Calls",         used: 0,  max: 1000,   unit: "calls" },
          ].map((m) => {
            const pct = Math.min(100, Math.round((m.used / m.max) * 100));
            return (
              <div key={m.label} className="rounded-xl bg-[#0f2040] p-4">
                <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-[#7aa0d8]">{m.label}</p>
                  <p className="text-xs text-[#4a72c4]">{m.used.toLocaleString()} / {m.max.toLocaleString()}</p>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#162d58]">
                  <div
                    className={`h-1.5 rounded-full transition-all ${pct > 80 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-[#4a72c4]"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-[#2a4f96]">{pct}% used</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade plans */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-white">Upgrade Your Plan</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border-2 bg-[#0a1628] p-6 ${plan.color}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[#c9a84c] px-3 py-1 text-xs font-bold text-[#050d1a]">
                    {plan.badge}
                  </span>
                </div>
              )}
              <div className="mb-4">
                <p className="text-sm font-semibold text-[#7aa0d8]">{plan.name}</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-sm text-[#4a72c4]">{plan.period}</span>}
                </div>
                <p className="mt-1 text-xs text-[#4a72c4]">{plan.description}</p>
              </div>
              <ul className="mb-6 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-[#7aa0d8]">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ${plan.ctaStyle}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
