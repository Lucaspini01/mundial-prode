import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Phase } from "@prisma/client";
import Link from "next/link";
import PredictionsForm from "./PredictionsForm";

const PHASES: Phase[] = ["GRUPOS", "OCTAVOS", "CUARTOS", "SEMIFINAL", "TERCER_PUESTO", "FINAL"];
const PHASE_LABELS: Record<Phase, string> = {
  GRUPOS: "Grupos",
  OCTAVOS: "Octavos",
  CUARTOS: "Cuartos",
  SEMIFINAL: "Semifinal",
  TERCER_PUESTO: "3er Puesto",
  FINAL: "Final",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ phase?: string }>;
}) {
  const session = await auth();
  const { phase: phaseParam } = await searchParams;
  const phase: Phase = PHASES.includes(phaseParam as Phase) ? (phaseParam as Phase) : "GRUPOS";

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
            El administrador todavía no activó una fecha para {PHASE_LABELS[phase]}. Volvé pronto para hacer tus predicciones.
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
              <p className="text-sm mt-1 text-slate-600">Esperá que el admin agregue los partidos.</p>
            </div>
          ) : (
            <PredictionsForm
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
                pick: p.pick,
                margin: p.margin,
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
