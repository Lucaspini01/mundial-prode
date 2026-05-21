import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/predictions?fechaId=X
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fechaId = req.nextUrl.searchParams.get("fechaId");
  if (!fechaId) return NextResponse.json({ error: "Missing fechaId" }, { status: 400 });

  const predictions = await prisma.prediction.findMany({
    where: {
      userId: parseInt(session.user.id),
      match: { fechaId: parseInt(fechaId) },
    },
  });

  return NextResponse.json(predictions);
}

// POST /api/predictions  { predictions: [{matchId, homeGoals, awayGoals}] }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user.isApproved) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { predictions } = await req.json();
  if (!Array.isArray(predictions) || predictions.length === 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const userId = parseInt(session.user.id);
  let saved = 0;

  for (const pred of predictions) {
    const { matchId, homeGoals, awayGoals } = pred;

    if (typeof homeGoals !== "number" || typeof awayGoals !== "number") continue;
    if (homeGoals < 0 || awayGoals < 0) continue;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match || match.isFinished) continue;
    if (match.scheduledAt && new Date(match.scheduledAt) < new Date()) continue;

    await prisma.prediction.upsert({
      where: { userId_matchId: { userId, matchId } },
      update: { homeGoals, awayGoals },
      create: { userId, matchId, homeGoals, awayGoals },
    });

    saved++;
  }

  return NextResponse.json({ saved });
}
