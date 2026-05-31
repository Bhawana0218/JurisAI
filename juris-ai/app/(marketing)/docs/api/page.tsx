import { Terminal, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

const endpoints = [
  { method: "POST", path: "/v1/agents", description: "Execute an AI agent" },
  { method: "GET", path: "/v1/agents/:id", description: "Get agent details" },
  { method: "POST", path: "/v1/workflows", description: "Create a workflow" },
  { method: "GET", path: "/v1/workflows/:id", description: "Get workflow status" },
  { method: "POST", path: "/v1/marketplace/install", description: "Install an agent from marketplace" },
  { method: "GET", path: "/v1/knowledge-graph", description: "Query knowledge graph" },
  { method: "POST", path: "/v1/api-keys", description: "Create API key" },
  { method: "GET", path: "/v1/analytics/overview", description: "Get usage analytics" },
  { method: "POST", path: "/v1/webhooks", description: "Create webhook" },
  { method: "GET", path: "/v1/audit/logs", description: "Get audit logs" },
];

export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <Link href="/docs" className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Documentation
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Reference</h1>
      <p className="mt-2 text-gray-500">RESTful API for integrating JurisAI into your applications</p>
      <p className="mt-1 text-sm text-gray-400">Base URL: <code className="text-indigo-600">https://api.jurisai.io</code></p>

      <div className="mt-12 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr><th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Method</th><th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Endpoint</th><th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Description</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
            {endpoints.map((ep) => (
              <tr key={ep.path} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-mono font-bold ${ep.method === "GET" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{ep.method}</span></td>
                <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">{ep.path}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{ep.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
