"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-32 pt-24 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08),transparent_70%)]" />
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-6 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              AI-Powered Legal Intelligence Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-7xl"
          >
            The{" "}
            <span className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI-Native
            </span>{" "}
            Legal Platform
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 text-lg leading-8 text-gray-600 dark:text-gray-300"
          >
            JurisAI combines AI agents, legal intelligence, document analysis, and team collaboration into one unified platform.
            Empower your practice with autonomous AI workflows and enterprise-grade security.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-200 dark:shadow-indigo-900"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600"
            >
              Talk to Sales
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400"
          >
            <span className="flex items-center gap-2"><span className="text-green-500">✓</span> No credit card</span>
            <span className="flex items-center gap-2"><span className="text-green-500">✓</span> 14-day free trial</span>
            <span className="flex items-center gap-2"><span className="text-green-500">✓</span> Cancel anytime</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 rounded-2xl border border-gray-200 bg-white/50 p-2 shadow-2xl backdrop-blur dark:border-gray-800 dark:bg-gray-900/50"
        >
          <div className="aspect-[16/9] rounded-xl bg-linear-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">⚖️</div>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">JurisAI Platform Dashboard</p>
              <p className="text-sm">AI Agents • Document Intelligence • Workflows • Analytics</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
