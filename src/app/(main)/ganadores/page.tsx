import { prisma } from "@/lib/db";
import TeamFlag from "@/components/TeamFlag";

const PHASE_LABELS: Record<string, string> = {
  GRUPOS: "Fase de Grupos",
  OCTAVOS: "Octavos de Final",
  CUARTOS: "Cuartos de Final",
  SEMIFINAL: "Semifinales",
  TERCER_PUESTO: "Tercer Puesto",
  FINAL: "Final",
};

async function getGanadores() {
  const fechas = await prisma.fecha.findMany({
    orderBy: [{ season: "asc" }, { number: "asc" }],
    include: {
      matches: { where: { isFinished: true }, select: { id: true } },
    },
  });

  const fechasConResultados = fechas.filter((f) => f.matches.length > 0);

  const results = await Promise.all(
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
        phase: fecha.phase as string,
        season: fecha.season,
        winner: {
          username: user.username,
          points: top[0]._sum.points as number,
          flagCode: user.favoriteTeam?.flagCode ?? null,
          shortName: user.favoriteTeam?.shortName ?? null,
        },
      };
    })
  );

  return results.filter(Boolean) as NonNullable<(typeof results)[number]>[];
}

export default async function GanadoresPage() {
  const ganadores = await getGanadores();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Ganadores</h1>
        <p className="text-slate-400 text-sm mt-1">
          Mejores jugadores por fecha
        </p>
      </div>

      {ganadores.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🏆</div>
          <p className="text-slate-400 text-lg font-medium">
            Todavía no hay resultados
          </p>
          <p className="text-slate-600 text-sm mt-2">
            Los ganadores se mostrarán una vez que se carguen resultados de partidos.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {ganadores.map((g, index) => (
            <div
              key={g.fechaId}
              className="bg-mundial-surface/60 border border-white/10 rounded-2xl p-5 flex items-center gap-5"
            >
              {/* Trophy icon */}
              <div
                className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  index === 0
                    ? "bg-yellow-400/15 border border-yellow-400/30"
                    : index === 1
                    ? "bg-slate-400/15 border border-slate-400/30"
                    : index === 2
                    ? "bg-amber-700/15 border border-amber-700/30"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🏆"}
              </div>

              {/* Fecha info */}
              <div className="flex-1 min-w-0">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  {PHASE_LABELS[g.phase] ?? g.phase} · Jornada {g.fechaNumber}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <TeamFlag
                    flagCode={g.winner.flagCode}
                    shortName={g.winner.shortName ?? g.winner.username.slice(0, 3).toUpperCase()}
                    size={28}
                    fallbackClassName="bg-white/10 text-white border border-white/20"
                  />
                  <span className="text-white font-bold text-base">{g.winner.username}</span>
                </div>
              </div>

              {/* Points */}
              <div className="shrink-0 text-right">
                <span className="text-2xl font-black text-green-400">{g.winner.points}</span>
                <p className="text-slate-500 text-xs">pts</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
