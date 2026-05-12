"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      setLoading(false);

      if (!res || (res as any).error) {
        setError("Email o contraseña incorrectos.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setLoading(false);
      setError("Email o contraseña incorrectos.");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.08) 0%, transparent 60%), linear-gradient(180deg, #060D1A 0%, #0B1628 100%)",
      }}
    >
      {/* Stadium lines decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-px bg-white/[0.04]"
            style={{ top: `${15 + i * 14}%` }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-sm">
        <div className="bg-mundial-surface/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600/80 border border-green-500/30 rounded-2xl mb-4 shadow-lg shadow-green-500/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mundial-inicio.png" alt="" style={{ width: 56, height: 56, objectFit: "contain" }} />
            </div>
            <h1 className="font-russo text-2xl text-white tracking-tight">Prode Curupa Mundial 2026</h1>
            <p className="text-green-400 text-sm font-semibold mt-0.5">FIFA World Cup 2026</p>
            <p className="text-slate-500 text-sm mt-2">Ingresá para hacer tus predicciones</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Email
              </label>
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

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Contraseña
              </label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link href="/forgot-password" className="text-sm text-green-400 hover:text-green-300 transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <p className="text-center text-sm text-slate-500 mt-4">
            ¿No tenés cuenta?{" "}
            <Link href="/register" className="text-green-400 font-bold hover:text-green-300 transition-colors">
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
