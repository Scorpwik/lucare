"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  Calendar,
  Dumbbell,
  HeartPulse,
  Home,
  Moon,
  Settings,
  Sparkles,
  SprayCan,
  Stethoscope,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems: {
  href: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { href: "/hoy", label: "Hoy", icon: Home },
  { href: "/asistente", label: "Asistente", icon: Sparkles },
  { href: "/gimnasio", label: "Gimnasio", icon: Dumbbell },
  { href: "/cuidado", label: "Cuidado", icon: Stethoscope },
  { href: "/cuidado-personal", label: "Cuidado personal", icon: SprayCan },
  { href: "/cuerpo", label: "Cuerpo", icon: UserRound },
  { href: "/sueno-habitos", label: "Sueño y hábitos", icon: Moon },
  { href: "/mente", label: "Mente", icon: Brain },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-60 xl:w-64 2xl:w-[17.5rem] 3xl:w-[18.75rem] shrink-0 flex-col gap-1 p-3 xl:p-4 pt-[18px] border-r border-border/60">
      <div className="font-dot font-black text-[clamp(1.25rem,1rem+0.5vw,1.75rem)] leading-none mb-1 px-3">
        LuCare
      </div>
      <p className="silk px-3 mb-3">sistema · v0.2</p>
      <nav className="flex flex-col gap-0.5 xl:gap-1" aria-label="Secciones">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`) ||
            (item.href === "/gimnasio" && pathname.startsWith("/gym"));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 w-full rounded-[var(--pill)] px-3 py-2.5 text-[13px] xl:text-sm text-muted-foreground transition-colors min-h-[40px] xl:min-h-[44px]",
                active &&
                  "text-foreground bg-[color-mix(in_srgb,var(--led)_12%,var(--surface))] shadow-[var(--shadow-1)]",
              )}
            >
              <Icon className="size-4 xl:size-[1.125rem] shrink-0 opacity-80" aria-hidden />
              <span className="flex-1 truncate">{item.label}</span>
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
      <HeartPulse className="inline size-3 mr-1 opacity-60" aria-hidden />
      Ecuador · America/Guayaquil
    </div>
  );
}