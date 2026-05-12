"use client";

import { useState, useEffect, useCallback } from "react";
import TeamFlag from "@/components/TeamFlag";

type User = {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
  isApproved: boolean;
  createdAt: string;
  favoriteTeam: { flagCode: string | null; shortName: string | null; name: string } | null;
};

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pendientes" | "todos">("pendientes");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/usuarios");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function patch(id: number, data: object) {
    setActionLoading(id);
    await fetch(`/api/admin/usuarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await fetchUsers();
    setActionLoading(null);
  }

  async function deleteUser(id: number, username: string) {
    if (!confirm(`¿Eliminar al usuario "${username}"? Esta acción no se puede deshacer.`)) return;
    setActionLoading(id);
    await fetch(`/api/admin/usuarios/${id}`, { method: "DELETE" });
    await fetchUsers();
    setActionLoading(null);
  }

  const filtered = filter === "pendientes"
    ? users.filter((u) => !u.isApproved && !u.isAdmin)
    : users;

  const pendingCount = users.filter((u) => !u.isApproved && !u.isAdmin).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Gestioná accesos y aprobaciones
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="px-3 py-1 bg-amber-400/15 text-amber-400 border border-amber-400/30 rounded-full text-sm font-bold">
            {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["pendientes", "todos"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {f === "pendientes" ? `Pendientes (${pendingCount})` : "Todos"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {filter === "pendientes" ? "No hay usuarios pendientes." : "No hay usuarios."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="bg-gray-800 rounded-xl border border-white/10 p-4 flex items-center gap-4"
            >
              <TeamFlag
                flagCode={user.favoriteTeam?.flagCode ?? null}
                shortName={user.favoriteTeam?.shortName ?? user.username.slice(0, 3).toUpperCase()}
                size={36}
                fallbackClassName="bg-white/10 text-white border border-white/20"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white">{user.username}</span>
                  {user.isAdmin && (
                    <span className="text-[10px] font-black bg-amber-400 text-gray-900 px-1.5 py-0.5 rounded tracking-wide">
                      ADMIN
                    </span>
                  )}
                  {!user.isApproved && !user.isAdmin && (
                    <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                      PENDIENTE
                    </span>
                  )}
                  {user.isApproved && !user.isAdmin && (
                    <span className="text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded">
                      APROBADO
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-xs truncate">{user.email}</p>
                <p className="text-slate-600 text-xs">
                  {new Date(user.createdAt).toLocaleDateString("es-AR", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </p>
              </div>

              {/* Actions */}
              {!user.isAdmin && (
                <div className="flex items-center gap-2 shrink-0">
                  {!user.isApproved ? (
                    <button
                      onClick={() => patch(user.id, { isApproved: true })}
                      disabled={actionLoading === user.id}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                      Aprobar
                    </button>
                  ) : (
                    <button
                      onClick={() => patch(user.id, { isApproved: false })}
                      disabled={actionLoading === user.id}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-slate-300 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                      Revocar
                    </button>
                  )}
                  <button
                    onClick={() => patch(user.id, { isAdmin: true, isApproved: true })}
                    disabled={actionLoading === user.id}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-bold rounded-lg border border-amber-500/30 transition-colors disabled:opacity-50"
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => deleteUser(user.id, user.username)}
                    disabled={actionLoading === user.id}
                    className="px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-bold rounded-lg border border-red-500/20 transition-colors disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
