import { PricingCards } from "@/components/pricing/PricingCards";
import { generateMetadata, SEO_PAGES } from "@/lib/seo/seo";

export const metadata = generateMetadata(SEO_PAGES.pricing);

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Choose the plan that fits your practice. Upgrade or downgrade anytime.
          </p>
        </div>
        <div className="mt-16">
          <PricingCards />
        </div>

        <div className="mx-auto mt-24 max-w-3xl rounded-2xl border border-gray-200 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Enterprise & Custom Plans</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Need custom token limits, dedicated infrastructure, on-premise deployment, or a custom SLA?
            Our enterprise team will work with you to build the perfect plan.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="font-medium text-gray-900 dark:text-white">Custom AI Agents</h4>
              <p className="text-sm text-gray-500">Train AI agents on your specific practice areas and documents</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="font-medium text-gray-900 dark:text-white">On-Premise Deployment</h4>
              <p className="text-sm text-gray-500">Deploy JurisAI in your own data center or VPC</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="font-medium text-gray-900 dark:text-white">Dedicated Infrastructure</h4>
              <p className="text-sm text-gray-500">Isolated compute, storage, and AI processing</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="font-medium text-gray-900 dark:text-white">Custom SLA</h4>
              <p className="text-sm text-gray-500">99.99% uptime guarantee with dedicated support</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-3xl text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Compare Plans</h3>
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Feature</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">Free</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">Pro</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">Team</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
                {[
                  ["Tokens/month", "10K", "100K", "500K", "Custom"],
                  ["AI Agents", "Basic", "Advanced", "All Pro", "Custom"],
                  ["Workflows", "—", "✓", "✓", "✓"],
                  ["API Access", "—", "✓", "✓", "✓"],
                  ["Team Workspaces", "—", "—", "✓", "✓"],
                  ["SSO", "—", "—", "✓", "✓"],
                  ["Audit Logs", "—", "—", "✓", "✓"],
                  ["On-Premise", "—", "—", "—", "✓"],
                  ["Custom SLA", "—", "—", "—", "✓"],
                  ["Support", "Community", "Priority", "Dedicated", "24/7"],
                ].map(([feature, ...vals]) => (
                  <tr key={feature}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{feature}</td>
                    {vals.map((v, i) => (
                      <td key={i} className={`px-6 py-4 text-center text-sm ${v === "✓" ? "text-green-600" : v === "—" ? "text-gray-400" : "text-gray-600 dark:text-gray-300"}`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
