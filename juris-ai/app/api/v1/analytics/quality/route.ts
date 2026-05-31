import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "7d";
    const days = range === "24h" ? 1 : range === "30d" ? 30 : 7;
    const since = new Date(Date.now() - days * 86400000);

    const evaluations = await prisma.qualityEvaluation.findMany({
      where: { createdAt: { gte: since } },
      select: {
        retrievalScore: true,
        citationScore: true,
        hallucinationRiskScore: true,
        legalCorrectnessScore: true,
        gateAction: true,
        createdAt: true,
      },
      take: 200,
    }).catch(() => []);

    if (evaluations.length === 0) {
      return NextResponse.json({
        avgScore: null,
        hallucinationRate: null,
        citationAccuracy: null,
        evaluationsToday: 0,
      });
    }

    const avgScore =
      evaluations.reduce(
        (a, e) => a + ((e.legalCorrectnessScore ?? 0) + (e.retrievalScore ?? 0)) / 2,
        0
      ) / evaluations.length;

    const hallucinationRate =
      evaluations.reduce((a, e) => a + (e.hallucinationRiskScore ?? 0), 0) /
      evaluations.length;

    const citationAccuracy =
      evaluations.reduce((a, e) => a + (e.citationScore ?? 0), 0) /
      evaluations.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const evaluationsToday = evaluations.filter(
      (e) => new Date(e.createdAt) >= today
    ).length;

    return NextResponse.json({
      avgScore,
      hallucinationRate,
      citationAccuracy,
      evaluationsToday,
    });
  } catch {
    return NextResponse.json({
      avgScore: null,
      hallucinationRate: null,
      citationAccuracy: null,
      evaluationsToday: 0,
    });
  }
}
