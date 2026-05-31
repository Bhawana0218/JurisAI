import { Globe, Scale, Shield, Users } from "lucide-react";

const values = [
  { icon: Scale, title: "Justice Through Technology", description: "Making legal intelligence accessible to everyone, everywhere" },
  { icon: Globe, title: "Global Reach", description: "Multi-jurisdiction support across 50+ countries and 200+ legal domains" },
  { icon: Shield, title: "Enterprise Security", description: "SOC 2 compliant, end-to-end encryption, and GDPR compliant" },
  { icon: Users, title: "Community Driven", description: "Built by legal professionals and AI researchers working together" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">About JurisAI</h1>
        <p className="mt-4 text-lg text-gray-500">Building the future of legal intelligence</p>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
        <p className="mt-4 text-gray-600 leading-relaxed dark:text-gray-400">
          JurisAI is on a mission to democratize legal intelligence. We believe that every organization, regardless of size or budget, deserves access to world-class legal AI capabilities. Our platform combines cutting-edge AI with deep legal expertise to deliver accurate, contextual, and actionable legal insights.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">Our Values</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{v.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{v.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
