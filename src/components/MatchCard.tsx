"use client";

import TeamFlag from "./TeamFlag";

type Team = { id: number; name: string; shortName: string; flagCode: string | null };

type Match = {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  scheduledAt: string | null;
  isFinished: boolean;
  homeScore: number | null;
  awayScore: number | null;
};

export type PredictionInput = {
  matchId: number;
  homeGoals: number | null;
  awayGoals: number | null;
  points?: number | null;
};

function pointsColor(pts: number): string {
  if (pts >= 10) return "text-green-400";
  if (pts >= 7) return "text-teal-400";
  if (pts >= 5) return "text-amber-400";
  return "text-red-400";
}

type Props = {
  match: Match;
  prediction?: PredictionInput;
  locked: boolean;
  onChange: (pred: PredictionInput) => void;
};

export default function MatchCard({ match, prediction, locked, onChange }: Props) {
  const homeGoals = prediction?.homeGoals ?? null;
  const awayGoals = prediction?.awayGoals ?? null;
  const isPredicted = homeGoals !== null && awayGoals !== null;

  function setHome(val: string) {
    const n = val === "" ? null : Math.max(0, Math.min(20, parseInt(val) || 0));
    onChange({ matchId: match.id, homeGoals: n, awayGoals: awayGoals });
  }

  function setAway(val: string) {
    const n = val === "" ? null : Math.max(0, Math.min(20, parseInt(val) || 0));
    onChange({ matchId: match.id, homeGoals: homeGoals, awayGoals: n });
  }

  const date = match.scheduledAt
    ? new Date(match.scheduledAt).toLocaleDateString("es-AR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div
      className={`card flex flex-col gap-3 transition-all duration-200 ${
        locked
          ? "opacity-60"
          : isPredicted
          ? "ring-1 ring-green-500/30 hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-0.5"
          : "hover:shadow-md hover:shadow-black/40 hover:-translate-y-0.5 ring-1 ring-transparent hover:ring-white/10"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between min-h-[24px]">
        {date ? (
          <span className="text-[11px] text-slate-500 font-medium">{date}</span>
        ) : (
          <span />
        )}
        {match.isFinished ? (
          <span className="text-[10px] font-black bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md uppercase tracking-widest">
            Final
          </span>
        ) : isPredicted && !locked ? (
          <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-md">
            ✓ Predicho
          </span>
        ) : null}
      </div>

      {/* Teams + score inputs */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <TeamFlag
            flagCode={match.homeTeam.flagCode}
            shortName={match.homeTeam.shortName}
            size={64}
            className="ring-1 ring-white/10 shadow-md"
            fallbackClassName="bg-white/10 text-slate-300 border border-white/15"
          />
          <span className="text-xs font-bold text-slate-300 text-center leading-tight max-w-[60px] truncate">
            {match.homeTeam.shortName}
          </span>
        </div>

        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          {match.isFinished && match.homeScore !== null && match.awayScore !== null ? (
            <div className="bg-black/40 rounded-2xl px-4 py-2.5 text-center shadow-md border border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white tabular-nums leading-none">
                  {match.homeScore}
                </span>
                <span className="text-slate-600 font-bold text-lg leading-none">–</span>
                <span className="text-2xl font-black text-white tabular-nums leading-none">
                  {match.awayScore}
                </span>
              </div>
              <p className="text-[9px] text-slate-600 font-semibold uppercase tracking-widest mt-0.5">
                Final
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                max={20}
                value={homeGoals ?? ""}
                onChange={(e) => !locked && setHome(e.target.value)}
                disabled={locked}
                placeholder="–"
                className={`w-10 h-10 text-center text-xl font-black rounded-xl border transition-all
                  [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
                  ${locked
                    ? "bg-white/[0.04] border-white/10 text-slate-600 cursor-not-allowed"
                    : homeGoals !== null
                    ? "bg-green-500/10 border-green-500/40 text-green-300 focus:outline-none focus:border-green-400"
                    : "bg-black/40 border-white/20 text-white placeholder-slate-700 focus:outline-none focus:border-white/40"
                  }`}
              />
              <span className="text-slate-600 font-bold text-lg leading-none">–</span>
              <input
                type="number"
                min={0}
                max={20}
                value={awayGoals ?? ""}
                onChange={(e) => !locked && setAway(e.target.value)}
                disabled={locked}
                placeholder="–"
                className={`w-10 h-10 text-center text-xl font-black rounded-xl border transition-all
                  [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
                  ${locked
                    ? "bg-white/[0.04] border-white/10 text-slate-600 cursor-not-allowed"
                    : awayGoals !== null
                    ? "bg-green-500/10 border-green-500/40 text-green-300 focus:outline-none focus:border-green-400"
                    : "bg-black/40 border-white/20 text-white placeholder-slate-700 focus:outline-none focus:border-white/40"
                  }`}
              />
            </div>
          )}
          {!match.isFinished && (
            <p className="text-[9px] text-slate-600 font-medium uppercase tracking-widest">
              Local · Visit.
            </p>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center gap-1.5">
          <TeamFlag
            flagCode={match.awayTeam.flagCode}
            shortName={match.awayTeam.shortName}
            size={64}
            className="ring-1 ring-white/10 shadow-md"
            fallbackClassName="bg-white/10 text-slate-300 border border-white/15"
          />
          <span className="text-xs font-bold text-slate-300 text-center leading-tight max-w-[60px] truncate">
            {match.awayTeam.shortName}
          </span>
        </div>
      </div>

      {match.isFinished ? (
        isPredicted ? (
          <div className="flex items-center justify-center gap-2 text-[11px]">
            <span className="text-slate-400">
              Pred: {homeGoals}–{awayGoals}
            </span>
            {prediction?.points !== null && prediction?.points !== undefined ? (
              <span className={`font-bold ${pointsColor(prediction.points)}`}>
                +{prediction.points}pts
              </span>
            ) : null}
          </div>
        ) : (
          <p className="text-[10px] text-center text-slate-600 italic">Sin predicción</p>
        )
      ) : locked ? (
        <p className="text-[10px] text-center text-slate-600 italic">Predicciones cerradas</p>
      ) : null}
    </div>
  );
}
