"use client";

import { useState, useEffect } from "react";
import { Webhook, Plus, Play, Pause, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface WebhookEntry {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ url: "", events: ["AGENT_COMPLETED"] as string[] });

  const allEvents = ["AGENT_COMPLETED", "AGENT_FAILED", "WORKFLOW_COMPLETED", "WORKFLOW_FAILED", "API_KEY_CREATED", "API_KEY_REVOKED", "USER_JOINED", "USER_LEFT"];

  const loadWebhooks = () =>
    fetch("/api/v1/webhooks")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error ?? `Error ${r.status}`);
        return data;
      })
      .then((data) => setWebhooks(Array.isArray(data) ? data : []))
      .catch((err) => { console.error("[Webhooks]", err); setWebhooks([]); })
      .finally(() => setLoading(false));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadWebhooks(); }, []);

  const createWebhook = async () => {
    const res = await fetch("/api/v1/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setShowCreate(false); setForm({ url: "", events: ["AGENT_COMPLETED"] }); loadWebhooks(); }
  };

  const toggleWebhook = async (id: string, active: boolean) => {
    await fetch(`/api/v1/webhooks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: active }),
    });
    loadWebhooks();
  };

  const deleteWebhook = async (id: string) => {
    await fetch(`/api/v1/webhooks/${id}`, { method: "DELETE" });
    loadWebhooks();
  };

  const toggleEvent = (event: string) => {
    setForm(prev => ({
      ...prev,
      events: prev.events.includes(event) ? prev.events.filter(e => e !== event) : [...prev.events, event],
    }));
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Webhooks</h1>
          <p className="mt-1 text-sm text-gray-500">Send real-time events to your endpoints</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
          <Plus className="h-4 w-4" /> Create Webhook
        </button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-white">New Webhook</h3>
          <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://your-app.com/webhook" className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Subscribe to events</p>
            <div className="flex flex-wrap gap-2">
              {allEvents.map(e => (
                <button key={e} onClick={() => toggleEvent(e)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${form.events.includes(e) ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" : "border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400"}`}>{e}</button>
              ))}
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={createWebhook} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Create</button>
            <button onClick={() => setShowCreate(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">Cancel</button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />)}</div>
      ) : webhooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 py-16 dark:border-gray-700">
          <Webhook className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No webhooks yet</h3>
          <p className="mt-1 text-sm text-gray-500">Create webhooks to receive real-time event notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh, i) => (
            <motion.div key={wh.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <Webhook className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{wh.url}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {wh.events?.map((e: string) => <span key={e} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">{e}</span>)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleWebhook(wh.id, !wh.isActive)} className={`rounded-lg p-2 ${wh.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}>
                  {wh.isActive ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </button>
                <button onClick={() => deleteWebhook(wh.id)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
