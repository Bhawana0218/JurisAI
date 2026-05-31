"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bot, Star, Download, DollarSign } from "lucide-react";

type AgentCardProps = {
  agent: {
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
  };
};

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Link href={`/dashboard/marketplace/${agent.id}`} className="group block">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-800">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Bot className="h-6 w-6" />
          </div>

          <h3 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">{agent.shortDescription || agent.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {agent.tags?.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-400" />{agent.rating.toFixed(1)}</span>
              <span className="flex items-center gap-1"><Download className="h-3.5 w-3.5" />{agent.totalInstalls}</span>
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {agent.pricingModel === "FREE" ? "Free" : agent.pricingModel === "ONE_TIME" ? `$${agent.price}` : agent.pricingModel === "PER_EXECUTION" ? `$${agent.price}/use` : agent.pricingModel}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
