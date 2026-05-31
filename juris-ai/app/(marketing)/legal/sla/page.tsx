import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SlaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/legal" className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Legal
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Service Level Agreement</h1>
      <p className="mt-2 text-sm text-gray-400">Last updated: May 1, 2026</p>
      <div className="mt-8 space-y-6 text-sm text-gray-600 leading-relaxed dark:text-gray-400">
        <p><strong>Availability Guarantee</strong><br/>99.9% uptime guarantee for Business and Enterprise plans.</p>
        <p><strong>API Response Time</strong><br/>P95 response time under 2 seconds for API requests.</p>
        <p><strong>Support Response Times</strong><br/>Critical: 1 hour, High: 4 hours, Normal: 24 hours.</p>
        <p><strong>Credits</strong><br/>5% service credit for each 30-minute period of downtime exceeding SLA.</p>
      </div>
    </div>
  );
}
