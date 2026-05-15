import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Phase } from "@prisma/client";
import Link from "next/link";
import PredictionsForm from "./PredictionsForm";

const PHASES: Phase[] = ["GRUPOS", "DIECISEISAVOS", "OCTAVOS", "CUARTOS", "SEMIFINAL", "TERCER_PUESTO", "FINAL"];
const PHASE_LABELS: Record<Phase, string> = {
  GRUPOS: "Grupos",
  DIECISEISAVOS: "16avos",
  OCTAVOS: "Octavos",
  CUARTOS: "Cuartos",
  SEMIFINAL: "Semifinal",
  TERCER_PUESTO: "3er Puesto",
  FINAL: "Final",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ phase?: string; jornada?: string }>;
}) {
  const session = await auth();
  const { phase: phaseParam, jornada: jornadaParam } = await searchParams;
  const phase: Phase = PHASES.includes(phaseParam as Phase) ? (phaseParam as Phase) : "GRUPOS";

  // For GRUPOS: show all 3 jornadas as tabs, no isActive filter
  if (phase === "GRUPOS") {
    const gruposFechas = await prisma.fecha.findMany({
      where: { phase: "GRUPOS", season: 2026 },
      orderBy: { number: "asc" },
      include: {
        matches: {
          orderBy: { scheduledAt: "asc" },
          include: { homeTeam: true, awayTeam: true },
        },
      },
    });

    // Default to first jornada whose deadline hasn't passed, else jornada 1
    const jornadaNumber = jornadaParam ? parseInt(jornadaParam) : null;
    const fecha =
      gruposFechas.find((f) => f.number === jornadaNumber) ??
      gruposFechas.find((f) => !f.deadline || new Date(f.deadline) > new Date()) ??
      gruposFechas[0];

    const predictions = session && fecha
      ? await prisma.prediction.findMany({
          where: { userId: parseInt(session.user.id), match: { fechaId: fecha.id } },
        })
      : [];

    const deadlinePassed = fecha?.deadline && new Date(fecha.deadline) < new Date();

    return (
      <div>
        {/* Phase tabs */}
        <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
          {PHASES.map((p) => (
            <Link
              key={p}
              href={`/?phase=${p}`}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                p === phase
                  ? "bg-green-600 text-white shadow-lg shadow-green-500/20"
                  : "text-slate-500 hover:bg-white/[0.06] hover:text-slate-300"
              }`}
            >
              {PHASE_LABELS[p]}
            </Link>
          ))}
        </div>

        {gruposFechas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-4xl mb-5">
              ⚽
            </div>
            <h2 className="font-russo text-xl text-slate-300 mb-2">Sin fechas cargadas</h2>
            <p className="text-slate-500 text-sm max-w-xs">
              El administrador todavía no cargó las fechas de la fase de grupos.
            </p>
          </div>
        ) : (
          <>
            {/* Jornada buttons */}
            <div className="flex gap-2 mb-6">
              {gruposFechas.map((f) => {
                const isSelected = fecha?.id === f.id;
                const isPast = f.deadline && new Date(f.deadline) < new Date();
                return (
                  <Link
                    key={f.id}
                    href={`/?phase=GRUPOS&jornada=${f.number}`}
                    className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-150 border ${
                      isSelected
                        ? "bg-green-600 border-green-500 text-white shadow-lg shadow-green-500/25"
                        : isPast
                        ? "bg-white/[0.04] border-white/10 text-slate-600 hover:text-slate-400"
                        : "bg-white/[0.07] border-white/15 text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    Fecha {f.number}
                    {isPast && !isSelected && (
                      <span className="ml-1.5 text-slate-600 text-xs font-normal">✓</span>
                    )}
                  </Link>
                );
              })}
            </div>

            {fecha && (
              <>
                <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <h1 className="font-russo text-2xl text-white tracking-tight">
                      Fecha {fecha.number}
                      <span className="text-slate-500 font-sans font-normal text-xl ml-2">· Fase de Grupos</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {fecha.matches.length} partido{fecha.matches.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {fecha.deadline && (
                    <span
                      className={`text-sm font-semibold px-3 py-1.5 rounded-xl border ${
                        deadlinePassed
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {deadlinePassed
                        ? "⏰ Predicciones cerradas"
                        : `⏳ Cierra: ${new Date(fecha.deadline).toLocaleString("es-AR", { timeZone: "America/Buenos_Aires", hour12: false })}`}
                    </span>
                  )}
                </div>

                {fecha.matches.length === 0 ? (
                  <div className="text-center py-16 text-slate-500">
                    <p>No hay partidos cargados para esta jornada.</p>
                  </div>
                ) : (
                  <PredictionsForm
                    key={fecha.id}
                    matches={fecha.matches.map((m) => ({
                      id: m.id,
                      homeTeam: m.homeTeam,
                      awayTeam: m.awayTeam,
                      scheduledAt: m.scheduledAt?.toISOString() ?? null,
                      isFinished: m.isFinished,
                      homeScore: m.homeScore,
                      awayScore: m.awayScore,
                    }))}
                    initialPredictions={predictions.map((p) => ({
                      matchId: p.matchId,
                      homeGoals: p.homeGoals,
                      awayGoals: p.awayGoals,
                    }))}
                    deadlinePassed={!!deadlinePassed}
                    fechaId={fecha.id}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  }

  // Non-GRUPOS phases: existing behavior (show active fecha)
  const activeFechas = await prisma.fecha.findMany({
    where: { isActive: true },
    select: { phase: true },
  });
  const activePhases = new Set(activeFechas.map((f) => f.phase));

  const fecha = await prisma.fecha.findFirst({
    where: { isActive: true, phase },
    include: {
      matches: {
        orderBy: { scheduledAt: "asc" },
        include: { homeTeam: true, awayTeam: true },
      },
    },
  });

  const predictions = session && fecha
    ? await prisma.prediction.findMany({
        where: { userId: parseInt(session.user.id), match: { fechaId: fecha.id } },
      })
    : [];

  const deadlinePassed = fecha?.deadline && new Date(fecha.deadline) < new Date();

  return (
    <div>
      {/* Phase tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {PHASES.map((p) => {
          const isSelected = p === phase;
          const hasActive = activePhases.has(p);
          return (
            <Link
              key={p}
              href={`/?phase=${p}`}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isSelected
                  ? "bg-green-600 text-white shadow-lg shadow-green-500/20"
                  : hasActive
                  ? "bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white"
                  : "text-slate-600 hover:bg-white/[0.06] hover:text-slate-400"
              }`}
            >
              {PHASE_LABELS[p]}
              {hasActive && !isSelected && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-green-500 align-middle" />
              )}
            </Link>
          );
        })}
      </div>

      {!fecha ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-4xl mb-5">
            ⚽
          </div>
          <h2 className="font-russo text-xl text-slate-300 mb-2">No hay fecha activa</h2>
          <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
            El administrador todavía no activó una fecha para {PHASE_LABELS[phase]}.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-russo text-2xl text-white tracking-tight">
                Fecha {fecha.number}
                <span className="text-slate-500 font-sans font-normal text-xl ml-2">· {fecha.season}</span>
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {fecha.matches.length} partido{fecha.matches.length !== 1 ? "s" : ""}
              </p>
            </div>
            {fecha.deadline && (
              <span
                className={`text-sm font-semibold px-3 py-1.5 rounded-xl border ${
                  deadlinePassed
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                {deadlinePassed
                  ? "⏰ Predicciones cerradas"
                  : `⏳ Cierra: ${new Date(fecha.deadline).toLocaleString("es-AR", { timeZone: "America/Buenos_Aires", hour12: false })}`}
              </span>
            )}
          </div>

          {fecha.matches.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p>No hay partidos cargados para esta fecha.</p>
            </div>
          ) : (
            <PredictionsForm
              key={fecha.id}
              matches={fecha.matches.map((m) => ({
                id: m.id,
                homeTeam: m.homeTeam,
                awayTeam: m.awayTeam,
                scheduledAt: m.scheduledAt?.toISOString() ?? null,
                isFinished: m.isFinished,
                homeScore: m.homeScore,
                awayScore: m.awayScore,
              }))}
              initialPredictions={predictions.map((p) => ({
                matchId: p.matchId,
                homeGoals: p.homeGoals,
                awayGoals: p.awayGoals,
              }))}
              deadlinePassed={!!deadlinePassed}
              fechaId={fecha.id}
            />
          )}
        </>
      )}
    </div>
  );
}
