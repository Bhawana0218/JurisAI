"use client";

import { useState, useEffect } from "react";
import { FileText, Filter } from "lucide-react";

const EVENT_COLORS: Record<string, string> = {
  USER_LOGIN: "text-emerald-400 bg-emerald-900/30",
  USER_LOGOUT: "text-[#4a72c4] bg-[#162d58]/40",
  API_CALL: "text-sky-400 bg-sky-900/30",
  DATA_ACCESS: "text-[#c9a84c] bg-[#c9a84c]/10",
  DATA_MODIFICATION: "text-orange-400 bg-orange-900/30",
  AGENT_EXECUTION: "text-violet-400 bg-violet-900/30",
  ROLE_CHANGE: "text-pink-400 bg-pink-900/30",
  API_KEY_CREATED: "text-emerald-400 bg-emerald-900/30",
  API_KEY_REVOKED: "text-red-400 bg-red-900/30",
};

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/v1/audit")
      .then((r) => r.json())
      .then((d) => setLogs(Array.isArray(d) ? d : []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? logs.filter((l) => l.eventType === filter) : logs;
  const eventTypes = [...new Set(logs.map((l) => l.eventType))];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="mt-1 text-sm text-[#7aa0d8]">Complete history of actions across your organization</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#4a72c4]" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-[#162d58] bg-[#0a1628] px-3 py-2 text-sm text-white focus:border-[#4a72c4] focus:outline-none"
          >
            <option value="">All Events</option>
            {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-[#0a1628]" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#162d58] py-16 text-center">
          <FileText className="mb-4 h-12 w-12 text-[#2a4f96]" />
          <h3 className="text-lg font-semibold text-white">No audit logs yet</h3>
          <p className="mt-1 text-sm text-[#4a72c4]">Actions taken in your workspace will appear here</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#162d58] bg-[#0a1628]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#162d58]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#4a72c4]">Event</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#4a72c4]">Actor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#4a72c4]">Resource</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#4a72c4]">IP</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#4a72c4]">Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log: any, i) => {
                const colorClass = EVENT_COLORS[log.eventType] || "text-[#7aa0d8] bg-[#162d58]/40";
                return (
                  <tr key={log.id} className={`border-b border-[#0f2040] transition hover:bg-[#0f2040] ${i % 2 === 0 ? "" : "bg-[#050d1a]/30"}`}>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
                        {log.eventType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#7aa0d8]">{log.actor?.email ?? log.actorId ?? "—"}</td>
                    <td className="px-4 py-3 text-[#7aa0d8]">{log.resourceType ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#4a72c4]">{log.ipAddress ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-[#4a72c4]">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
