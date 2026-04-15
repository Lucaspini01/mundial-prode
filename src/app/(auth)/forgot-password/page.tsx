"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (res.ok) {
      setSent(true);
    } else {
      setError("Ocurrió un error. Intentá de nuevo.");
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
              🔑
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Olvidé mi contraseña</h1>
            <p className="text-slate-500 text-sm mt-2">
              Ingresá tu email y te mandamos un enlace para restablecerla.
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm">
                Si ese email está registrado, te enviamos un enlace. Revisá tu bandeja de entrada.
              </div>
              <Link href="/login" className="block text-blue-700 font-bold hover:underline text-sm">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
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
                {loading ? "Enviando..." : "Enviar enlace"}
              </button>

              <p className="text-center text-sm text-slate-500">
                <Link href="/login" className="text-blue-700 font-bold hover:underline">
                  Volver al inicio de sesión
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
