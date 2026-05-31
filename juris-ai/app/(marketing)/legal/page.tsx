import { Shield, FileText, Scale, Lock, Eye, Clock } from "lucide-react";
import Link from "next/link";

const policies = [
  { title: "Terms of Service", description: "Terms governing the use of JurisAI platform", href: "/legal/terms", icon: FileText },
  { title: "Privacy Policy", description: "How we collect, use, and protect your data", href: "/legal/privacy", icon: Lock },
  { title: "GDPR Compliance", description: "Our commitment to GDPR standards", href: "/legal/gdpr", icon: Shield },
  { title: "Service Level Agreement", description: "Availability and performance guarantees", href: "/legal/sla", icon: Clock },
  { title: "Data Processing Agreement", description: "DPA for enterprise customers", href: "/legal/dpa", icon: Scale },
  { title: "Acceptable Use Policy", description: "Guidelines for platform usage", href: "/legal/aup", icon: Eye },
];

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Legal</h1>
        <p className="mt-4 text-lg text-gray-500">Legal documents and compliance information</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {policies.map((p) => (
          <Link key={p.title} href={p.href}
            className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <p.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{p.title}</h3>
              <p className="text-sm text-gray-500">{p.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
