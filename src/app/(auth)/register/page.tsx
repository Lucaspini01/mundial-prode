"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TeamSelector from "@/components/TeamSelector";

type Team = { id: number; name: string; shortName: string; flagCode: string | null };

export default function RegisterPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState({ email: "", username: "", password: "", confirmPassword: "" });
  const [favoriteTeamId, setFavoriteTeamId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      body: JSON.stringify({
        email: form.email,
        username: form.username,
        password: form.password,
        favoriteTeamId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error al registrarse.");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: "linear-gradient(135deg, #0c2461 0%, #1e3799 50%, #0a3d62 100%)" }}>

      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute w-full h-px bg-white" style={{ top: `${12 + i * 11}%` }} />
        ))}
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-800 rounded-2xl mb-4 shadow-lg text-3xl">
              ⚽
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Crear cuenta</h1>
            <p className="text-blue-700 text-sm font-semibold mt-0.5">Mundial Prode · 2026</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-800 text-white text-xs font-black">1</span>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tus datos</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
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
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nombre de usuario <span className="font-normal text-slate-400">(se muestra en el ranking)</span>
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
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contraseña</label>
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
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirmar contraseña</label>
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
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-800 text-white text-xs font-black">2</span>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Equipo favorito <span className="normal-case font-normal text-slate-400">(opcional)</span>
                </h2>
              </div>
              <TeamSelector teams={teams} selected={favoriteTeamId} onSelect={setFavoriteTeamId} />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 border border-red-200 p-3 rounded-xl">
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
            <Link href="/login" className="text-blue-700 font-bold hover:underline">Ingresá</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
