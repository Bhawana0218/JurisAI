"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HelpCircle, BookOpen, MessageSquare, Zap, Shield,
  ChevronDown, ChevronUp, ExternalLink, Mail, FileText,
} from "lucide-react";

const categories = [
  {
    icon: Zap,
    title: "Getting Started",
    description: "Set up your account, invite your team, and run your first AI query.",
    href: "/docs/getting-started",
  },
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Full API reference, SDK guides, and integration walkthroughs.",
    href: "/docs",
  },
  {
    icon: FileText,
    title: "Guides",
    description: "Step-by-step tutorials for common legal workflows and use cases.",
    href: "/docs/guides",
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description: "GDPR, SOC 2, data handling policies, and enterprise controls.",
    href: "/legal/gdpr",
  },
];

const faqs = [
  {
    q: "How do I start a conversation with a legal AI agent?",
    a: "Log in to your dashboard, navigate to Chat, and click New Chat. Choose an agent type that matches your query — for example, the FIR Assistant for police complaints or the Employment Law agent for workplace issues.",
  },
  {
    q: "What file types can I upload for document analysis?",
    a: "JurisAI supports PDF, DOCX, and plain text files. Documents are processed and indexed for semantic search. Maximum file size is 50 MB per upload.",
  },
  {
    q: "Is my data private and secure?",
    a: "Yes. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Your documents and conversations are never used to train shared models. You can delete your data at any time from Settings.",
  },
  {
    q: "How do I add team members to my organization?",
    a: "Go to Settings → Members and click Invite Member. You can assign roles (Owner, Admin, Member, Viewer) and manage permissions per member.",
  },
  {
    q: "What happens when I hit my token limit?",
    a: "You'll receive an in-app notification as you approach your monthly limit. You can upgrade your plan from Settings → Billing, or purchase additional AI credits without changing your plan.",
  },
  {
    q: "Can I use JurisAI via API?",
    a: "Yes. Generate an API key from Settings → API Keys. Full REST API documentation is available at /docs/api and the SDK reference is at /docs/sdk.",
  },
  {
    q: "How do I report a bug or request a feature?",
    a: "Use the Contact Us page to reach our team, or email support@jurisai.com. For urgent issues, include your account email and a description of the problem.",
  },
];

export default function SupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      {/* Header */}
      <div className="mb-14 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950">
          <HelpCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Help &amp; Support</h1>
        <p className="mt-3 text-lg text-gray-500">
          Find answers, explore docs, or get in touch with our team.
        </p>
      </div>

      {/* Resource cards */}
      <div className="mb-16 grid gap-4 sm:grid-cols-2">
        {categories.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-indigo-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-700"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950">
              <c.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{c.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{c.description}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
              Learn more <ExternalLink className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>

      {/* FAQ */}
      <div className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
          {faqs.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
                aria-expanded={openIndex === i}
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.q}
                </span>
                {openIndex === i ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                )}
              </button>
              {openIndex === i && (
                <div className="px-6 pb-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-8 text-center dark:border-indigo-900 dark:bg-indigo-950/40">
        <MessageSquare className="mx-auto mb-3 h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Still need help?</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Our team typically responds within a few hours on business days.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/contact"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <MessageSquare className="h-4 w-4" /> Contact Us
          </Link>
          <a
            href="mailto:support@jurisai.com"
            className="flex items-center gap-2 rounded-xl border border-indigo-200 px-5 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900"
          >
            <Mail className="h-4 w-4" /> support@jurisai.com
          </a>
        </div>
      </div>
    </div>
  );
}
