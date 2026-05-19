"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function PendingPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.08) 0%, transparent 60%), linear-gradient(180deg, #060D1A 0%, #0B1628 100%)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-px bg-white/[0.04]"
            style={{ top: `${15 + i * 14}%` }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-sm text-center">
        <div className="bg-mundial-surface/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 border border-amber-500/30 rounded-2xl mb-5 text-3xl">
            ⏳
          </div>

          <h1 className="font-russo text-xl text-white tracking-tight mb-2">
            Cuenta pendiente
          </h1>
          <p className="text-amber-400 text-sm font-semibold mb-4">
            Aprobación requerida
          </p>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Tu cuenta fue creada correctamente. Compartile tu comprobante de
            pago a la persona que te invitó. Una vez confirmado el pago de la
            entrada se habilitará tu cuenta.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="btn-primary w-full py-2.5 text-sm"
            >
              Volver al inicio de sesión
            </button>
            <Link
              href="/login"
              className="block text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Usar otra cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
