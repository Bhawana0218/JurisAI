import { prisma } from "@/lib/prisma";
import { GovernanceAction } from "@prisma/client";
import { eventBus } from "../event-bus/event-bus";
import { logger } from "../observability/logging/logger";

type GovernanceCheckResult = {
  allowed: boolean;
  action: GovernanceAction;
  ruleId?: string;
  reason?: string;
  maskedOutput?: string;
};

class GovernanceEngine {
  async checkContent(params: {
    content: string;
    userId: string;
    organizationId?: string;
    context?: Record<string, unknown>;
  }): Promise<GovernanceCheckResult> {
    const rules = await prisma.governanceRule.findMany({
      where: {
        enabled: true,
        ...(params.organizationId ? { OR: [{ organizationId: params.organizationId }, { organizationId: null }] } : { organizationId: null }),
      },
      orderBy: { priority: "asc" },
    });

    for (const rule of rules) {
      const result = await this.evaluateRule(rule, params.content, params.context);
      if (result !== null) {
        await this.recordHit(rule.id);
        return result;
      }
    }

    return { allowed: true, action: "ALLOW" as GovernanceAction };
  }

  private async evaluateRule(rule: any, content: string, context?: Record<string, unknown>): Promise<GovernanceCheckResult | null> {
    switch (rule.ruleType) {
      case "keyword_block":
        return this.evaluateKeywordBlock(rule, content);
      case "pattern_block":
        return this.evaluatePatternBlock(rule, content);
      case "pii_redaction":
        return this.evaluatePiiRedaction(rule, content);
      case "content_moderation":
        return this.evaluateContentModeration(rule, content);
      case "rate_governance":
        return this.evaluateRateGovernance(rule, context);
      case "jurisdiction_restriction":
        return this.evaluateJurisdiction(rule, context);
      default:
        return null;
    }
  }

  private async evaluateKeywordBlock(rule: any, content: string): Promise<GovernanceCheckResult | null> {
    const keywords = rule.configuration?.keywords as string[] || [];
    const matched = keywords.filter((k: string) => content.toLowerCase().includes(k.toLowerCase()));

    if (matched.length > 0) {
      return {
        allowed: rule.action === "ALLOW" || rule.action === "REVIEW",
        action: rule.action as GovernanceAction,
        ruleId: rule.id,
        reason: `Content matched blocked keywords: ${matched.join(", ")}`,
      };
    }
    return null;
  }

  private async evaluatePatternBlock(rule: any, content: string): Promise<GovernanceCheckResult | null> {
    const patterns = rule.configuration?.patterns as string[] || [];
    for (const pattern of patterns) {
      try {
        const regex = new RegExp(pattern, "gi");
        if (regex.test(content)) {
          return {
            allowed: false,
            action: "BLOCK" as GovernanceAction,
            ruleId: rule.id,
            reason: `Content matched pattern: ${pattern}`,
          };
        }
      } catch { continue; }
    }
    return null;
  }

  private async evaluatePiiRedaction(rule: any, content: string): Promise<GovernanceCheckResult | null> {
    const piiPatterns: Record<string, RegExp> = {
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
      credit_card: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
      aadhaar: /\b\d{4}\s\d{4}\s\d{4}\b/g,
      pan: /[A-Z]{5}[0-9]{4}[A-Z]{1}/g,
    };

    let masked = content;
    let foundPii = false;

    for (const [type, pattern] of Object.entries(piiPatterns)) {
      if (pattern.test(masked)) {
        foundPii = true;
        masked = masked.replace(pattern, `[REDACTED:${type}]`);
      }
    }

    if (foundPii) {
      return {
        allowed: true,
        action: "REDACT" as GovernanceAction,
        ruleId: rule.id,
        reason: "PII detected and redacted",
        maskedOutput: masked,
      };
    }
    return null;
  }

  private async evaluateContentModeration(rule: any, content: string): Promise<GovernanceCheckResult | null> {
    const categories = rule.configuration?.moderationCategories as string[] || ["hate", "harassment", "violence", "sexual", "self-harm"];
    const threshold = rule.configuration?.threshold || 0.8;

    try {
      const { generateText } = await import("ai");
      const { openai } = await import("@ai-sdk/openai");

      const result = await generateText({
        model: openai("gpt-4.1-mini"),
        system: `You are a content moderation system. Analyze the following content for: ${categories.join(", ")}.
Return JSON: {"flagged": boolean, "categories": string[], "scores": Record<string, number>, "explanation": string}`,
        messages: [{ role: "user", content }],
        maxOutputTokens: 500,
      });

      const analysis = JSON.parse(result.text);
      if (analysis.flagged) {
        return {
          allowed: false,
          action: "BLOCK" as GovernanceAction,
          ruleId: rule.id,
          reason: `Content moderation flagged: ${analysis.categories.join(", ")}`,
        };
      }
    } catch {
      logger.warn("[Governance] Content moderation API failed, allowing content");
    }

    return null;
  }

  private async evaluateRateGovernance(rule: any, _context?: Record<string, unknown>): Promise<GovernanceCheckResult | null> {
    const maxRate = rule.configuration?.maxRequestsPerMinute || 100;
    return null;
  }

  private async evaluateJurisdiction(rule: any, _context?: Record<string, unknown>): Promise<GovernanceCheckResult | null> {
    return null;
  }

  private async recordHit(ruleId: string): Promise<void> {
    await prisma.governanceRule.update({
      where: { id: ruleId },
      data: {
        hitCount: { increment: 1 },
        lastTriggeredAt: new Date(),
      },
    }).catch(() => {});
  }

  async createRule(params: {
    name: string;
    description?: string;
    ruleType: string;
    action: GovernanceAction;
    pattern?: string;
    conditions?: Record<string, unknown>;
    configuration?: Record<string, unknown>;
    priority?: number;
    organizationId?: string;
    userId?: string;
  }) {
    return prisma.governanceRule.create({
      data: {
        name: params.name,
        description: params.description,
        ruleType: params.ruleType,
        action: params.action,
        pattern: params.pattern,
        conditions: (params.conditions || {}) as any,
        configuration: (params.configuration || {}) as any,
        priority: params.priority || 100,
        organizationId: params.organizationId,
        userId: params.userId,
      },
    });
  }

  async listRules(organizationId?: string) {
    return prisma.governanceRule.findMany({
      where: organizationId ? { organizationId } : {},
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });
  }

  async getStats(organizationId: string) {
    const rules = await prisma.governanceRule.findMany({
      where: { organizationId },
      select: { ruleType: true, action: true, hitCount: true },
    });

    return {
      total: rules.length,
      byType: this.groupBy(rules, "ruleType"),
      byAction: this.groupBy(rules, "action"),
      totalHits: rules.reduce((sum, r) => sum + r.hitCount, 0),
    };
  }

  private groupBy(items: any[], key: string): Record<string, number> {
    return items.reduce((acc: Record<string, number>, item: any) => {
      const k = item[key];
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
  }
}

export const governanceEngine = new GovernanceEngine();
