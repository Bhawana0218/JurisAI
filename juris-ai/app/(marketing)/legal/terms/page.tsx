import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/legal" className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Legal
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-400">Last updated: May 1, 2026</p>
      <div className="mt-8 space-y-6 text-sm text-gray-600 leading-relaxed dark:text-gray-400">
        <p><strong>1. Acceptance of Terms</strong><br/>By accessing or using JurisAI, you agree to be bound by these Terms of Service.</p>
        <p><strong>2. Description of Service</strong><br/>JurisAI provides AI-powered legal intelligence and research tools.</p>
        <p><strong>3. User Obligations</strong><br/>You are responsible for maintaining the confidentiality of your account credentials.</p>
        <p><strong>4. Limitations of Liability</strong><br/>JurisAI is a tool for legal research assistance and does not constitute legal advice.</p>
        <p><strong>5. Termination</strong><br/>We reserve the right to suspend or terminate access for violations of these terms.</p>
      </div>
    </div>
  );
}
