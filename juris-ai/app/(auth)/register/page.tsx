"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scale, User, Mail, Lock, ArrowRight } from "lucide-react";

import { registerUser } from "@/features/auth/actions/register";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      // 1. Register user in DB
      const res = await registerUser(form);

      if (!res?.success) {
        if (!res?.success) {
          setError("Registration failed. Try again.");
          return;
        }
        return;
      }

      // 2. Auto login after registration
      const { signIn } = await import("next-auth/react");
      const loginRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (!loginRes || loginRes.error) {
        router.push("/login");
        return;
      }

      // 3. Redirect to dashboard
      router.push("/dashboard/chat");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050d1a] px-4 py-12">
      {/* Background glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2a4f96]/15 blur-[120px]" />
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2a4f96] to-[#162d58] shadow-xl shadow-[#2a4f96]/30">
            <Scale className="h-7 w-7 text-[#c9a84c]" />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-white">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-[#7aa0d8]">
            Start using JurisAI in seconds
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-8 shadow-2xl shadow-[#2a4f96]/10">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Name */}
            <Input
              icon={<User />}
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
            />

            {/* Email */}
            <Input
              icon={<Mail />}
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />

            {/* Password */}
            <Input
              icon={<Lock />}
              name="password"
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
            />

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2a4f96] to-[#1e3a70] py-3 text-sm font-semibold text-white transition hover:from-[#4a72c4] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#7aa0d8]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#c9a84c] hover:text-[#e8c97a]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- reusable input ---------- */

function Input({
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a72c4]">
        {icon}
      </span>

      <input
        {...props}
        onChange={props.onChange}
        className="w-full rounded-xl border border-[#162d58] bg-[#050d1a] py-3 pl-10 pr-4 text-sm text-white placeholder-[#2a4f96] outline-none transition focus:border-[#4a72c4]"
      />
    </div>
  );
}