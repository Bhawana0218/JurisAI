"use client";

import { motion } from "framer-motion";
import { Brain, FileText, GitBranch, Globe, Lock, MessageSquare, Network, Workflow } from "lucide-react";

const features = [
  { icon: Brain, title: "AI Legal Agents", description: "Specialized AI agents for legal research, document review, case management, and compliance analysis." },
  { icon: MessageSquare, title: "Intelligent Chat", description: "Conversational AI with RAG-powered legal knowledge retrieval and multi-agent orchestration." },
  { icon: FileText, title: "Document Intelligence", description: "AI-powered document analysis, clause extraction, risk assessment, and automated summarization." },
  { icon: Workflow, title: "Workflow Automation", description: "Visual workflow builder with AI steps, conditions, human reviews, and API integrations." },
  { icon: Network, title: "Knowledge Graph", description: "Legal knowledge graph connecting statutes, cases, parties, and legal concepts with semantic search." },
  { icon: GitBranch, title: "Agent Marketplace", description: "Discover and install specialized AI agents built by the community and JurisAI team." },
  { icon: Globe, title: "Global Platform", description: "Multi-region, multi-language support with enterprise-grade infrastructure and global edge delivery." },
  { icon: Lock, title: "Enterprise Security", description: "SSO, RBAC, audit trails, encryption, governance rules, and SOC 2 compliance." },
];

export function Features() {
  return (
    <section className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Everything you need for modern legal practice
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            AI-powered tools that transform how legal professionals work, from research to document management.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-800"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
