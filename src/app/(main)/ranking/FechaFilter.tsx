"use client";

import { useRouter } from "next/navigation";

type Fecha = { id: number; number: number; season: number };

export default function FechaFilter({
  fechas,
  selected,
  clubId,
  tira,
}: {
  fechas: Fecha[];
  selected: number | null;
  clubId: number | null;
  tira: string;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</label>
      <select
        className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm bg-white text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600/40 focus:border-green-600 transition-colors"
        value={selected ?? ""}
        onChange={(e) => {
          const params = new URLSearchParams();
          params.set("tira", tira);
          if (e.target.value) params.set("fecha", e.target.value);
          if (clubId) params.set("club", String(clubId));
          router.push(`/ranking?${params.toString()}`);
        }}
      >
        <option value="">Todas</option>
        {fechas.map((f) => (
          <option key={f.id} value={f.id}>
            Fecha {f.number} · {f.season}
          </option>
        ))}
      </select>
    </div>
  );
}
