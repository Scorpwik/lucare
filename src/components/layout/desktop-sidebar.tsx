"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/hoy", label: "Hoy" },
  { href: "/asistente", label: "Asistente" },
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
    <aside className="hidden lg:flex w-[196px] shrink-0 flex-col gap-1 p-3 pt-[18px]">
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
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex justify-between items-center w-full rounded-[var(--pill)] px-3 py-2 text-[13px] text-muted-foreground transition-colors",
                active &&
                  "text-foreground bg-[color-mix(in_srgb,var(--led)_12%,var(--surface))] shadow-[var(--shadow-1)]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <SidebarFoot />
    </aside>
  );
}

function SidebarFoot() {
  return (
    <div className="mt-auto px-2 pt-2 text-[10px] font-mono text-muted-foreground">
      Ecuador · America/Guayaquil
    </div>
  );
}