"use client";

import { useState } from "react";
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
  pick: "HOME" | "AWAY" | "DRAW";
  margin: "MORE_1" | "LESS_1";
};

type Props = {
  match: Match;
  prediction?: PredictionInput;
  locked: boolean;
  onChange: (pred: PredictionInput) => void;
};

export default function MatchCard({ match, prediction, locked, onChange }: Props) {
  const pick = prediction?.pick;
  const margin = prediction?.margin;

  function setPick(p: "HOME" | "AWAY" | "DRAW") {
    onChange({ matchId: match.id, pick: p, margin: margin ?? "LESS_1" });
  }

  function setMargin(m: "MORE_1" | "LESS_1") {
    onChange({ matchId: match.id, pick: pick ?? "HOME", margin: m });
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

  const isPredicted = pick !== undefined;

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

      {/* Teams */}
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

        <div className="flex-shrink-0">
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
            <span className="text-xs font-black text-slate-700 tracking-widest">VS</span>
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

      <div className="border-t border-white/[0.06]" />

      {/* Pick */}
      <div>
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1.5 text-center">
          ¿Quién gana?
        </p>
        <div className="flex gap-1 p-1 bg-black/30 rounded-xl border border-white/[0.06]">
          {(["HOME", "DRAW", "AWAY"] as const).map((p) => {
            const label =
              p === "HOME"
                ? match.homeTeam.shortName
                : p === "AWAY"
                ? match.awayTeam.shortName
                : "Empate";
            const isSelected = pick === p;
            return (
              <label
                key={p}
                className={`flex-1 text-center text-xs py-2 rounded-lg font-medium transition-all duration-150 ${
                  locked ? "cursor-not-allowed" : "cursor-pointer"
                } ${
                  isSelected
                    ? "bg-green-500/20 text-green-300 font-bold ring-1 ring-green-500/30"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name={`pick-${match.id}`}
                  value={p}
                  checked={isSelected}
                  onChange={() => !locked && setPick(p)}
                  disabled={locked}
                  className="sr-only"
                />
                {label}
              </label>
            );
          })}
        </div>
      </div>

      {/* Margin */}
      <div>
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1.5 text-center">
          ¿Por cuánto?
        </p>
        <div className="flex gap-1 p-1 bg-black/30 rounded-xl border border-white/[0.06]">
          {(["LESS_1", "MORE_1"] as const).map((m) => {
            const label = m === "LESS_1" ? "≤ 1 gol" : "2+ goles";
            const isSelected = margin === m;
            return (
              <label
                key={m}
                className={`flex-1 text-center text-xs py-2 rounded-lg font-medium transition-all duration-150 ${
                  locked ? "cursor-not-allowed" : "cursor-pointer"
                } ${
                  isSelected
                    ? "bg-amber-500/20 text-amber-300 font-bold ring-1 ring-amber-500/30"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name={`margin-${match.id}`}
                  value={m}
                  checked={isSelected}
                  onChange={() => !locked && setMargin(m)}
                  disabled={locked}
                  className="sr-only"
                />
                {label}
              </label>
            );
          })}
        </div>
      </div>

      {locked && (
        <p className="text-[10px] text-center text-slate-600 italic">
          {match.isFinished ? "Partido finalizado" : "Predicciones cerradas"}
        </p>
      )}
    </div>
  );
}
