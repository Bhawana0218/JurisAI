"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, GripVertical, Trash2, Save, Play, ChevronRight, Zap, Brain, Search, FileText, Mail, Globe, Database, Clock } from "lucide-react";

const stepTypes = [
  { id: "llm_call", label: "LLM Call", icon: Brain, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
  { id: "agent", label: "Agent", icon: Zap, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
  { id: "search", label: "Search", icon: Search, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
  { id: "document", label: "Document", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
  { id: "email", label: "Email", icon: Mail, color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-950" },
  { id: "api", label: "API Call", icon: Globe, color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-950" },
  { id: "data", label: "Data", icon: Database, color: "text-gray-600", bg: "bg-gray-50 dark:bg-gray-950" },
  { id: "wait", label: "Wait", icon: Clock, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950" },
];

export default function WorkflowBuilderPage() {
  const [steps, setSteps] = useState<any[]>([]);
  const [name, setName] = useState("Untitled Workflow");
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const addStep = (type: string) => {
    setSteps(prev => [...prev, { id: crypto.randomUUID(), type, label: `${type} step` }]);
  };

  const removeStep = (index: number) => {
    setSteps(prev => prev.filter((_, i) => i !== index));
    if (selectedStep === index) setSelectedStep(null);
  };

  const moveStep = (from: number, to: number) => {
    if (to < 0 || to >= steps.length) return;
    const updated = [...steps];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setSteps(updated);
    setSelectedStep(to);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xl font-bold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">{steps.length} steps</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">
            <Save className="h-4 w-4" /> Save Draft
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
            <Play className="h-4 w-4" /> Publish
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Step Types</h3>
          <div className="space-y-1">
            {stepTypes.map(st => (
              <button key={st.id} onClick={() => addStep(st.id)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                <div className={`flex h-7 w-7 items-center justify-center rounded-md ${st.bg}`}>
                  <st.icon className={`h-3.5 w-3.5 ${st.color}`} />
                </div>
                <span>{st.label}</span>
                <Plus className="ml-auto h-3.5 w-3.5 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[500px] rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          {steps.length === 0 ? (
            <div className="flex h-full items-center justify-center py-20">
              <div className="text-center">
                <Zap className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Build your workflow</h3>
                <p className="mt-1 text-sm text-gray-500">Add steps from the left panel to get started</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {steps.map((step, i) => (
                <motion.div key={step.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  {i > 0 && (
                    <div className="flex justify-center py-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700">
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  )}
                  <button onClick={() => setSelectedStep(i)}
                    className={`w-full rounded-xl border p-4 text-left transition-all ${
                      selectedStep === i
                        ? "border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950"
                        : "border-gray-100 bg-white hover:border-gray-200 dark:border-gray-800 dark:bg-gray-900"
                    }`}>
                    <div className="flex items-center gap-3">
                      <button className="cursor-grab text-gray-300 hover:text-gray-500">
                        <GripVertical className="h-4 w-4" />
                      </button>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        stepTypes.find(s => s.id === step.type)?.bg || "bg-gray-50"
                      }`}>
                        {stepTypes.find(s => s.id === step.type)?.icon ? (
                          <DynamicIcon icon={stepTypes.find(s => s.id === step.type)!.icon} className={`h-4 w-4 ${stepTypes.find(s => s.id === step.type)?.color}`} />
                        ) : (
                          <Zap className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{step.label}</p>
                        <p className="text-xs text-gray-400">{step.type} step</p>
                      </div>
                      <div className="flex gap-1">
                        {i > 0 && (
                          <button onClick={() => { moveStep(i, i - 1); }} className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600">
                            <ChevronRight className="h-4 w-4 -rotate-90" />
                          </button>
                        )}
                        {i < steps.length - 1 && (
                          <button onClick={() => { moveStep(i, i + 1); }} className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600">
                            <ChevronRight className="h-4 w-4 rotate-90" />
                          </button>
                        )}
                        <button onClick={() => removeStep(i)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DynamicIcon({ icon: Icon, className }: { icon: any; className: string }) {
  return <Icon className={className} />;
}
