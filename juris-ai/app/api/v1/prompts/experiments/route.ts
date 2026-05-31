import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json([], { status: 401 });
    // Prompt experiments feature - returns empty array until implemented
    return NextResponse.json([]);
  } catch {
    return NextResponse.json([]);
  }
}
