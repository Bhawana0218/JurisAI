import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GdprPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/legal" className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Legal
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">GDPR Compliance</h1>
      <p className="mt-2 text-sm text-gray-400">Last updated: May 1, 2026</p>
      <div className="mt-8 space-y-6 text-sm text-gray-600 leading-relaxed dark:text-gray-400">
        <p>JurisAI is committed to full compliance with the General Data Protection Regulation (GDPR).</p>
        <p><strong>Data Processing Agreement</strong><br/>A DPA is available for all enterprise customers.</p>
        <p><strong>Data Residency</strong><br/>Data can be stored in EU data centers upon request.</p>
        <p><strong>Data Protection Officer</strong><br/>Contact dpo@jurisai.io for GDPR-related inquiries.</p>
        <p><strong>Sub-processors</strong><br/>We maintain an up-to-date list of sub-processors available on request.</p>
      </div>
    </div>
  );
}
