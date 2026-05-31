import { HelpCircle, MessageSquare, BookOpen, ExternalLink } from "lucide-react";
import Link from "next/link";

const resources = [
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Guides, API reference, and SDK docs.",
    href: "/docs",
    external: false,
  },
  {
    icon: MessageSquare,
    title: "Contact Support",
    description: "Reach our team for billing or technical issues.",
    href: "/contact",
    external: false,
  },
  {
    icon: ExternalLink,
    title: "System Status",
    description: "Check live uptime and incident history.",
    href: "/status",
    external: false,
  },
];

export default function SupportPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Help &amp; Support</h1>
        <p className="mt-1 text-sm text-[#7aa0d8]">
          Resources and contact options to help you get the most out of JurisAI.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((r) => (
          <Link
            key={r.title}
            href={r.href}
            className="group rounded-2xl border border-[#162d58] bg-[#0a1628] p-6 transition hover:border-[#2a4f96] hover:bg-[#0f2040]"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#162d58]/60">
              <r.icon className="h-5 w-5 text-[#4a72c4] group-hover:text-[#c9a84c] transition-colors" />
            </div>
            <h2 className="text-sm font-semibold text-white">{r.title}</h2>
            <p className="mt-1 text-xs text-[#4a72c4]">{r.description}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#162d58]/60">
            <HelpCircle className="h-5 w-5 text-[#4a72c4]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Frequently Asked Questions</h2>
            <div className="mt-4 space-y-4">
              {[
                {
                  q: "How do I start a new chat with an AI agent?",
                  a: 'Navigate to Chat in the sidebar and click "New Chat". Select an agent type that matches your legal query.',
                },
                {
                  q: "How are my documents stored?",
                  a: "Documents are encrypted at rest and processed only to generate embeddings for search. Raw files are stored securely and never shared.",
                },
                {
                  q: "Can I export my chat history?",
                  a: "Export is available from the chat settings menu. Supported formats include PDF and plain text.",
                },
                {
                  q: "How do I upgrade my plan?",
                  a: "Go to Settings → Billing to view available plans and upgrade at any time.",
                },
              ].map((item) => (
                <div key={item.q} className="border-t border-[#162d58] pt-4 first:border-0 first:pt-0">
                  <p className="text-sm font-medium text-white">{item.q}</p>
                  <p className="mt-1 text-xs text-[#7aa0d8]">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
