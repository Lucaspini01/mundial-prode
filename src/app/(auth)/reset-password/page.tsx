"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: form.password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Ocurrió un error.");
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
          Token inválido o faltante.
        </div>
        <Link href="/forgot-password" className="block text-blue-700 font-bold hover:underline text-sm">
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  return success ? (
    <div className="text-center space-y-4">
      <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm">
        Contraseña actualizada. Redirigiendo al inicio de sesión...
      </div>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nueva contraseña</label>
        <input
          className="input"
          type="password"
          placeholder="min. 6 caracteres"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required minLength={6}
          autoFocus
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

      {error && (
        <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 border border-red-200 p-3 rounded-xl">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 text-base"
      >
        {loading ? "Guardando..." : "Guardar nueva contraseña"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
              🔒
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Nueva contraseña</h1>
            <p className="text-slate-500 text-sm mt-2">Elegí una nueva contraseña para tu cuenta.</p>
          </div>

          <Suspense>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
