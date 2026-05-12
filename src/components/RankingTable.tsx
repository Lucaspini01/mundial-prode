"use client";

import TeamFlag from "./TeamFlag";

type RankingEntry = {
  rank: number;
  userId: number;
  username: string;
  favoriteTeamFlag: string | null;
  favoriteTeamShort: string | null;
  points: number;
  predictions: number;
};

const RANK_LABELS: Record<number, { icon: string; bar: string; text: string; height: string }> = {
  1: { icon: "🥇", bar: "bg-gradient-to-t from-amber-600 to-amber-300", text: "text-amber-400", height: "h-20" },
  2: { icon: "🥈", bar: "bg-gradient-to-t from-slate-500 to-slate-400", text: "text-slate-400", height: "h-14" },
  3: { icon: "🥉", bar: "bg-gradient-to-t from-amber-800 to-amber-600", text: "text-amber-600", height: "h-10" },
};

export default function RankingTable({
  entries,
  currentUserId,
}: {
  entries: RankingEntry[];
  currentUserId?: number | null;
}) {
  if (entries.length === 0) {
    return (
      <p className="text-center text-slate-500 py-8">
        No hay datos de ranking todavía.
      </p>
    );
  }

  const podium = entries.filter((e) => e.rank <= 3);

  return (
    <div>
      {/* Podio top 3 */}
      {podium.length > 0 && (
        <div className="flex items-end justify-center gap-6 mb-8 pb-6 border-b border-white/[0.08]">
          {[podium[1], podium[0], podium[2]].filter(Boolean).map((entry) => {
            const isMe = entry.userId === currentUserId;
            const r = RANK_LABELS[entry.rank];
            const flagSize = entry.rank === 1 ? 52 : 40;
            return (
              <div
                key={entry.userId}
                className={`flex flex-col items-center gap-1.5 ${entry.rank === 1 ? "scale-105" : ""}`}
              >
                <TeamFlag
                  flagCode={entry.favoriteTeamFlag}
                  shortName={entry.favoriteTeamShort ?? entry.username.slice(0, 3).toUpperCase()}
                  size={flagSize}
                  className={`ring-2 shadow-xl ${entry.rank === 1 ? "ring-amber-400/50 shadow-amber-500/20" : "ring-white/15"}`}
                  fallbackClassName="bg-white/10 text-slate-300 border border-white/20"
                />
                <span className={`text-xs font-bold truncate max-w-[72px] text-center ${isMe ? "text-green-400" : "text-slate-300"}`}>
                  {isMe ? "Vos" : entry.username}
                </span>
                <span className={`text-sm font-black ${r.text}`}>
                  {entry.points} pts
                </span>
                <div className={`w-16 flex items-start justify-center pt-2 rounded-t-xl ${r.bar} ${r.height}`}>
                  <span className="text-xl">{r.icon}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabla completa */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-white/[0.08]">
              <th className="pb-3 pr-3 pl-1">#</th>
              <th className="pb-3 pr-3">Bandera</th>
              <th className="pb-3 flex-1">Usuario</th>
              <th className="pb-3 text-right">Pred.</th>
              <th className="pb-3 text-right pl-4">Puntos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {entries.map((entry) => {
              const isMe = entry.userId === currentUserId;
              return (
                <tr
                  key={entry.userId}
                  className={`transition-colors duration-150 ${
                    isMe ? "bg-green-500/[0.07] hover:bg-green-500/10" : "hover:bg-white/[0.03]"
                  } ${entry.rank <= 3 ? "font-semibold" : ""}`}
                >
                  <td className="py-3 pr-3 pl-1">
                    {entry.rank <= 3 ? (
                      <span className="text-lg leading-none">{RANK_LABELS[entry.rank].icon}</span>
                    ) : (
                      <span className="text-sm text-slate-500 font-medium tabular-nums">{entry.rank}</span>
                    )}
                  </td>
                  <td className="py-3 pr-3">
                    <TeamFlag
                      flagCode={entry.favoriteTeamFlag}
                      shortName={entry.favoriteTeamShort ?? entry.username.slice(0, 3).toUpperCase()}
                      size={32}
                      className="ring-1 ring-white/10"
                      fallbackClassName="bg-white/10 text-slate-400 border border-white/15"
                    />
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${isMe ? "text-green-400 font-bold" : "text-slate-300"}`}>
                        {entry.username}
                      </span>
                      {isMe && (
                        <span className="text-[10px] bg-green-500/20 text-green-400 font-bold px-1.5 py-0.5 rounded-md">
                          vos
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-right text-slate-500 text-sm tabular-nums">
                    {entry.predictions}
                  </td>
                  <td className="py-3 text-right pl-4">
                    <span className="text-amber-400 font-black text-base tabular-nums">
                      {entry.points}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
