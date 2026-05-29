import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
            <span className="text-sm font-bold">J</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">JurisAI</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Legal intelligence, simplified</div>
          </div>
        </div>

        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 font-medium transition hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-black px-5 py-2 text-white font-medium transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-black/5 blur-3xl dark:bg-white/10" />
            <div className="absolute -right-24 top-40 h-64 w-64 rounded-full bg-black/5 blur-3xl dark:bg-white/10" />
          </div>

          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-8 md:grid-cols-2 md:pb-20 md:pt-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/60 px-3 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
                Next-level productivity for Indian legal questions
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
                Get answers, workflows, and citations—built for real action.
              </h1>

              <p className="mt-4 max-w-xl text-base text-zinc-600 dark:text-zinc-400 md:text-lg">
                JurisAI routes your query to the best legal agent, helps you understand steps
                like FIR/complaint processes, and (when available) grounds responses with retrieval snapshots.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="flex h-12 items-center justify-center rounded-xl bg-black px-6 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  Start free
                </Link>
                <Link
                  href="/dashboard/chat"
                  className="flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  Open dashboard
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="rounded-full border border-zinc-200 bg-white/60 px-3 py-1 dark:border-zinc-800 dark:bg-zinc-900/40">
                  Agent routing
                </span>
                <span className="rounded-full border border-zinc-200 bg-white/60 px-3 py-1 dark:border-zinc-800 dark:bg-zinc-900/40">
                  Secure auth
                </span>
                <span className="rounded-full border border-zinc-200 bg-white/60 px-3 py-1 dark:border-zinc-800 dark:bg-zinc-900/40">
                  Retrieval-ready
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Live legal intake</div>
                  <div className="text-xs text-zinc-500">Example flow</div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-900">
                    <div className="text-xs text-zinc-500">You</div>
                    <div className="mt-1 text-sm font-medium">“I need help filing an FIR for a cybercrime case.”</div>
                  </div>
                  <div className="rounded-2xl bg-black p-3 text-white dark:bg-white dark:text-black">
                    <div className="text-xs opacity-80">JurisAI Agent</div>
                    <div className="mt-1 text-sm font-medium">
                      Steps to prepare evidence, write the complaint, and what to expect next.
                    </div>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-900">
                    <div className="text-xs text-zinc-500">Snapshot</div>
                    <div className="mt-1 text-sm">
                      Retrieval citations & routing metadata (when available).
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs dark:bg-zinc-900">FIR checklist</span>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs dark:bg-zinc-900">Consumer rights</span>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs dark:bg-zinc-900">Notice drafting</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-12">
          <h2 className="text-2xl font-bold tracking-tight">Built for clarity + action</h2>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Everything is designed to reduce uncertainty and help you move forward with confidence.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Agent routing",
                desc: "JurisAI selects the best legal agent for your scenario and intent.",
              },
              {
                title: "Step-by-step workflows",
                desc: "Get structured guidance you can follow immediately.",
              },
              {
                title: "Retrieval-ready answers",
                desc: "When available, responses can include citations and evidence snapshots.",
              },
              {
                title: "Secure sign-in",
                desc: "Credential-based authentication integrated with NextAuth + Prisma.",
              },
              {
                title: "Productive UI",
                desc: "Clean dashboard chat experience for repeated use.",
              },
              {
                title: "Designed for Indian citizens",
                desc: "Use cases aligned with FIR, consumer rights, cybercrime, and more.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="text-sm font-semibold">{card.title}</div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{card.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-14">
          <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { step: "01", title: "Sign up", desc: "Create your account in seconds." },
              { step: "02", title: "Ask your question", desc: "Describe your situation naturally." },
              { step: "03", title: "Get a workflow", desc: "Receive structured guidance + citations when available." },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{s.step}</div>
                <div className="mt-2 text-sm font-semibold">{s.title}</div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{s.desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-lg font-semibold">Ready to be productive?</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Start now and turn legal uncertainty into a clear plan.
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/register"
                  className="flex h-11 items-center justify-center rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  Get started
                </Link>
                <Link
                  href="/login"
                  className="flex h-11 items-center justify-center rounded-xl border border-zinc-200 px-5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
          <div className="mx-auto max-w-6xl px-4 text-xs text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} JurisAI. Built for legal workflows and productivity.
          </div>
        </footer>
      </main>
    </div>
  );
}

