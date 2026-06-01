"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, Download, Bot, ShoppingCart, Check } from "lucide-react";

interface Review {
  id: string;
  user?: { name?: string } | null;
  rating: number;
  comment?: string;
}

interface Agent {
  id: string;
  name: string;
  shortDescription?: string;
  description: string;
  rating?: number;
  totalInstalls: number;
  version: string;
  documentation?: string;
  reviews?: Review[];
  tags?: string[];
}

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/v1/agents/${id}`)
      .then((r) => r.json())
      .then(setAgent)
      .finally(() => setLoading(false));
  }, [id]);

  const handleInstall = async () => {
    if (!id) return;

    const res = await fetch(
      `/api/v1/marketplace/agents/${id}/install`,
      { method: "POST" }
    );

    if (res.ok) setInstalled(true);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6 h-8 w-48 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mb-4 h-64 rounded-2xl bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  if (!agent) return <div className="py-16 text-center">Agent not found</div>;

  // ✅ SAFE DEFAULTS (important fix)
  const reviews = agent.reviews ?? [];
  const tags = agent.tags ?? [];

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Bot className="h-8 w-8" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {agent.name}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {agent.shortDescription}
              </p>

              <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  {agent.rating ? agent.rating.toFixed(1) : "0.0"}
                </span>

                <span className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  {agent.totalInstalls} installs
                </span>

                <span>v{agent.version}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleInstall}
            disabled={installed}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold ${
              installed
                ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
          >
            {installed ? (
              <>
                <Check className="h-4 w-4" /> Installed
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" /> Install
              </>
            )}
          </button>
        </div>

        <div className="mt-8">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Description
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {agent.description}
          </p>
        </div>

        {agent.documentation && (
          <div className="mt-8">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Documentation
            </h3>
            <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {agent.documentation}
            </div>
          </div>
        )}

        {/* FIXED: safe length check */}
        {reviews.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Reviews ({reviews.length})
            </h3>

            <div className="mt-4 space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {review.user?.name || "Anonymous"}
                    </span>

                    <span className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </span>
                  </div>

                  {review.comment && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ SAFE TAGS */}
        {tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}