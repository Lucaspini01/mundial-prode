import { prisma } from "@/lib/db";
import TeamFlag from "@/components/TeamFlag";

export const dynamic = "force-dynamic";

export default async function SeleccionesPage() {
  const teams = await prisma.team.findMany({
    include: { _count: { select: { users: { where: { isAdmin: false } } } } },
    orderBy: { name: "asc" },
  });

  const sorted = [...teams].sort((a, b) => b._count.users - a._count.users);
  const total = sorted.reduce((acc, t) => acc + t._count.users, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Selecciones</h1>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">
          Hinchas por selección
          <span className="ml-2 text-sm font-normal text-slate-500">({total} jugadores)</span>
        </h2>

        <div className="divide-y divide-slate-100">
          {sorted.map((team, i) => {
            const pct = total > 0 ? (team._count.users / total) * 100 : 0;

            return (
              <div key={team.id} className="flex items-center gap-4 py-3">
                <span className="w-6 text-right text-sm font-medium text-slate-400 shrink-0">
                  {i + 1}
                </span>

                <TeamFlag flagCode={team.flagCode} shortName={team.shortName} size={36} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm truncate">{team.name}</span>
                    <span className="text-sm font-semibold ml-3 shrink-0">
                      {team._count.users}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
