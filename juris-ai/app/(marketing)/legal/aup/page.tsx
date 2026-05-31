import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AupPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/legal" className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Legal
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Acceptable Use Policy</h1>
      <p className="mt-2 text-sm text-gray-400">Last updated: May 1, 2026</p>
      <div className="mt-8 space-y-6 text-sm text-gray-600 leading-relaxed dark:text-gray-400">
        <p>This Acceptable Use Policy defines acceptable practices for using JurisAI services.</p>
        <p><strong>Prohibited Activities</strong><br/>You may not use JurisAI for any illegal activity, to generate misleading legal content, or to bypass legal procedures.</p>
        <p><strong>Content Restrictions</strong><br/>Do not submit content that violates others' intellectual property rights or contains malicious code.</p>
        <p><strong>Rate Limits</strong><br/>Automated scraping or excessive API calls beyond plan limits is prohibited.</p>
        <p><strong>Reporting Violations</strong><br/>Report violations to abuse@jurisai.io.</p>
      </div>
    </div>
  );
}
