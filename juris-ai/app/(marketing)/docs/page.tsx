import { Book, Code2, Play, Terminal, Search, ChevronRight } from "lucide-react";
import Link from "next/link";

const sections = [
  { title: "Getting Started", description: "Quick start guides and tutorials", href: "/docs/getting-started", icon: Play, color: "text-green-600", bg: "bg-green-50" },
  { title: "API Reference", description: "Complete API documentation", href: "/docs/api", icon: Terminal, color: "text-blue-600", bg: "bg-blue-50" },
  { title: "SDK Reference", description: "JavaScript and Python SDK docs", href: "/docs/sdk", icon: Code2, color: "text-purple-600", bg: "bg-purple-50" },
  { title: "Guides", description: "In-depth implementation guides", href: "/docs/guides", icon: Book, color: "text-amber-600", bg: "bg-amber-50" },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Documentation</h1>
        <p className="mt-4 text-lg text-gray-500">Everything you need to build with JurisAI</p>
        <div className="relative mx-auto mt-8 max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search documentation..." className="w-full rounded-xl border border-gray-300 py-3.5 pl-12 pr-4 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((s) => (
          <Link key={s.title} href={s.href}
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${s.bg}`}>
              <s.icon className={`h-6 w-6 ${s.color}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}
