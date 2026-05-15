"use client";

import { useState, useEffect, useCallback } from "react";
import TeamFlag from "@/components/TeamFlag";

type User = {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
  isApproved: boolean;
  hasPaid: boolean;
  invitedBy: string | null;
  createdAt: string;
  favoriteTeam: { flagCode: string | null; shortName: string | null; name: string } | null;
};

type SupportRequest = {
  id: number;
  email: string;
  message: string | null;
  isResolved: boolean;
  createdAt: string;
};

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pendientes" | "todos" | "solicitudes">("pendientes");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetResult, setResetResult] = useState<{ id: number; ok: boolean } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/usuarios");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }, []);

  const fetchSupportRequests = useCallback(async () => {
    const res = await fetch("/api/admin/support-requests");
    if (res.ok) setSupportRequests(await res.json());
  }, []);

  useEffect(() => { fetchUsers(); fetchSupportRequests(); }, [fetchUsers, fetchSupportRequests]);

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

  async function handleResetPassword(userId: number) {
    if (!newPassword || newPassword.length < 6) return;
    setResetLoading(true);
    const res = await fetch(`/api/admin/usuarios/${userId}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    setResetResult({ id: userId, ok: res.ok });
    setResetLoading(false);
    if (res.ok) {
      setTimeout(() => {
        setResetUserId(null);
        setNewPassword("");
        setResetResult(null);
      }, 2000);
    }
  }

  async function resolveRequest(id: number) {
    await fetch(`/api/admin/support-requests/${id}`, { method: "PATCH" });
    await fetchSupportRequests();
  }

  async function deleteRequest(id: number) {
    await fetch(`/api/admin/support-requests/${id}`, { method: "DELETE" });
    await fetchSupportRequests();
  }

  const filtered = filter === "pendientes"
    ? users.filter((u) => !u.isApproved && !u.isAdmin)
    : users;

  const pendingCount = users.filter((u) => !u.isApproved && !u.isAdmin).length;
  const unresolvedCount = supportRequests.filter((r) => !r.isResolved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Gestioná accesos y aprobaciones
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="px-3 py-1 bg-amber-400/15 text-amber-400 border border-amber-400/30 rounded-full text-sm font-bold">
              {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
            </span>
          )}
          {unresolvedCount > 0 && (
            <span className="px-3 py-1 bg-red-400/15 text-red-400 border border-red-400/30 rounded-full text-sm font-bold">
              {unresolvedCount} solicitud{unresolvedCount !== 1 ? "es" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["pendientes", "todos", "solicitudes"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {f === "pendientes"
              ? `Pendientes (${pendingCount})`
              : f === "solicitudes"
              ? `Solicitudes${unresolvedCount > 0 ? ` (${unresolvedCount})` : ""}`
              : "Todos"}
          </button>
        ))}
      </div>

      {/* Support requests tab */}
      {filter === "solicitudes" && (
        <div className="space-y-2">
          {supportRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No hay solicitudes.</div>
          ) : (
            supportRequests.map((req) => (
              <div
                key={req.id}
                className={`bg-gray-800 rounded-xl border p-4 ${
                  req.isResolved ? "border-white/5 opacity-50" : "border-red-500/20"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm">{req.email}</span>
                      {req.isResolved ? (
                        <span className="text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded">
                          RESUELTA
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded">
                          PENDIENTE
                        </span>
                      )}
                    </div>
                    {req.message && (
                      <p className="text-slate-400 text-xs mt-1">{req.message}</p>
                    )}
                    <p className="text-slate-600 text-xs mt-1">
                      {new Date(req.createdAt).toLocaleDateString("es-AR", {
                        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!req.isResolved && (
                      <button
                        onClick={() => resolveRequest(req.id)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Resolver
                      </button>
                    )}
                    <button
                      onClick={() => deleteRequest(req.id)}
                      className="px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-bold rounded-lg border border-red-500/20 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Users list */}
      {filter !== "solicitudes" && (
        <>
          {loading ? (
            <div className="text-center py-12 text-slate-500">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {filter === "pendientes" ? "No hay usuarios pendientes." : "No hay usuarios."}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((user) => (
                <div key={user.id} className="space-y-0">
                  <div
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
                        {user.hasPaid ? (
                          <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                            PAGÓ ✓
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded">
                            SIN PAGAR
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs truncate">{user.email}</p>
                      {user.invitedBy && (
                        <p className="text-slate-500 text-xs">
                          Invitado por: <span className="text-slate-400">{user.invitedBy}</span>
                        </p>
                      )}
                      <p className="text-slate-600 text-xs">
                        {new Date(user.createdAt).toLocaleDateString("es-AR", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      {!user.isAdmin && (
                        <>
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
                        </>
                      )}
                      <button
                        onClick={() => patch(user.id, { hasPaid: !user.hasPaid })}
                        disabled={actionLoading === user.id}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors disabled:opacity-50 ${
                          user.hasPaid
                            ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/30"
                            : "bg-red-500/15 hover:bg-red-500/25 text-red-400 border-red-500/20"
                        }`}
                      >
                        {user.hasPaid ? "✓ Pagó" : "✗ Sin pagar"}
                      </button>
                      <button
                        onClick={() => {
                          setResetUserId(resetUserId === user.id ? null : user.id);
                          setNewPassword("");
                          setResetResult(null);
                        }}
                        className="px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20 transition-colors"
                      >
                        Contraseña
                      </button>
                    </div>
                  </div>

                  {/* Inline reset password form */}
                  {resetUserId === user.id && (
                    <div className="bg-gray-900 rounded-b-xl border border-t-0 border-blue-500/20 px-4 py-3 flex items-center gap-2">
                      <input
                        type="text"
                        className="input text-sm flex-1"
                        placeholder="Nueva contraseña (mín. 6 caracteres)"
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setResetResult(null); }}
                        autoComplete="new-password"
                      />
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        disabled={newPassword.length < 6 || resetLoading}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 shrink-0"
                      >
                        {resetLoading ? "..." : "Guardar"}
                      </button>
                      {resetResult?.id === user.id && (
                        <span className={`text-xs font-bold shrink-0 ${resetResult.ok ? "text-green-400" : "text-red-400"}`}>
                          {resetResult.ok ? "Actualizada" : "Error"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
