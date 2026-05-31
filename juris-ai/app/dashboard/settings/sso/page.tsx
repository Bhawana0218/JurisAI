"use client";

import { useState, useEffect } from "react";
import { Shield, Plus, CheckCircle, Trash2 } from "lucide-react";

export default function SsoPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ provider: "OIDC", clientId: "", issuerUrl: "", domains: "" });

  useEffect(() => {
    fetch("/api/v1/sso")
      .then((r) => r.json())
      .then((d) => setConnections(Array.isArray(d) ? d : []))
      .catch(() => setConnections([]))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/v1/sso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, domains: form.domains.split(",").map((d) => d.trim()).filter(Boolean) }),
      });
      setShowForm(false);
      setForm({ provider: "OIDC", clientId: "", issuerUrl: "", domains: "" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Single Sign-On</h1>
          <p className="mt-1 text-sm text-[#7aa0d8]">Connect your identity provider for seamless team access</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-[#2a4f96] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e3a70]"
        >
          <Plus className="h-4 w-4" /> Add Provider
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-6">
          <h3 className="mb-4 font-semibold text-white">Configure SSO Provider</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7aa0d8]">Provider</label>
              <select
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                className="w-full rounded-xl border border-[#162d58] bg-[#0f2040] px-3 py-2.5 text-sm text-white focus:border-[#4a72c4] focus:outline-none"
              >
                <option value="OIDC">OIDC</option>
                <option value="SAML">SAML</option>
                <option value="GOOGLE">Google Workspace</option>
                <option value="MICROSOFT">Microsoft Entra</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7aa0d8]">Client ID</label>
              <input
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                placeholder="your-client-id"
                className="w-full rounded-xl border border-[#162d58] bg-[#0f2040] px-3 py-2.5 text-sm text-white placeholder-[#2a4f96] focus:border-[#4a72c4] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7aa0d8]">Issuer URL</label>
              <input
                value={form.issuerUrl}
                onChange={(e) => setForm({ ...form, issuerUrl: e.target.value })}
                placeholder="https://accounts.google.com"
                className="w-full rounded-xl border border-[#162d58] bg-[#0f2040] px-3 py-2.5 text-sm text-white placeholder-[#2a4f96] focus:border-[#4a72c4] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7aa0d8]">Allowed Domains (comma-separated)</label>
              <input
                value={form.domains}
                onChange={(e) => setForm({ ...form, domains: e.target.value })}
                placeholder="company.com, subsidiary.com"
                className="w-full rounded-xl border border-[#162d58] bg-[#0f2040] px-3 py-2.5 text-sm text-white placeholder-[#2a4f96] focus:border-[#4a72c4] focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={save} disabled={saving} className="rounded-xl bg-[#2a4f96] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e3a70] disabled:opacity-50">
              {saving ? "Saving…" : "Save Configuration"}
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-xl border border-[#162d58] px-5 py-2.5 text-sm text-[#7aa0d8] transition hover:bg-[#0f2040]">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-[#0a1628]" />)}</div>
      ) : connections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#162d58] py-16 text-center">
          <Shield className="mb-4 h-12 w-12 text-[#2a4f96]" />
          <h3 className="text-lg font-semibold text-white">No SSO providers configured</h3>
          <p className="mt-1 text-sm text-[#4a72c4]">Add an identity provider to enable single sign-on for your team</p>
        </div>
      ) : (
        <div className="space-y-3">
          {connections.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between rounded-2xl border border-[#162d58] bg-[#0a1628] p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="font-medium text-white">{c.provider}</p>
                  <p className="text-xs text-[#4a72c4]">{c.domains?.join(", ")}</p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${c.enabled ? "bg-emerald-900/40 text-emerald-400" : "bg-[#162d58] text-[#4a72c4]"}`}>
                {c.enabled ? "Active" : "Disabled"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
