import { ArrowRight, Rocket, Plus, Bug, Zap } from "lucide-react";

const releases = [
  {
    version: "v1.2.0", date: "May 28, 2026",
    items: [
      { type: "feature", text: "Knowledge Graph with semantic search across legal entities" },
      { type: "feature", text: "Visual Workflow Builder with drag-and-drop interface" },
      { type: "improvement", text: "50% reduction in agent cold-start latency" },
      { type: "improvement", text: "Enhanced citation accuracy scoring" },
    ],
  },
  {
    version: "v1.1.0", date: "May 15, 2026",
    items: [
      { type: "feature", text: "Agent Marketplace with community submissions" },
      { type: "feature", text: "Prompt Experimentation Engine for A/B testing" },
      { type: "feature", text: "Webhook event system with retry logic" },
      { type: "improvement", text: "Improved audit logging with full event trail" },
    ],
  },
  {
    version: "v1.0.0", date: "May 1, 2026",
    items: [
      { type: "feature", text: "Initial release of JurisAI platform" },
      { type: "feature", text: "AI-powered legal research agents" },
      { type: "feature", text: "Multi-jurisdiction support" },
      { type: "bugfix", text: "Fixed pagination on document search" },
    ],
  },
];

export default function ChangelogPage() {
  const typeStyles: Record<string, string> = {
    feature: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    improvement: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    bugfix: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  };

  const typeIcons: Record<string, any> = {
    feature: Plus,
    improvement: Zap,
    bugfix: Bug,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-12 text-center">
        <Rocket className="mx-auto mb-4 h-8 w-8 text-indigo-600" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Changelog</h1>
        <p className="mt-2 text-gray-500">Latest updates and improvements to JurisAI</p>
      </div>
      <div className="space-y-12">
        {releases.map((release) => (
          <div key={release.version}>
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{release.version}</h2>
              <span className="text-sm text-gray-400">{release.date}</span>
            </div>
            <div className="space-y-3">
              {release.items.map((item, i) => {
                const Icon = typeIcons[item.type] || ArrowRight;
                return (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${typeStyles[item.type]}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <p className="flex-1 text-sm text-gray-700 dark:text-gray-300">{item.text}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeStyles[item.type]}`}>{item.type}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
