"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TeamSelector from "@/components/TeamSelector";

type Team = { id: number; name: string; shortName: string; flagCode: string | null };

export default function RegisterPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState({ email: "", username: "", password: "", confirmPassword: "" });
  const [favoriteTeamId, setFavoriteTeamId] = useState<number | null>(null);
  const [invitedBy, setInvitedBy] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    fetch("/api/teams").then((r) => r.json()).then(setTeams);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, username: form.username, password: form.password, favoriteTeamId, invitedBy }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error al registrarse.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setRegistered(true);
  }

  const bgStyle = {
    background:
      "radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.08) 0%, transparent 60%), linear-gradient(180deg, #060D1A 0%, #0B1628 100%)",
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={bgStyle}>
        <div className="w-full max-w-sm text-center">
          <div className="bg-mundial-surface/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-2xl mb-5 text-3xl">
              ✅
            </div>
            <h1 className="font-russo text-xl text-white tracking-tight mb-2">¡Cuenta creada!</h1>
            <p className="text-green-400 text-sm font-semibold mb-4">Registro exitoso</p>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Tu cuenta fue registrada. Un administrador revisará tu solicitud y habilitará tu acceso una vez confirmado el pago de la entrada al prode.
            </p>
            <Link href="/login" className="btn-primary block w-full py-2.5 text-sm text-center">
              Ir al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={bgStyle}>
      {/* Background lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute w-full h-px bg-white/[0.04]" style={{ top: `${15 + i * 14}%` }} />
        ))}
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="bg-mundial-surface/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/80 border border-green-500/30 rounded-2xl mb-4 shadow-lg shadow-green-500/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mundial.png" alt="" style={{ width: 44, height: 44, objectFit: "contain" }} />
            </div>
            <h1 className="font-russo text-2xl text-white tracking-tight">Crear cuenta</h1>
            <p className="text-green-400 text-sm font-semibold mt-0.5">Prode Curupa · 2026</p>
            <p className="text-slate-500 text-sm mt-2">Completá tus datos para registrarte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-600 text-white text-xs font-black">1</span>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tus datos</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    autoFocus
                    autoComplete="email"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Nombre de usuario <span className="font-normal text-slate-500">(se muestra en el ranking)</span>
                  </label>
                  <input
                    className="input"
                    type="text"
                    placeholder="min. 3 caracteres"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required minLength={3} maxLength={20}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Contraseña</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="min. 6 caracteres"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Confirmar contraseña</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="repetí la contraseña"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-600 text-white text-xs font-black">2</span>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  ¿Para vos quién sale campeón?
                </h2>
              </div>
              <TeamSelector teams={teams} selected={favoriteTeamId} onSelect={setFavoriteTeamId} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-600 text-white text-xs font-black">3</span>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Invitacion
                </h2>
              </div>
              <input
                className="input w-full"
                type="text"
                placeholder="Nombre de la persona que te recomendó"
                value={invitedBy}
                onChange={(e) => setInvitedBy(e.target.value)}
                maxLength={100}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-green-400 font-bold hover:text-green-300 transition-colors">
              Ingresá
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
