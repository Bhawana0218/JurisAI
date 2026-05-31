"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Puzzle, Search, ArrowUpRight, CheckCircle } from "lucide-react";

const integrations = [
  { id: "slack", name: "Slack", description: "Receive JurisAI responses in Slack channels", category: "Communication", connected: false, color: "bg-purple-100 text-purple-700" },
  { id: "discord", name: "Discord", description: "AI-powered legal assistant in your Discord server", category: "Communication", connected: false, color: "bg-indigo-100 text-indigo-700" },
  { id: "notion", name: "Notion", description: "Sync legal documents with Notion databases", category: "Productivity", connected: false, color: "bg-white text-gray-800 border border-gray-200" },
  { id: "salesforce", name: "Salesforce", description: "Connect CRM data with AI legal workflows", category: "CRM", connected: false, color: "bg-blue-100 text-blue-800" },
  { id: "clio", name: "Clio", description: "Two-way sync with Clio legal practice management", category: "Legal", connected: false, color: "bg-green-100 text-green-700" },
  { id: "pclaw", name: "PCLaw", description: "Integrate billing and case data from PCLaw", category: "Legal", connected: false, color: "bg-amber-100 text-amber-700" },
  { id: "sharepoint", name: "SharePoint", description: "Access and analyze documents from SharePoint", category: "Storage", connected: false, color: "bg-teal-100 text-teal-700" },
  { id: "google_drive", name: "Google Drive", description: "Index and search legal documents in Drive", category: "Storage", connected: false, color: "bg-yellow-100 text-yellow-700" },
  { id: "jira", name: "Jira", description: "Create tickets from AI-identified legal issues", category: "Productivity", connected: false, color: "bg-blue-100 text-blue-800" },
];

export default function IntegrationsPage() {
  const [search, setSearch] = useState("");

  const filtered = integrations.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.description.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Integrations</h1>
          <p className="mt-1 text-sm text-gray-500">Connect JurisAI with your favorite tools</p>
        </div>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search integrations..." className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((int, i) => (
          <motion.div key={int.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="group relative rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${int.color}`}>
                {int.name.slice(0, 2).toUpperCase()}
              </div>
              {int.connected && <CheckCircle className="h-5 w-5 text-green-500" />}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{int.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{int.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">{int.category}</span>
              <button className={`flex items-center gap-1 text-sm font-medium ${int.connected ? "text-gray-400" : "text-indigo-600 hover:text-indigo-500"}`}>
                {int.connected ? "Connected" : "Connect"} <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
