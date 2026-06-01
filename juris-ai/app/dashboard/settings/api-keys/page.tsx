"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", scopes: ["READ"] as string[] });

  const scopes = ["READ", "WRITE", "ADMIN", "AGENT_EXECUTE", "WORKFLOW_EXECUTE"];

  const loadKeys = () => fetch("/api/v1/api-keys").then(r => r.json()).then(data => setKeys(Array.isArray(data) ? data : [])).finally(() => setLoading(false));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadKeys(); }, []);

  const createKey = async () => {
    const res = await fetch("/api/v1/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setShowNewKey(data.fullKey);
      setShowCreate(false);
      setForm({ name: "", scopes: ["READ"] });
      loadKeys();
    }
  };

  const revokeKey = async (id: string) => {
    await fetch(`/api/v1/api-keys/${id}/revoke`, { method: "POST" });
    loadKeys();
  };

  const toggleScope = (scope: string) => {
    setForm(prev => ({
      ...prev,
      scopes: prev.scopes.includes(scope) ? prev.scopes.filter(s => s !== scope) : [...prev.scopes, scope],
    }));
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys</h1>
          <p className="mt-1 text-sm text-gray-500">Manage API keys for programmatic access</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
          <Plus className="h-4 w-4" /> Create Key
        </button>
      </div>

      {showNewKey && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
          <p className="font-medium text-green-800 dark:text-green-200">API Key Created</p>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">Copy this key now. You won't be able to see it again.</p>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-mono dark:bg-gray-900">{showNewKey}</code>
            <button onClick={() => { navigator.clipboard.writeText(showNewKey); }} className="rounded-lg bg-white p-2 text-gray-600 hover:bg-gray-50 dark:bg-gray-900">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <button onClick={() => setShowNewKey(null)} className="mt-2 text-sm text-green-600 hover:text-green-500">Dismiss</button>
        </motion.div>
      )}

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-white">New API Key</h3>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Key name" className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Scopes</p>
            <div className="flex flex-wrap gap-2">
              {scopes.map(s => (
                <button key={s} onClick={() => toggleScope(s)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${form.scopes.includes(s) ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" : "border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400"}`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={createKey} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Create</button>
            <button onClick={() => setShowCreate(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">Cancel</button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />)}</div>
      ) : keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 py-16 dark:border-gray-700">
          <Key className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No API keys yet</h3>
          <p className="mt-1 text-sm text-gray-500">Create your first key to start building with JurisAI APIs</p>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key, i) => (
            <motion.div key={key.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{key.name}</p>
                  <p className="text-xs text-gray-400">{key.keyPrefix}... | Created {new Date(key.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">{key.scopes?.join(", ")}</span>
                {!key.isRevoked && (
                  <button onClick={() => revokeKey(key.id)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" title="Revoke">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
