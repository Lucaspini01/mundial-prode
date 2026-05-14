import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import RankingTable from "@/components/RankingTable";
import FechaFilter from "./FechaFilter";

export const dynamic = "force-dynamic";

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const [params, session] = await Promise.all([searchParams, auth()]);

  const selectedFechaId = params.fecha ? parseInt(params.fecha) : null;

  const fechas = await prisma.fecha.findMany({
    orderBy: [{ season: "desc" }, { number: "asc" }],
  });

  const users = await prisma.user.findMany({
    where: { isAdmin: false, isApproved: true },
    include: { favoriteTeam: true },
  });

  const predGroups = await prisma.prediction.groupBy({
    by: ["userId"],
    where: {
      points: { not: null },
      ...(selectedFechaId ? { match: { fechaId: selectedFechaId } } : {}),
    },
    _sum: { points: true },
    _count: { id: true },
  });

  const pointsMap = new Map(
    predGroups.map((g) => [g.userId, { points: g._sum.points ?? 0, predictions: g._count.id }])
  );

  const entries = users
    .map((user) => {
      const stats = pointsMap.get(user.id) ?? { points: 0, predictions: 0 };
      return {
        userId: user.id,
        username: user.username,
        favoriteTeamFlag: user.favoriteTeam?.flagCode ?? null,
        favoriteTeamShort: user.favoriteTeam?.shortName ?? null,
        points: stats.points,
        predictions: stats.predictions,
      };
    })
    .sort((a, b) => b.points - a.points)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  const currentUserId = session ? parseInt(session.user.id) : null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Ranking</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <FechaFilter fechas={fechas} selected={selectedFechaId} />
      </div>

      <div className="card">
        <RankingTable entries={entries} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
