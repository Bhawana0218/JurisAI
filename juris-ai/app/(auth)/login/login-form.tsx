"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Scale, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/chat";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    setIsLoading(true);

    try {
      // Use the NextAuth credentials endpoint directly — avoids needing
      // SessionProvider in the tree (which we removed from the root layout
      // to fix the static prerender crash).
      const { signIn } = await import("next-auth/react");
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!res || res.error) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      router.push(callbackUrl);
      router.refresh(); // sync server session state
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050d1a] px-4 py-12">
      {/* Background glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2a4f96]/15 blur-[120px]" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2a4f96] to-[#162d58] shadow-xl shadow-[#2a4f96]/30">
            <Scale className="h-7 w-7 text-[#c9a84c]" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1.5 text-sm text-[#7aa0d8]">
            Sign in to your JurisAI workspace
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-8 shadow-2xl shadow-[#2a4f96]/10">
          <form className="space-y-5" onSubmit={onSubmit}>
            {/* Email */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wider text-[#7aa0d8]"
                htmlFor="email"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a72c4]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#162d58] bg-[#050d1a] py-3 pl-10 pr-4 text-sm text-white placeholder-[#2a4f96] outline-none transition focus:border-[#4a72c4] focus:ring-1 focus:ring-[#4a72c4]/50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wider text-[#7aa0d8]"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a72c4]" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#162d58] bg-[#050d1a] py-3 pl-10 pr-4 text-sm text-white placeholder-[#2a4f96] outline-none transition focus:border-[#4a72c4] focus:ring-1 focus:ring-[#4a72c4]/50"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2a4f96] to-[#1e3a70] py-3 text-sm font-semibold text-white shadow-lg shadow-[#2a4f96]/20 transition hover:from-[#4a72c4] hover:to-[#2a4f96] disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in…
                </span>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-[#162d58] pt-5 text-center text-sm text-[#7aa0d8]">
            New to JurisAI?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#c9a84c] transition hover:text-[#e8c97a]"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
