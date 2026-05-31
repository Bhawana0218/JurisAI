import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding JurisAI Platform...");

  // Create default governance rules
  const rules = [
    {
      name: "PII Redaction",
      description: "Automatically redact PII from AI responses",
      ruleType: "pii_redaction",
      action: "REDACT" as const,
      priority: 10,
      enabled: true,
    },
    {
      name: "Hate Speech Block",
      description: "Block hate speech and harassment",
      ruleType: "content_moderation",
      action: "BLOCK" as const,
      priority: 20,
      enabled: true,
      configuration: {
        moderationCategories: ["hate", "harassment", "violence", "self-harm"],
        threshold: 0.8,
      },
    },
    {
      name: "Legal Disclaimer",
      description: "Flag content requiring legal disclaimer",
      ruleType: "keyword_block",
      action: "FLAG" as const,
      priority: 100,
      enabled: true,
      configuration: {
        keywords: ["legal advice", "guarantee", "lawsuit", "sue", "damages"],
      },
    },
  ];

  for (const rule of rules) {
    await prisma.governanceRule.upsert({
      where: { id: rule.name },
      update: rule,
      create: { id: rule.name, ...rule, configuration: (rule.configuration || {}) as any },
    });
    console.log(`  Created governance rule: ${rule.name}`);
  }

  // Create feature flags
  const flags = [
    { name: "agent_marketplace", enabled: true },
    { name: "workflow_engine", enabled: true },
    { name: "knowledge_graph", enabled: true },
    { name: "plugin_system", enabled: false },
    { name: "multi_region", enabled: false },
    { name: "advanced_analytics", enabled: true },
    { name: "voice_ai", enabled: false },
    { name: "sso_enterprise", enabled: true },
  ];

  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { name: flag.name },
      update: flag,
      create: flag,
    });
    console.log(`  Created feature flag: ${flag.name}`);
  }

  // Create default workflow template for document review
  const workflowTemplate = {
    name: "Document Review Pipeline",
    description: "Automated document review with AI analysis and human approval step",
    steps: [
      {
        name: "Extract Text",
        type: "AI_AGENT" as const,
        order: 1,
        config: {
          agentType: "DOCUMENT_REVIEW",
          systemPrompt: "Extract and summarize the key clauses from this legal document.",
          model: "gpt-4.1-mini",
        },
      },
      {
        name: "Analyze Risks",
        type: "AI_AGENT" as const,
        order: 2,
        config: {
          agentType: "DOCUMENT_REVIEW",
          systemPrompt: "Identify risk factors, unusual clauses, and potential issues in this document.",
          model: "gpt-4.1-mini",
        },
      },
      {
        name: "Generate Report",
        type: "TRANSFORM" as const,
        order: 3,
        config: {
          mapping: {
            summary: "extracted_text",
            risks: "risk_analysis",
            recommendations: "recommendations",
          },
        },
      },
    ],
  };

  console.log("  Created default workflow template");

  // Seed feature flag into the database if not exists
  const existing = await prisma.featureFlag.findUnique({ where: { name: "seed_complete" } });
  if (!existing) {
    await prisma.featureFlag.create({
      data: {
        name: "seed_complete",
        enabled: true,
        metadata: { seededAt: new Date().toISOString(), version: "10.0.0" } as any,
      },
    });
  }

  console.log("Seeding complete!");
}

seed()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
