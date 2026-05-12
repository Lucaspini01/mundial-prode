"use client";

import { useState } from "react";
import MatchCard, { type PredictionInput } from "@/components/MatchCard";

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

type Props = {
  matches: Match[];
  initialPredictions: PredictionInput[];
  deadlinePassed: boolean;
  fechaId: number;
};

export default function PredictionsForm({ matches, initialPredictions, deadlinePassed, fechaId }: Props) {
  const [predictions, setPredictions] = useState<PredictionInput[]>(initialPredictions);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleChange(pred: PredictionInput) {
    setPredictions((prev) => {
      const exists = prev.findIndex((p) => p.matchId === pred.matchId);
      if (exists >= 0) {
        const next = [...prev];
        next[exists] = pred;
        return next;
      }
      return [...prev, pred];
    });
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    const openMatches = matches.filter((m) => !m.isFinished);
    const toSave = predictions.filter((p) => openMatches.some((m) => m.id === p.matchId));

    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ predictions: toSave }),
    });

    setSaving(false);

    if (!res.ok) {
      setError("Error al guardar. Intentá de nuevo.");
    } else {
      setSaved(true);
    }
  }

  const openMatches = matches.filter((m) => !m.isFinished);
  const predictedCount = openMatches.filter((m) => predictions.some((p) => p.matchId === m.id)).length;
  const allPredicted = predictedCount === openMatches.length && openMatches.length > 0;
  const progress = openMatches.length > 0 ? (predictedCount / openMatches.length) * 100 : 0;

  return (
    <div>
      {/* Progress bar */}
      {!deadlinePassed && openMatches.length > 0 && (
        <div className="mb-6 card py-3 px-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-semibold ${allPredicted ? "text-green-400" : "text-slate-300"}`}>
              {allPredicted ? "✓ Todos predichos" : `${predictedCount} de ${openMatches.length} predichos`}
            </span>
            <span className="text-sm font-bold tabular-nums text-slate-500">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                allPredicted ? "bg-green-400" : "bg-green-600"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Match grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {matches.map((match) => {
          const locked = deadlinePassed || match.isFinished;
          const pred = predictions.find((p) => p.matchId === match.id);
          return (
            <MatchCard
              key={match.id}
              match={match}
              prediction={pred}
              locked={locked}
              onChange={handleChange}
            />
          );
        })}
      </div>

      {/* Save button */}
      {!deadlinePassed && (
        <div className="flex flex-col items-center gap-3 pb-4">
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl">
              <span>⚠</span> {error}
            </div>
          )}
          {saved && (
            <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 px-4 py-2.5 rounded-xl font-semibold">
              <span>✓</span> Predicciones guardadas
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving || predictions.length === 0}
            className="btn-primary px-10 py-2.5 text-base"
          >
            {saving ? "Guardando..." : "Guardar predicciones"}
          </button>
          {!allPredicted && openMatches.length > 0 && (
            <p className="text-xs text-amber-500 font-medium">
              ⚠ {openMatches.length - predictedCount} partido{openMatches.length - predictedCount !== 1 ? "s" : ""} sin predicción
            </p>
          )}
        </div>
      )}
    </div>
  );
}
