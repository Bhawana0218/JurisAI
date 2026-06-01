"use client";

import { useState } from "react";
import Link from "next/link";
import { Scale, Shield, Zap, BookOpen, Users, ArrowRight, CheckCircle, Star, Menu, X } from "lucide-react";

export default function Home() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050d1a] text-white">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[#162d58]/60 bg-[#050d1a]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-[#2a4f96] to-[#162d58] shadow-lg">
              <Scale className="h-4 w-4 text-[#c9a84c]" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">JurisAI</span>
              <span className="ml-2 rounded-full bg-[#162d58] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#c9a84c]">
                Beta
              </span>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#7aa0d8] md:flex">
            <Link href="#features" className="transition hover:text-white">Features</Link>
            <Link href="#how-it-works" className="transition hover:text-white">How it works</Link>
            <Link href="/dashboard" className="transition hover:text-white">Dashboard</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex rounded-xl px-4 py-2 text-sm font-medium text-[#7aa0d8] transition hover:bg-[#0f2040] hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-linear-to-r from-[#2a4f96] to-[#1e3a70] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-[#4a72c4] hover:to-[#2a4f96]"
            >
              Get started free
            </Link>
            {/* Mobile hamburger */}
            <button
              onClick={() => setNavOpen(!navOpen)}
              className="flex md:hidden rounded-lg p-1.5 text-[#7aa0d8] transition hover:bg-[#0f2040] hover:text-white"
              aria-label="Toggle menu"
            >
              {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {navOpen && (
          <div className="border-t border-[#162d58]/60 bg-[#0a1628] px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              <Link href="#features" onClick={() => setNavOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-[#7aa0d8] transition hover:bg-[#0f2040] hover:text-white">Features</Link>
              <Link href="#how-it-works" onClick={() => setNavOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-[#7aa0d8] transition hover:bg-[#0f2040] hover:text-white">How it works</Link>
              <Link href="/dashboard" onClick={() => setNavOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-[#7aa0d8] transition hover:bg-[#0f2040] hover:text-white">Dashboard</Link>
              <Link href="/login" onClick={() => setNavOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-[#7aa0d8] transition hover:bg-[#0f2040] hover:text-white">Sign in</Link>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Background glows */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/4 top-0 h-125 w-125 -translate-x-1/2 rounded-full bg-[#2a4f96]/20 blur-4xl" />
            <div className="absolute right-1/4 top-20 h-100 w-100 translate-x-1/2 rounded-full bg-[#162d58]/30 blur-3xl" />
            <div className="absolute bottom-0 left-1/2 h-75 w-150 -translate-x-1/2 rounded-full bg-[#c9a84c]/5 blur-2xl" />
          </div>

          {/* Grid pattern overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(#7aa0d8 1px, transparent 1px), linear-gradient(90deg, #7aa0d8 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 text-center md:px-6 md:pb-24 md:pt-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2a4f96]/50 bg-[#0a1628]/80 px-3 py-1 text-xs font-medium text-[#7aa0d8] backdrop-blur md:px-4 md:py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c9a84c] animate-pulse" />
              AI-Powered Legal Intelligence for Indian Citizens
            </div>

            <h1 className="mx-auto mt-6 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl md:mt-8 lg:text-7xl">
              Legal Clarity,{" "}
              <span className="bg-linear-to-r from-[#4a72c4] via-[#7aa0d8] to-[#c9a84c] bg-clip-text text-transparent">
                Powered by AI
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#7aa0d8] md:text-lg md:mt-6">
              JurisAI routes your legal query to the best specialist agent, delivers step-by-step
              guidance for FIR filings, consumer rights, and more — grounded in retrieval-backed citations.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row md:mt-10 md:gap-4">
              <Link
                href="/register"
                className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#2a4f96] to-[#1e3a70] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#2a4f96]/30 transition hover:from-[#4a72c4] hover:to-[#2a4f96] hover:shadow-[#4a72c4]/40 md:px-8 md:py-4"
              >
                Start for free
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#2a4f96]/60 bg-[#0a1628]/60 px-6 py-3.5 text-sm font-semibold text-[#7aa0d8] backdrop-blur transition hover:border-[#4a72c4] hover:bg-[#0f2040] hover:text-white md:px-8 md:py-4"
              >
                Sign in
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-[#4a72c4] md:mt-10 md:gap-6">
              {["Agent routing", "Secure auth", "Retrieval-ready", "Indian law focus"].map((b) => (
                <div key={b} className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-[#c9a84c]" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero demo card */}
          <div className="mx-auto max-w-3xl px-4 pb-16 md:px-6 md:pb-20">
            <div className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-4 shadow-2xl shadow-[#2a4f96]/10 md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                </div>
                <span className="rounded-full bg-[#162d58] px-3 py-0.5 text-[10px] font-medium text-[#7aa0d8]">
                  Live legal intake
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-end">
                  <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-[#162d58] px-3 py-2.5 md:max-w-xs md:px-4 md:py-3">
                    <p className="text-sm text-white">{'"I need help filing an FIR for a cybercrime case."'}</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-linear-to-br from-[#1e3a70] to-[#162d58] px-3 py-2.5 md:max-w-sm md:px-4 md:py-3">
                    <div className="mb-1 flex items-center gap-1.5">
                      <Scale className="h-3 w-3 text-[#c9a84c]" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#c9a84c]">JurisAI · Cybercrime Agent</span>
                    </div>
                    <p className="text-sm text-[#d4e4f7]">
                      Here are the steps to prepare evidence, draft your complaint, and what to expect at the cyber cell.
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-[#162d58]/60 bg-[#050d1a]/60 px-3 py-2 md:px-4 md:py-2.5">
                  <span className="text-[10px] font-medium text-[#4a72c4]">Retrieval snapshot</span>
                  <p className="mt-0.5 text-xs text-[#7aa0d8]">IT Act §66C, §66D · NCRP portal guide · Evidence checklist</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {["FIR checklist", "Consumer rights", "Notice drafting", "Court procedure"].map((tag) => (
                  <span key={tag} className="rounded-full border border-[#162d58] bg-[#0f2040] px-3 py-1 text-[11px] text-[#7aa0d8]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────── */}
        <section id="features" className="border-t border-[#162d58]/40 bg-[#050d1a] py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#2a4f96]/40 bg-[#0a1628] px-4 py-1.5 text-xs font-medium text-[#7aa0d8]">
                Platform capabilities
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
                Built for clarity and action
              </h2>
              <p className="mt-3 max-w-xl mx-auto text-sm text-[#7aa0d8] md:text-base">
                Every feature is designed to reduce legal uncertainty and help you move forward with confidence.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:mt-14 md:gap-5">
              {[
                {
                  icon: Zap,
                  title: "Intelligent Agent Routing",
                  desc: "JurisAI automatically selects the best specialist agent — cybercrime, consumer rights, employment law, and more.",
                  accent: "from-[#2a4f96] to-[#162d58]",
                },
                {
                  icon: BookOpen,
                  title: "Step-by-Step Workflows",
                  desc: "Get structured, actionable guidance you can follow immediately — no legal jargon, just clear next steps.",
                  accent: "from-[#1e3a70] to-[#0f2040]",
                },
                {
                  icon: Shield,
                  title: "Retrieval-Backed Answers",
                  desc: "Responses are grounded in your uploaded documents and a curated Indian legal knowledge base.",
                  accent: "from-[#162d58] to-[#0a1628]",
                },
                {
                  icon: Scale,
                  title: "Indian Law Focus",
                  desc: "Aligned with IPC, CrPC, IT Act, Consumer Protection Act, and other key Indian statutes.",
                  accent: "from-[#2a4f96] to-[#162d58]",
                },
                {
                  icon: Users,
                  title: "Enterprise Ready",
                  desc: "Multi-tenant organizations, SSO, audit logs, governance rules, and API access for law firms.",
                  accent: "from-[#1e3a70] to-[#0f2040]",
                },
                {
                  icon: Star,
                  title: "Quality Evaluation",
                  desc: "Every AI response is scored for legal correctness, citation quality, and hallucination risk.",
                  accent: "from-[#162d58] to-[#0a1628]",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="group rounded-2xl border border-[#162d58] bg-[#0a1628] p-5 transition hover:border-[#2a4f96] hover:bg-[#0f2040] md:p-6"
                >
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${card.accent} shadow-lg`}>
                    <card.icon className="h-5 w-5 text-[#c9a84c]" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-white md:text-base">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#7aa0d8]">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ───────────────────────────────────── */}
        <section id="how-it-works" className="border-t border-[#162d58]/40 bg-[#0a1628] py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">How it works</h2>
              <p className="mt-3 text-sm text-[#7aa0d8] md:text-base">Three steps from question to clarity.</p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3 md:mt-14 md:gap-6">
              {[
                {
                  step: "01",
                  title: "Create your account",
                  desc: "Sign up in seconds. No credit card required to get started.",
                },
                {
                  step: "02",
                  title: "Ask your legal question",
                  desc: "Describe your situation naturally. JurisAI routes it to the right specialist agent.",
                },
                {
                  step: "03",
                  title: "Get a clear workflow",
                  desc: "Receive structured guidance, citations, and actionable next steps — instantly.",
                },
              ].map((s, i) => (
                <div key={s.step} className="relative rounded-2xl border border-[#162d58] bg-[#050d1a] p-6 md:p-7">
                  {i < 2 && (
                    <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 md:block">
                      <ArrowRight className="h-5 w-5 text-[#2a4f96]" />
                    </div>
                  )}
                  <div className="text-3xl font-black text-[#162d58] md:text-4xl">{s.step}</div>
                  <h3 className="mt-3 text-sm font-semibold text-white md:text-base">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#7aa0d8]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────── */}
        <section className="border-t border-[#162d58]/40 bg-[#050d1a] py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
            <div className="rounded-3xl border border-[#2a4f96]/40 bg-linear-to-br from-[#0a1628] via-[#0f2040] to-[#0a1628] p-8 shadow-2xl shadow-[#2a4f96]/10 md:p-12">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-[#2a4f96] to-[#162d58] md:h-14 md:w-14">
                <Scale className="h-6 w-6 text-[#c9a84c] md:h-7 md:w-7" />
              </div>
              <h2 className="text-2xl font-bold text-white md:text-3xl lg:text-4xl">
                Ready to get legal clarity?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-sm text-[#7aa0d8] md:text-base">
                Join thousands of Indian citizens and legal professionals using JurisAI to navigate the law with confidence.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row md:mt-8 md:gap-4">
                <Link
                  href="/register"
                  className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#2a4f96] to-[#1e3a70] px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-[#2a4f96]/30 transition hover:from-[#4a72c4] hover:to-[#2a4f96] md:px-8 md:py-3.5"
                >
                  Get started free
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/login"
                  className="flex w-full sm:w-auto items-center justify-center rounded-xl border border-[#2a4f96]/50 px-6 py-3 text-sm font-semibold text-[#7aa0d8] transition hover:border-[#4a72c4] hover:text-white md:px-8 md:py-3.5"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────── */}
        <footer className="border-t border-[#162d58]/40 bg-[#050d1a] py-8 md:py-10">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-[#2a4f96] to-[#162d58]">
                  <Scale className="h-3.5 w-3.5 text-[#c9a84c]" />
                </div>
                <span className="text-sm font-semibold text-white">JurisAI</span>
              </div>
              <p className="text-xs text-[#4a72c4]">
                &copy; {new Date().getFullYear()} JurisAI. Built for legal workflows and productivity.
              </p>
              <div className="flex gap-5 text-xs text-[#4a72c4]">
                <Link href="/legal/privacy" className="transition hover:text-white">Privacy</Link>
                <Link href="/legal/terms" className="transition hover:text-white">Terms</Link>
                <Link href="/legal/sla" className="transition hover:text-white">SLA</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
