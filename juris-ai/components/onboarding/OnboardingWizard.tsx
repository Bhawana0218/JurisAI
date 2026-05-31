"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Users, Scale, Sparkles, ArrowRight, ArrowLeft, Check } from "lucide-react";

const steps = [
  {
    id: "welcome",
    title: "Welcome to JurisAI",
    description: "Let's set up your workspace in under 2 minutes",
    icon: Sparkles,
  },
  {
    id: "workspace",
    title: "Name your workspace",
    description: "This is where your team will collaborate",
    fields: [{ name: "workspaceName", label: "Workspace Name", placeholder: "e.g., Smith & Associates", type: "text" }],
    icon: Building2,
  },
  {
    id: "role",
    title: "What best describes you?",
    description: "We'll tailor your experience",
    options: [
      { value: "solo", label: "Solo Practitioner", icon: Users },
      { value: "firm", label: "Law Firm", icon: Building2 },
      { value: "corporate", label: "Corporate Legal Team", icon: Scale },
      { value: "other", label: "Other", icon: Sparkles },
    ],
    icon: Users,
  },
  {
    id: "interests",
    title: "Choose your focus areas",
    description: "We'll suggest relevant AI agents",
    options: [
      { value: "litigation", label: "Litigation" },
      { value: "corporate", label: "Corporate Law" },
      { value: "ip", label: "Intellectual Property" },
      { value: "tax", label: "Tax Law" },
      { value: "immigration", label: "Immigration" },
      { value: "real_estate", label: "Real Estate" },
      { value: "employment", label: "Employment Law" },
      { value: "criminal", label: "Criminal Law" },
    ],
    icon: Scale,
    multi: true,
  },
  {
    id: "complete",
    title: "You're all set!",
    description: "Your workspace is ready. Let's dive in.",
    icon: Check,
  },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const current = steps[step];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        await fetch("/api/onboarding/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4 dark:from-gray-950 dark:to-gray-900">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === step ? "w-8 bg-indigo-600" : i < step ? "w-2 bg-indigo-300" : "w-2 bg-gray-300 dark:bg-gray-700"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <current.icon className="h-6 w-6" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{current.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{current.description}</p>

            <div className="mt-8">
              {"fields" in current && current.fields?.map((field: any) => (
                <input
                  key={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              ))}

              {"options" in current && (
                <div className={`grid gap-3 ${current.multi ? "grid-cols-2" : "grid-cols-1"}`}>
                  {(current.options as any[]).map((opt) => {
                    const selected = current.multi
                      ? (formData.interests || []).includes(opt.value)
                      : formData.role === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          if (current.multi) {
                            const currentInterests = formData.interests || [];
                            setFormData({
                              ...formData,
                              interests: selected
                                ? currentInterests.filter((i: string) => i !== opt.value)
                                : [...currentInterests, opt.value],
                            });
                          } else {
                            setFormData({ ...formData, role: opt.value });
                          }
                        }}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition-all ${
                          selected
                            ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                            : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {"icon" in opt && <opt.icon className="h-5 w-5" />}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="flex items-center gap-2 text-sm text-gray-500 disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? "Setting up..." : step === steps.length - 1 ? "Go to Dashboard" : "Continue"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
