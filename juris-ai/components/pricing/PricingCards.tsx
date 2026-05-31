"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    period: "/forever",
    description: "Perfect for trying out JurisAI",
    features: ["10,000 tokens/month", "20 agent calls/month", "Basic AI agents", "Document upload", "Community support"],
    cta: "Get Started",
    href: "/register",
    popular: false,
  },
  {
    id: "PRO",
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For individual legal professionals",
    features: ["100,000 tokens/month", "100 agent calls/month", "Advanced AI agents", "Workflow automation", "API access", "Analytics dashboard", "Priority support"],
    cta: "Start Free Trial",
    href: "/register?plan=pro",
    popular: true,
  },
  {
    id: "TEAM",
    name: "Team",
    price: "$99",
    period: "/month",
    description: "For law firms and legal teams",
    features: ["500,000 tokens/month", "500 agent calls/month", "All Pro features", "Team workspaces", "Advanced analytics", "Audit logs", "SSO integration", "Dedicated support"],
    cta: "Start Free Trial",
    href: "/register?plan=team",
    popular: false,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: ["Custom token limits", "Unlimited agents", "Custom AI agents", "On-premise deployment", "Custom SLA", "Dedicated infrastructure", "24/7 support", "Custom contracts"],
    cta: "Contact Sales",
    href: "/contact",
    popular: false,
  },
];

export function PricingCards() {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      <div className="mb-10 flex items-center justify-center gap-4">
        <span className={`text-sm ${!annual ? "text-gray-900 font-semibold" : "text-gray-500"}`}>Monthly</span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${annual ? "bg-indigo-600" : "bg-gray-300"}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${annual ? "translate-x-6" : "translate-x-1"}`} />
        </button>
        <span className={`text-sm ${annual ? "text-gray-900 font-semibold" : "text-gray-500"}`}>Annual</span>
        {annual && <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Save 20%</span>}
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className={`relative flex flex-col rounded-2xl border p-8 ${
              plan.popular
                ? "border-indigo-300 bg-indigo-50 shadow-xl shadow-indigo-100 dark:border-indigo-700 dark:bg-indigo-950 dark:shadow-indigo-900"
                : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">
                Most Popular
              </span>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">{annual ? `$${Math.round(parseInt(plan.price.replace("$", "")) * 0.8 * 12)}` : plan.price}</span>
              {plan.period && <span className="text-sm text-gray-500">{plan.period}</span>}
              {annual && plan.period && <span className="ml-2 text-sm text-gray-400">billed annually</span>}
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={`rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                plan.popular
                  ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-500"
                  : "border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:border-gray-600"
              }`}
            >
              {plan.cta}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
