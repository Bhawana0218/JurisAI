import { prisma } from "@/lib/prisma";
import { AgentCategory, AgentPricingModel, PluginStatus } from "@prisma/client";
import { eventBus } from "../event-bus/event-bus";
import { logger } from "../observability/logging/logger";

type AgentSubmissionInput = {
  name: string;
  description: string;
  shortDescription?: string;
  category: AgentCategory;
  pricingModel: AgentPricingModel;
  price?: number;
  icon?: string;
  coverImage?: string;
  documentation?: string;
  configuration: Record<string, unknown>;
  tools: string[];
  models: string[];
  supportedLanguages: string[];
  tags: string[];
  userId: string;
  organizationId?: string;
};

class MarketplaceService {
  async submitAgent(input: AgentSubmissionInput) {
    const existing = await prisma.agentSubmission.findFirst({
      where: { name: input.name },
    });

    if (existing) {
      throw new Error(`Agent "${input.name}" already exists`);
    }

    const agent = await prisma.agentSubmission.create({
      data: {
        name: input.name,
        description: input.description,
        shortDescription: input.shortDescription,
        category: input.category,
        pricingModel: input.pricingModel,
        price: input.price || 0,
        status: "PENDING" as PluginStatus,
        icon: input.icon,
        coverImage: input.coverImage,
        documentation: input.documentation,
        configuration: input.configuration as any,
        tools: input.tools,
        models: input.models as any,
        supportedLanguages: input.supportedLanguages,
        tags: input.tags,
        userId: input.userId,
        organizationId: input.organizationId,
      },
    });

    await eventBus.publish({
      type: "agent.submitted",
      source: "jurisai:marketplace",
      data: { agentId: agent.id, name: agent.name, category: agent.category },
      metadata: { userId: input.userId, organizationId: input.organizationId, version: 1 },
    });

    return agent;
  }

  async approveAgent(agentId: string, reviewerId: string) {
    const agent = await prisma.agentSubmission.update({
      where: { id: agentId },
      data: { status: "APPROVED" as PluginStatus },
    });

    await eventBus.publish({
      type: "agent.approved",
      source: "jurisai:marketplace",
      data: { agentId: agent.id, name: agent.name },
      metadata: { userId: reviewerId, version: 1 },
    });
  }

  async rejectAgent(agentId: string, reviewerId: string, reason?: string) {
    await prisma.agentSubmission.update({
      where: { id: agentId },
      data: { status: "REJECTED" as PluginStatus },
    });
  }

  async installAgent(agentId: string, organizationId: string, userId: string, config?: Record<string, unknown>) {
    const agent = await prisma.agentSubmission.findUnique({ where: { id: agentId } });
    if (!agent || agent.status !== "APPROVED") {
      throw new Error("Agent not available");
    }

    const installation = await prisma.pluginInstallation.create({
      data: {
        agentId,
        organizationId,
        userId,
        configuration: (config || {}) as any,
        enabled: true,
      },
    });

    await prisma.agentSubmission.update({
      where: { id: agentId },
      data: { totalInstalls: { increment: 1 } },
    });

    await eventBus.publish({
      type: "agent.installed",
      source: "jurisai:marketplace",
      data: { agentId, organizationId, installationId: installation.id },
      metadata: { userId, organizationId, version: 1 },
    });

    return installation;
  }

  async uninstallAgent(agentId: string, organizationId: string) {
    await prisma.pluginInstallation.deleteMany({
      where: { agentId, organizationId },
    });
  }

  async searchAgents(params: {
    query?: string;
    category?: AgentCategory;
    tags?: string[];
    status?: PluginStatus;
    pricingModel?: AgentPricingModel;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (params.query) {
      where.OR = [
        { name: { contains: params.query, mode: "insensitive" } },
        { description: { contains: params.query, mode: "insensitive" } },
        { tags: { hasSome: [params.query] } },
      ];
    }
    if (params.category) where.category = params.category;
    if (params.tags?.length) where.tags = { hasSome: params.tags };
    if (params.status) where.status = params.status;
    if (params.pricingModel) where.pricingModel = params.pricingModel;

    const [agents, total] = await Promise.all([
      prisma.agentSubmission.findMany({
        where,
        orderBy: [{ totalInstalls: "desc" }, { rating: "desc" }],
        take: params.limit || 20,
        skip: params.offset || 0,
        include: {
          user: { select: { name: true, image: true } },
          _count: { select: { installations: true, reviews: true } },
        },
      }),
      prisma.agentSubmission.count({ where }),
    ]);

    return { agents, total };
  }

  async reviewAgent(agentId: string, userId: string, rating: number, comment?: string) {
    const review = await prisma.agentReview.upsert({
      where: { agentId_userId: { agentId, userId } },
      create: { agentId, userId, rating, comment },
      update: { rating, comment },
    });

    const aggregate = await prisma.agentReview.aggregate({
      where: { agentId },
      _avg: { rating: true },
    });

    await prisma.agentSubmission.update({
      where: { id: agentId },
      data: { rating: aggregate._avg.rating || 0 },
    });

    return review;
  }

  async getAgentDetails(agentId: string) {
    return prisma.agentSubmission.findUnique({
      where: { id: agentId },
      include: {
        user: { select: { name: true, image: true } },
        reviews: { orderBy: { createdAt: "desc" }, take: 20 },
        _count: { select: { installations: true } },
      },
    });
  }

  async getOrganizationInstallations(organizationId: string) {
    return prisma.pluginInstallation.findMany({
      where: { organizationId, enabled: true },
      include: {
        agent: {
          select: { id: true, name: true, description: true, icon: true, category: true, pricingModel: true, version: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const marketplaceService = new MarketplaceService();
