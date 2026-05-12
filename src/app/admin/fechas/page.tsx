"use client";

import { useState, useEffect } from "react";

function toUTC(date: string, time: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours + 3, minutes)).toISOString();
}

function toAR(utc: string): string {
  return new Date(utc).toLocaleString("es-AR", { timeZone: "America/Buenos_Aires", hour12: false });
}

function utcToARInputs(utc: string): { date: string; time: string } {
  const d = new Date(new Date(utc).getTime() - 3 * 60 * 60 * 1000);
  const date = d.toISOString().slice(0, 10);
  const time = d.toISOString().slice(11, 16);
  return { date, time };
}

const PHASES = ["GRUPOS", "OCTAVOS", "CUARTOS", "SEMIFINAL", "TERCER_PUESTO", "FINAL"] as const;
type PhaseKey = (typeof PHASES)[number];

const PHASE_LABELS: Record<PhaseKey, string> = {
  GRUPOS: "Grupos",
  OCTAVOS: "Octavos",
  CUARTOS: "Cuartos",
  SEMIFINAL: "Semifinal",
  TERCER_PUESTO: "3er Puesto",
  FINAL: "Final",
};

type Fecha = {
  id: number;
  number: number;
  season: number;
  phase: PhaseKey;
  isActive: boolean;
  deadline: string | null;
  _count: { matches: number };
};

export default function FechasPage() {
  const [fechas, setFechas] = useState<Fecha[]>([]);
  const [form, setForm] = useState({
    number: "",
    season: "2026",
    phase: "GRUPOS" as PhaseKey,
    deadlineDate: "",
    deadlineTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    number: "",
    season: "",
    phase: "GRUPOS" as PhaseKey,
    deadlineDate: "",
    deadlineTime: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  async function load() {
    const r = await fetch("/api/admin/fechas");
    const data = await r.json();
    setFechas(data);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/fechas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: parseInt(form.number),
        season: parseInt(form.season),
        phase: form.phase,
        deadline: form.deadlineDate
          ? toUTC(form.deadlineDate, form.deadlineTime || "23:59")
          : null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Error al crear fecha.");
    } else {
      setForm({ number: "", season: "2026", phase: "GRUPOS", deadlineDate: "", deadlineTime: "" });
      load();
    }
  }

  function openEdit(f: Fecha) {
    const dl = f.deadline ? utcToARInputs(f.deadline) : { date: "", time: "" };
    setEditingId(f.id);
    setEditForm({
      number: String(f.number),
      season: String(f.season),
      phase: f.phase,
      deadlineDate: dl.date,
      deadlineTime: dl.time,
    });
    setEditError("");
  }

  async function handleEdit(fechaId: number) {
    setEditError("");
    setEditLoading(true);

    const res = await fetch(`/api/admin/fechas/${fechaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: parseInt(editForm.number),
        season: parseInt(editForm.season),
        phase: editForm.phase,
        deadline: editForm.deadlineDate
          ? toUTC(editForm.deadlineDate, editForm.deadlineTime || "23:59")
          : null,
      }),
    });

    setEditLoading(false);

    if (!res.ok) {
      const d = await res.json();
      setEditError(d.error || "Error al guardar.");
    } else {
      setEditingId(null);
      load();
    }
  }

  async function handleToggle(id: number, activate: boolean) {
    await fetch(`/api/admin/fechas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: activate }),
    });
    load();
  }

  async function handleDelete(id: number, number: number, phase: PhaseKey) {
    if (!confirm(`¿Borrar Fecha ${number} (${PHASE_LABELS[phase]})? Se eliminarán todos sus partidos y predicciones.`)) return;
    await fetch(`/api/admin/fechas/${id}`, { method: "DELETE" });
    load();
  }

  const grouped = PHASES.map((phase) => ({
    phase,
    items: fechas.filter((f) => f.phase === phase).sort((a, b) => a.number - b.number),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Fechas</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Crear fecha */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Nueva fecha</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temporada</label>
                <input
                  className="input"
                  type="number"
                  value={form.season}
                  onChange={(e) => setForm({ ...form, season: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fase</label>
              <select
                className="input"
                value={form.phase}
                onChange={(e) => setForm({ ...form, phase: e.target.value as PhaseKey })}
                required
              >
                {PHASES.map((p) => (
                  <option key={p} value={p}>{PHASE_LABELS[p]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de cierre (opcional)
              </label>
              <input
                className="input"
                type="date"
                value={form.deadlineDate}
                onChange={(e) => setForm({ ...form, deadlineDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de cierre <span className="text-gray-400">(por defecto 23:59)</span>
              </label>
              <input
                className="input"
                type="time"
                value={form.deadlineTime}
                onChange={(e) => setForm({ ...form, deadlineTime: e.target.value })}
              />
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Creando..." : "Crear fecha"}
            </button>
          </form>
        </div>

        {/* Lista de fechas agrupadas por fase */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Fechas ({fechas.length})</h2>
          {fechas.length === 0 && (
            <p className="text-gray-400 text-sm">No hay fechas creadas.</p>
          )}
          <div className="space-y-4">
            {grouped.map(({ phase, items }) => (
              <div key={phase}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {PHASE_LABELS[phase]}
                </p>
                <div className="space-y-2">
                  {items.map((f) => (
                    <div key={f.id}>
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          f.isActive ? "border-blue-500 bg-blue-50" : "border-gray-200"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-sm">
                            Fecha {f.number} · {f.season}
                            {f.isActive && (
                              <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                ACTIVA
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {f._count.matches} partidos ·{" "}
                            {f.deadline ? `Cierra ${toAR(f.deadline)}` : "Sin deadline"}
                          </p>
                        </div>
                        <div className="flex gap-1.5 flex-wrap justify-end">
                          <button
                            onClick={() => editingId === f.id ? setEditingId(null) : openEdit(f)}
                            className={`text-xs py-1 px-2.5 rounded-lg border transition-colors ${
                              editingId === f.id
                                ? "border-yellow-400 bg-yellow-50 text-yellow-700"
                                : "border-gray-300 text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            Editar
                          </button>
                          {f.isActive ? (
                            <button
                              onClick={() => handleToggle(f.id, false)}
                              className="btn-secondary text-xs py-1 px-2.5"
                            >
                              Desactivar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggle(f.id, true)}
                              className="btn-secondary text-xs py-1 px-2.5"
                            >
                              Activar
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(f.id, f.number, f.phase)}
                            className="text-xs py-1 px-2.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Borrar
                          </button>
                        </div>
                      </div>

                      {/* Panel de edición */}
                      {editingId === f.id && (
                        <div className="mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded-lg space-y-3">
                          <p className="text-xs font-semibold text-yellow-700">Editar fecha</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-500 mb-0.5 block">Número</label>
                              <input
                                className="input text-sm py-1"
                                type="number"
                                min="1"
                                value={editForm.number}
                                onChange={(e) => setEditForm({ ...editForm, number: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-0.5 block">Temporada</label>
                              <input
                                className="input text-sm py-1"
                                type="number"
                                value={editForm.season}
                                onChange={(e) => setEditForm({ ...editForm, season: e.target.value })}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-0.5 block">Fase</label>
                            <select
                              className="input text-sm py-1"
                              value={editForm.phase}
                              onChange={(e) => setEditForm({ ...editForm, phase: e.target.value as PhaseKey })}
                            >
                              {PHASES.map((p) => (
                                <option key={p} value={p}>{PHASE_LABELS[p]}</option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-500 mb-0.5 block">Fecha cierre</label>
                              <input
                                className="input text-sm py-1"
                                type="date"
                                value={editForm.deadlineDate}
                                onChange={(e) => setEditForm({ ...editForm, deadlineDate: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-0.5 block">Hora cierre</label>
                              <input
                                className="input text-sm py-1"
                                type="time"
                                value={editForm.deadlineTime}
                                onChange={(e) => setEditForm({ ...editForm, deadlineTime: e.target.value })}
                              />
                            </div>
                          </div>
                          {editError && <p className="text-red-600 text-xs">{editError}</p>}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(f.id)}
                              disabled={editLoading}
                              className="btn-primary text-xs py-1 px-3"
                            >
                              {editLoading ? "Guardando..." : "Guardar"}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="btn-secondary text-xs py-1 px-3"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
