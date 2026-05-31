import { prisma } from "@/lib/prisma";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

const PLANS = {
  FREE: {
    name: "Free",
    priceId: process.env.STRIPE_PRICE_FREE || "price_free",
    amount: 0,
    tokens: 10000,
    agents: 20,
    apiCalls: 100,
    features: ["basic-chat", "document-upload", "basic-agents"],
  },
  PRO: {
    name: "Pro",
    priceId: process.env.STRIPE_PRICE_PRO || "price_pro",
    amount: 2900,
    tokens: 100000,
    agents: 100,
    apiCalls: 1000,
    features: ["advanced-agents", "workflows", "api-access", "analytics", "priority-support"],
  },
  TEAM: {
    name: "Team",
    priceId: process.env.STRIPE_PRICE_TEAM || "price_team",
    amount: 9900,
    tokens: 500000,
    agents: 500,
    apiCalls: 5000,
    features: ["all-pro", "team-workspaces", "advanced-analytics", "audit-logs", "sso", "dedicated-support"],
  },
  ENTERPRISE: {
    name: "Enterprise",
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || "price_enterprise",
    amount: 0,
    tokens: 5000000,
    agents: -1,
    apiCalls: -1,
    features: ["all-team", "custom-agents", "on-premise", "custom-sla", "dedicated-infra", "24-7-support", "custom-contracts"],
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlan(planId: PlanId) {
  return PLANS[planId];
}

export function getAllPlans() {
  return Object.entries(PLANS).map(([id, plan]) => ({ id, ...plan }));
}

export async function createSubscription(params: {
  organizationId: string;
  plan: PlanId;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}) {
  const plan = PLANS[params.plan];
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  return prisma.subscription.create({
    data: {
      organizationId: params.organizationId,
      plan: params.plan as SubscriptionPlan,
      status: "ACTIVE" as SubscriptionStatus,
      stripeCustomerId: params.stripeCustomerId,
      stripeSubscriptionId: params.stripeSubscriptionId,
      monthlyTokenLimit: plan.tokens,
      monthlyApiCallLimit: plan.apiCalls,
      monthlyAgentLimit: plan.agents,
      features: [...plan.features],
      currentPeriodEnd: periodEnd,
    },
  });
}

export async function updateSubscriptionPlan(subscriptionId: string, newPlan: PlanId) {
  const plan = PLANS[newPlan];
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      plan: newPlan as SubscriptionPlan,
      monthlyTokenLimit: plan.tokens,
      monthlyApiCallLimit: plan.apiCalls,
      monthlyAgentLimit: plan.agents,
      features: [...plan.features],
    },
  });
}

export async function getCurrentSubscription(organizationId: string) {
  return prisma.subscription.findFirst({
    where: { organizationId, status: "ACTIVE" },
  });
}

export async function checkFeatureAccess(organizationId: string, feature: string): Promise<boolean> {
  const sub = await getCurrentSubscription(organizationId);
  if (!sub) return false;
  return sub.features.includes(feature);
}

export async function checkTokenQuota(organizationId: string, tokensToUse: number): Promise<boolean> {
  const sub = await getCurrentSubscription(organizationId);
  if (!sub) return false;
  if (sub.monthlyTokenLimit === -1) return true;
  return (sub.monthlyTokensUsed + tokensToUse) <= sub.monthlyTokenLimit;
}
