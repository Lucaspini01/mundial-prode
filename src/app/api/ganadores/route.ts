import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const fechas = await prisma.fecha.findMany({
    orderBy: [{ season: "asc" }, { number: "asc" }],
    include: {
      matches: {
        where: { isFinished: true },
        select: { id: true },
      },
    },
  });

  const fechasConResultados = fechas.filter((f) => f.matches.length > 0);

  const ganadores = await Promise.all(
    fechasConResultados.map(async (fecha) => {
      const top = await prisma.prediction.groupBy({
        by: ["userId"],
        where: {
          match: { fechaId: fecha.id, isFinished: true },
          points: { not: null },
        },
        _sum: { points: true },
        orderBy: { _sum: { points: "desc" } },
        take: 1,
      });

      if (!top.length || top[0]._sum.points === null) return null;

      const user = await prisma.user.findUnique({
        where: { id: top[0].userId },
        select: {
          username: true,
          favoriteTeam: { select: { flagCode: true, shortName: true } },
        },
      });

      if (!user) return null;

      return {
        fechaId: fecha.id,
        fechaNumber: fecha.number,
        phase: fecha.phase,
        season: fecha.season,
        winner: {
          username: user.username,
          points: top[0]._sum.points,
          flagCode: user.favoriteTeam?.flagCode ?? null,
          shortName: user.favoriteTeam?.shortName ?? null,
        },
      };
    })
  );

  return NextResponse.json(ganadores.filter(Boolean));
}
