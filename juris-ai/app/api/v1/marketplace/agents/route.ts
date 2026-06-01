import { NextRequest, NextResponse } from "next/server";
import type { AgentCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "";
    const category = url.searchParams.get("category") || undefined;
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const agents = await prisma.agentSubmission.findMany({
      where: {
        status: "APPROVED",
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] } : {}),
        ...(category ? { category: category as AgentCategory } : {}),
      },
      take: limit,
      skip: offset,
      orderBy: { totalInstalls: "desc" },
      select: {
        id: true, name: true, description: true, shortDescription: true,
        category: true, pricingModel: true, price: true, version: true,
        icon: true, rating: true, totalInstalls: true, tags: true,
        models: true, supportedLanguages: true, createdAt: true,
      },
    });

    const total = await prisma.agentSubmission.count({
      where: {
        status: "APPROVED",
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] } : {}),
        ...(category ? { category: category as AgentCategory } : {}),
      },
    });

    return NextResponse.json({ agents, total, limit, offset });
  } catch (error) {
    console.error("[marketplace/agents]", error);
    return NextResponse.json({ agents: [], total: 0, limit: 20, offset: 0 });
  }
}
