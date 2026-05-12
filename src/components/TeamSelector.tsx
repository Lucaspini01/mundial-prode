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
      {/* Opción: sin equipo favorito */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`mb-3 w-full text-sm py-2 px-4 rounded-xl border-2 transition-all ${
          selected === null
            ? "border-blue-700 bg-blue-50 shadow-md"
            : "border-slate-200 hover:border-slate-400 text-slate-500"
        }`}
      >
        Sin equipo favorito
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
                ? "border-blue-700 bg-blue-50 shadow-md scale-105"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <TeamFlag flagCode={team.flagCode} shortName={team.shortName} size={40} />
            <span className="text-xs text-center mt-1 leading-tight text-gray-600 font-medium">
              {team.shortName}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
