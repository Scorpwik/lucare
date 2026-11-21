"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/hoy", label: "Hoy" },
  { href: "/gimnasio", label: "Gimnasio" },
  { href: "/cuidado", label: "Cuidado" },
  { href: "/cuidado-personal", label: "Cuidado personal" },
  { href: "/cuerpo", label: "Cuerpo" },
  { href: "/sueno-habitos", label: "Sueño y hábitos" },
  { href: "/mente", label: "Mente" },
  { href: "/agenda", label: "Agenda" },
  { href: "/ajustes", label: "Ajustes" },
] as const;

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-border bg-surface/50 px-3 py-4 min-h-dvh">
      <div className="font-dot font-black text-[22px] leading-none mb-1 px-3">
        LuCare
      </div>
      <p className="silk px-3 mb-3">sistema · v0.2</p>
      <nav className="flex flex-col gap-1" aria-label="Secciones">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`) ||
            (item.href === "/gimnasio" && pathname.startsWith("/gym"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-[var(--pill)] px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}