import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DpaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/legal" className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Legal
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Processing Agreement</h1>
      <p className="mt-2 text-sm text-gray-400">Last updated: May 1, 2026</p>
      <div className="mt-8 space-y-6 text-sm text-gray-600 leading-relaxed dark:text-gray-400">
        <p>This Data Processing Agreement (DPA) applies to the processing of personal data by JurisAI on behalf of its customers.</p>
        <p><strong>Scope and Purpose</strong><br/>Defines the terms for processing personal data in connection with the Services.</p>
        <p><strong>Data Processing Details</strong><br/>Available upon request for enterprise customers.</p>
        <p><strong>Security Measures</strong><br/>JurisAI implements technical and organizational security measures as described in our Security Documentation.</p>
        <p>To request a fully executed DPA, contact legal@jurisai.io.</p>
      </div>
    </div>
  );
}
