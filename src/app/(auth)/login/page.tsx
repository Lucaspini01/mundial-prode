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
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0c2461 0%, #1e3799 50%, #0a3d62 100%)" }}>

      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute w-full h-px bg-white" style={{ top: `${12 + i * 11}%` }} />
        ))}
      </div>

      <div className="relative w-full max-w-sm">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-800 rounded-2xl mb-4 shadow-lg text-3xl">
              ⚽
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mundial Prode 2026</h1>
            <p className="text-blue-700 text-sm font-semibold mt-0.5">FIFA World Cup 2026</p>
            <p className="text-slate-500 text-sm mt-2">Ingresá para hacer tus predicciones</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
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
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
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
              <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 border border-red-200 p-3 rounded-xl">
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
            <Link href="/forgot-password" className="text-sm text-blue-700 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <p className="text-center text-sm text-slate-500 mt-4">
            ¿No tenés cuenta?{" "}
            <Link href="/register" className="text-blue-700 font-bold hover:underline">
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
