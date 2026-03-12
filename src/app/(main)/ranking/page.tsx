import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Tira } from "@prisma/client";
import Link from "next/link";
import RankingTable from "@/components/RankingTable";
import ClubRankingTable from "@/components/ClubRankingTable";
import FechaFilter from "./FechaFilter";
import ClubFilter from "./ClubFilter";

export const dynamic = "force-dynamic";

const TIRAS: Tira[] = ["PRIMERA", "INTERMEDIA", "PRE_A", "PRE_B", "PRE_C", "PRE_D"];
const TIRA_LABELS: Record<Tira, string> = {
  PRIMERA: "Primera",
  INTERMEDIA: "Intermedia",
  PRE_A: "Pre A",
  PRE_B: "Pre B",
  PRE_C: "Pre C",
  PRE_D: "Pre D",
};

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ tira?: string; fecha?: string; club?: string }>;
}) {
  const [params, session] = await Promise.all([searchParams, auth()]);

  const isClubMode = params.tira === "clubes";
  const tira: Tira = TIRAS.includes(params.tira as Tira) ? (params.tira as Tira) : "PRIMERA";

  // ── Club ranking mode ──────────────────────────────────────────────────────
  if (isClubMode) {
    const [users, predGroups] = await Promise.all([
      prisma.user.findMany({
        where: { isAdmin: false },
        include: { club: true },
      }),
      prisma.prediction.groupBy({
        by: ["userId"],
        where: { points: { not: null } },
        _sum: { points: true },
      }),
    ]);

    const pointsMap = new Map(predGroups.map((g) => [g.userId, g._sum.points ?? 0]));

    // Aggregate by club
    const clubMap = new Map<
      number,
      { clubId: number; clubName: string; clubLogo: string; clubShortName: string; points: number; members: number }
    >();

    for (const user of users) {
      if (user.club.shortName === "OTRO") continue;
      const pts = pointsMap.get(user.id) ?? 0;
      const existing = clubMap.get(user.clubId);
      if (existing) {
        existing.points += pts;
        existing.members++;
      } else {
        clubMap.set(user.clubId, {
          clubId: user.clubId,
          clubName: user.club.name,
          clubLogo: user.club.logoPath,
          clubShortName: user.club.shortName,
          points: pts,
          members: 1,
        });
      }
    }

    const entries = Array.from(clubMap.values())
      .sort((a, b) => b.points - a.points)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));

    const userClubId = session ? session.user.clubId : null;

    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Ranking</h1>
        <Tabs active="clubes" />
        <div className="card mt-5">
          <ClubRankingTable entries={entries} userClubId={userClubId} />
        </div>
      </div>
    );
  }

  // ── Individual ranking mode ────────────────────────────────────────────────
  const selectedFechaId = params.fecha ? parseInt(params.fecha) : null;
  const selectedClubId = params.club ? parseInt(params.club) : null;

  const [fechas, clubs] = await Promise.all([
    prisma.fecha.findMany({
      where: { tira },
      orderBy: [{ season: "desc" }, { number: "asc" }],
    }),
    prisma.club.findMany({ where: { shortName: { not: "OTRO" } }, orderBy: { name: "asc" } }),
  ]);

  const users = await prisma.user.findMany({
    where: {
      isAdmin: false,
      ...(selectedClubId ? { clubId: selectedClubId } : {}),
    },
    include: { club: true },
  });

  const predGroups = await prisma.prediction.groupBy({
    by: ["userId"],
    where: {
      points: { not: null },
      ...(selectedFechaId
        ? { match: { fechaId: selectedFechaId } }
        : { match: { fecha: { tira } } }),
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
        clubLogo: user.club.logoPath,
        clubShortName: user.club.shortName,
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
      <Tabs active={tira} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 mt-5">
        <ClubFilter clubs={clubs} selected={selectedClubId} fechaId={selectedFechaId} tira={tira} />
        <FechaFilter fechas={fechas} selected={selectedFechaId} clubId={selectedClubId} tira={tira} />
      </div>

      <div className="card">
        <RankingTable entries={entries} currentUserId={currentUserId} />
      </div>
    </div>
  );
}

function Tabs({ active }: { active: string }) {
  const tabs = [
    ...TIRAS.map((t) => ({ key: t, label: TIRA_LABELS[t], href: `/ranking?tira=${t}` })),
    { key: "clubes", label: "Clubes", href: "/ranking?tira=clubes" },
  ];

  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab.key === active
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
