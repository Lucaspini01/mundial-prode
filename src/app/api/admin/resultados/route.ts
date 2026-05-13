import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculatePoints } from "@/lib/scoring";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { matchId, homeScore, awayScore } = await req.json();

  if (matchId === undefined || homeScore === undefined || awayScore === undefined) {
    return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  }

  if (homeScore < 0 || awayScore < 0) {
    return NextResponse.json({ error: "Los scores deben ser positivos." }, { status: 400 });
  }

  await prisma.match.update({
    where: { id: matchId },
    data: { homeScore, awayScore, isFinished: true },
  });

  const predictions = await prisma.prediction.findMany({
    where: { matchId },
  });

  let updated = 0;
  for (const pred of predictions) {
    const points =
      pred.homeGoals !== null && pred.awayGoals !== null
        ? calculatePoints(homeScore, awayScore, pred.homeGoals, pred.awayGoals)
        : 0;
    await prisma.prediction.update({
      where: { id: pred.id },
      data: { points },
    });
    updated++;
  }

  return NextResponse.json({ ok: true, updated });
}
