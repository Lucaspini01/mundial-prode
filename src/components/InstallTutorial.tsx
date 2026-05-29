"use client";

import { useEffect, useState } from "react";

type Platform = "ios" | "android" | "desktop";

const STORAGE_KEY = "install-tutorial-dismissed-v1";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  const isIpadOS =
    navigator.platform === "MacIntel" && (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints! > 1;
  if (/iphone|ipad|ipod/.test(ua) || isIpadOS) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia?.("(display-mode: standalone)").matches;
  // iOS Safari uses navigator.standalone
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return Boolean(mq || iosStandalone);
}

export default function InstallTutorial() {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const p = detectPlatform();
    setPlatform(p);

    // Auto-show first time if not installed and not previously dismissed
    if (!isStandalone() && !localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  // Listen for global event to open the modal from anywhere (e.g. Navbar button)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-install-tutorial", handler);
    return () => window.removeEventListener("open-install-tutorial", handler);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  };

  if (!mounted || !open) return null;

  const steps = getSteps(platform);
  const title = getTitle(platform);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-tutorial-title"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4 sm:p-4"
      onClick={close}
    >
      <div
        className="relative w-full max-w-md bg-mundial-base border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center border-b border-white/[0.06]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-app.png"
            alt="Prode Curupa"
            className="w-20 h-20 mx-auto mb-3 rounded-2xl shadow-lg shadow-black/40"
          />
          <h2 id="install-tutorial-title" className="font-russo text-xl text-white tracking-tight">
            Agregá Prode Curupa a tu inicio
          </h2>
          <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
            Acceso directo desde tu pantalla, como una app.
          </p>
        </div>

        {/* Platform badge + steps */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {title}
            </span>
            <PlatformSwitcher current={platform} onChange={setPlatform} />
          </div>

          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="text-sm text-slate-300 leading-relaxed pt-0.5">
                  {step}
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-1 flex gap-2">
          <button
            onClick={close}
            className="flex-1 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-sm font-semibold transition-colors"
          >
            Más tarde
          </button>
          <button
            onClick={close}
            className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition-colors shadow-lg shadow-green-500/20"
          >
            ¡Listo!
          </button>
        </div>
      </div>
    </div>
  );
}

function PlatformSwitcher({
  current,
  onChange,
}: {
  current: Platform;
  onChange: (p: Platform) => void;
}) {
  const options: { key: Platform; label: string }[] = [
    { key: "ios", label: "iPhone" },
    { key: "android", label: "Android" },
    { key: "desktop", label: "PC" },
  ];
  return (
    <div className="flex gap-1 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
            current === o.key
              ? "bg-white/10 text-white"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function getTitle(p: Platform): string {
  if (p === "ios") return "Instrucciones para iPhone / iPad";
  if (p === "android") return "Instrucciones para Android";
  return "Instrucciones para PC";
}

function getSteps(p: Platform): React.ReactNode[] {
  if (p === "ios") {
    return [
      <>
        Abrí esta página en <strong className="text-white">Safari</strong> (no funciona desde otros navegadores).
      </>,
      <>
        Tocá el botón <strong className="text-white">Compartir</strong>{" "}
        <span className="inline-block align-middle ml-0.5 text-base">⬆️</span> en la barra inferior.
      </>,
      <>
        Deslizá y elegí <strong className="text-white">&quot;Agregar a pantalla de inicio&quot;</strong>.
      </>,
      <>
        Tocá <strong className="text-white">Agregar</strong> arriba a la derecha. ¡Listo!
      </>,
    ];
  }
  if (p === "android") {
    return [
      <>
        Abrí esta página en <strong className="text-white">Chrome</strong>.
      </>,
      <>
        Tocá el menú <strong className="text-white">⋮</strong> arriba a la derecha.
      </>,
      <>
        Elegí <strong className="text-white">&quot;Agregar a pantalla principal&quot;</strong> o{" "}
        <strong className="text-white">&quot;Instalar app&quot;</strong>.
      </>,
      <>
        Confirmá tocando <strong className="text-white">Agregar / Instalar</strong>. ¡Listo!
      </>,
    ];
  }
  return [
    <>
      En <strong className="text-white">Chrome / Edge</strong>, hacé clic en el ícono{" "}
      <strong className="text-white">⊕ Instalar</strong> a la derecha de la barra de direcciones.
    </>,
    <>
      Si no aparece, abrí el menú <strong className="text-white">⋮</strong> y elegí{" "}
      <strong className="text-white">&quot;Instalar Prode Curupa…&quot;</strong>.
    </>,
    <>
      Confirmá haciendo clic en <strong className="text-white">Instalar</strong>.
    </>,
    <>
      La app se abrirá en su propia ventana y aparecerá en tu escritorio.
    </>,
  ];
}
