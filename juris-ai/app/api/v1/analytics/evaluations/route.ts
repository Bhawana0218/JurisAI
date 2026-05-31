import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json([], { status: 401 });

    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "7d";
    const days = range === "24h" ? 1 : range === "30d" ? 30 : 7;
    const since = new Date(Date.now() - days * 86400000);

    const evaluations = await prisma.qualityEvaluation.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        gateAction: true,
        retrievalScore: true,
        citationScore: true,
        hallucinationRiskScore: true,
        legalCorrectnessScore: true,
        reasoningQualityScore: true,
        responseUsefulnessScore: true,
        status: true,
        createdAt: true,
        agentType: true,
      },
    }).catch(() => []);

    const mapped = evaluations.map((e) => ({
      ...e,
      overallScore:
        ((e.legalCorrectnessScore ?? 0) +
          (e.retrievalScore ?? 0) +
          (e.citationScore ?? 0)) /
        3,
      passedGate: e.gateAction === "ALLOW",
    }));

    return NextResponse.json(mapped);
  } catch {
    return NextResponse.json([]);
  }
}
