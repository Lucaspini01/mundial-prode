"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import TeamFlag from "./TeamFlag";

type NavbarProps = {
  username: string;
  favoriteTeamFlag: string | null;
  favoriteTeamShort: string | null;
  isAdmin: boolean;
};

export default function Navbar({ username, favoriteTeamFlag, favoriteTeamShort, isAdmin }: NavbarProps) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Predicciones" },
    { href: "/ranking", label: "Ranking" },
    { href: "/ganadores", label: "Ganadores" },
    { href: "/historial", label: "Historial" },
    { href: "/selecciones", label: "Selecciones" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 bg-mundial-base/90 backdrop-blur-xl text-white shadow-lg border-b border-white/[0.08]">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">

        {/* Brand + Links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-russo text-base tracking-tight flex items-center gap-2 text-white">
            <span className="text-green-400 text-lg">⚽</span>
            <span>Mundial 2026</span>
          </Link>

          <div className="hidden sm:flex items-center gap-0.5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive(link.href)
                    ? "bg-green-500/15 text-green-400"
                    : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <>
                <span className="w-px h-4 bg-white/10 mx-1.5" />
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-150 ${
                    pathname.startsWith("/admin")
                      ? "bg-amber-400 text-mundial-base"
                      : "text-amber-400 hover:bg-amber-400/15 hover:text-amber-300"
                  }`}
                >
                  Admin
                </Link>
              </>
            )}
          </div>
        </div>

        {/* User section */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            {isAdmin && (
              <span className="text-[10px] font-black bg-amber-400 text-mundial-base px-1.5 py-0.5 rounded tracking-wide">
                ADMIN
              </span>
            )}
            <span className="text-sm text-slate-400 font-medium">{username}</span>
          </div>

          <span className="hidden sm:block w-px h-5 bg-white/10" />

          <TeamFlag
            flagCode={favoriteTeamFlag}
            shortName={favoriteTeamShort ?? username.slice(0, 3).toUpperCase()}
            size={32}
            className="ring-2 ring-green-500/30"
            fallbackClassName="bg-white/15 text-white border border-white/20"
          />

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-slate-500 hover:text-white transition-colors duration-150 font-medium cursor-pointer"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="sm:hidden border-t border-white/[0.06] px-4 pb-2 pt-1 flex gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 text-center px-2 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              isActive(link.href)
                ? "bg-green-500/15 text-green-400"
                : "text-slate-500 hover:bg-white/[0.06] hover:text-slate-300"
            }`}
          >
            {link.label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className={`flex-1 text-center px-2 py-1.5 rounded-lg text-sm font-bold transition-all duration-150 ${
              pathname.startsWith("/admin")
                ? "bg-amber-400 text-mundial-base"
                : "text-amber-400 hover:bg-amber-400/15"
            }`}
          >
            Admin
          </Link>
        )}
      </div>
    </nav>
  );
}
