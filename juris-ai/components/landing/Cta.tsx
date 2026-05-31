import Link from "next/link";

export function Cta() {
  return (
    <section className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-16 text-center shadow-2xl sm:px-16">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),transparent)] opacity-20" />
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to transform your legal practice?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
            Join thousands of legal professionals using JurisAI to work smarter, faster, and more accurately.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-indigo-600 shadow-sm transition-all hover:bg-indigo-50"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-indigo-400 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500"
            >
              Talk to Sales
            </Link>
          </div>
          <p className="mt-6 text-sm text-indigo-200">No credit card required. 14-day free trial. Cancel anytime.</p>
        </div>
      </div>
    </section>
  );
}
