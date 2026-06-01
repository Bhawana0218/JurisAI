"use client";

import { useState } from "react";
import { Users, UserPlus, Crown, Shield, Eye } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Member {
  id: string;
  role: string;
  user?: { name?: string; email?: string };
  joinedAt: string;
}

const ROLE_STYLES: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  OWNER:  { label: "Owner",  color: "text-[#c9a84c] bg-[#c9a84c]/10",  icon: Crown },
  ADMIN:  { label: "Admin",  color: "text-[#4a72c4] bg-[#162d58]/40",  icon: Shield },
  MEMBER: { label: "Member", color: "text-emerald-400 bg-emerald-900/30", icon: Users },
  VIEWER: { label: "Viewer", color: "text-[#7aa0d8] bg-[#0f2040]",     icon: Eye },
};

export default function MembersPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");

  // Placeholder members — replace with real fetch when org membership API is ready
  const members: Member[] = [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Members</h1>
          <p className="mt-1 text-sm text-[#7aa0d8]">Manage who has access to your workspace</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 rounded-xl bg-[#2a4f96] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e3a70]"
        >
          <UserPlus className="h-4 w-4" /> Invite Member
        </button>
      </div>

      {showInvite && (
        <div className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-6">
          <h3 className="mb-4 font-semibold text-white">Invite a Team Member</h3>
          <div className="flex flex-col gap-3 lg:flex-row">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              type="email"
              className="flex-1 rounded-xl border border-[#162d58] bg-[#0f2040] px-3 py-2.5 text-sm text-white placeholder-[#2a4f96] focus:border-[#4a72c4] focus:outline-none"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-xl border border-[#162d58] bg-[#0f2040] px-3 py-2.5 text-sm text-white focus:border-[#4a72c4] focus:outline-none"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <button className="rounded-xl bg-[#2a4f96] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e3a70]">
              Send Invite
            </button>
            <button onClick={() => setShowInvite(false)} className="rounded-xl border border-[#162d58] px-4 py-2.5 text-sm text-[#7aa0d8] transition hover:bg-[#0f2040]">
              Cancel
            </button>
          </div>
        </div>
      )}

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#162d58] py-16 text-center">
          <Users className="mb-4 h-12 w-12 text-[#2a4f96]" />
          <h3 className="text-lg font-semibold text-white">No team members yet</h3>
          <p className="mt-1 text-sm text-[#4a72c4]">Invite colleagues to collaborate on legal workflows</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#162d58] bg-[#0a1628]">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#162d58]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#4a72c4]">Member</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#4a72c4]">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#4a72c4]">Joined</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const roleInfo = ROLE_STYLES[m.role] ?? ROLE_STYLES.MEMBER;
                const RoleIcon = roleInfo.icon;
                return (
                  <tr key={m.id} className="border-b border-[#0f2040] transition hover:bg-[#0f2040]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-[#2a4f96] to-[#162d58] text-xs font-bold text-white">
                          {m.user?.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="font-medium text-white">{m.user?.name ?? "Unknown"}</p>
                          <p className="text-xs text-[#4a72c4]">{m.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${roleInfo.color}`}>
                        <RoleIcon className="h-3 w-3" />
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#4a72c4]">{new Date(m.joinedAt).toLocaleDateString()}</td>
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
