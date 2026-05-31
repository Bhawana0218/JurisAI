import { ArrowLeft, Book, ArrowRight } from "lucide-react";
import Link from "next/link";

const guides = [
  { title: "Building a Legal Research Assistant", description: "Create custom AI agents for legal document analysis", difficulty: "Intermediate", readTime: "15 min" },
  { title: "Setting Up Multi-Jurisdiction Workflows", description: "Configure workflows across different legal systems", difficulty: "Advanced", readTime: "20 min" },
  { title: "Integrating with Document Management Systems", description: "Connect JurisAI with SharePoint, Google Drive, and more", difficulty: "Intermediate", readTime: "12 min" },
  { title: "Customizing Governance Rules", description: "Define AI behavior guardrails for your organization", difficulty: "Beginner", readTime: "8 min" },
  { title: "Optimizing Prompt Performance", description: "A/B test and optimize prompts for better results", difficulty: "Advanced", readTime: "25 min" },
  { title: "Setting Up SSO and RBAC", description: "Configure enterprise authentication and permissions", difficulty: "Intermediate", readTime: "10 min" },
];

const difficultyColors: Record<string, string> = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-blue-100 text-blue-700",
  Advanced: "bg-purple-100 text-purple-700",
};

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <Link href="/docs" className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Documentation
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Guides</h1>
      <p className="mt-2 text-gray-500">In-depth implementation guides and tutorials</p>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {guides.map((guide) => (
          <div key={guide.title} className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-3 flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColors[guide.difficulty]}`}>{guide.difficulty}</span>
              <span className="text-xs text-gray-400">{guide.readTime}</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{guide.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{guide.description}</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-indigo-600">
              Read Guide <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
