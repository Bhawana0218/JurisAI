import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/legal" className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Legal
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-400">Last updated: May 1, 2026</p>
      <div className="mt-8 space-y-6 text-sm text-gray-600 leading-relaxed dark:text-gray-400">
        <p><strong>1. Information We Collect</strong><br/>We collect account information, usage data, and content you submit to our platform.</p>
        <p><strong>2. How We Use Your Data</strong><br/>We use your data to provide, improve, and secure our services.</p>
        <p><strong>3. Data Retention</strong><br/>We retain your data for as long as your account is active or as needed to provide services.</p>
        <p><strong>4. Your Rights</strong><br/>You have the right to access, correct, or delete your personal data.</p>
        <p><strong>5. Contact</strong><br/>For privacy inquiries, contact privacy@jurisai.io.</p>
      </div>
    </div>
  );
}
