"use client";

import TeamFlag from "./TeamFlag";

type Team = { id: number; name: string; shortName: string; flagCode: string | null };

type Props = {
  teams: Team[];
  selected: number | null;
  onSelect: (id: number | null) => void;
};

export default function TeamSelector({ teams, selected, onSelect }: Props) {
  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`mb-3 w-full text-sm py-2 px-4 rounded-xl border-2 transition-all font-medium ${
          selected === null
            ? "border-green-500 bg-green-500/10 text-green-400"
            : "border-white/10 bg-white/[0.03] text-slate-500 hover:border-white/20 hover:text-slate-400"
        }`}
      >
        Sin predicción
      </button>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {teams.map((team) => (
          <button
            key={team.id}
            type="button"
            onClick={() => onSelect(team.id)}
            title={team.name}
            className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
              selected === team.id
                ? "border-green-500 bg-green-500/10 scale-105 shadow-lg shadow-green-500/10"
                : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
            }`}
          >
            <TeamFlag flagCode={team.flagCode} shortName={team.shortName} size={40} />
            <span className="text-xs text-center mt-1 leading-tight text-slate-400 font-medium">
              {team.shortName}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
