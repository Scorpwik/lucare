"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const primaryTabs = [
  { href: "/hoy", label: "Hoy" },
  { href: "/gimnasio", label: "Gym" },
  { href: "/cuidado", label: "Piel" },
  { href: "/agenda", label: "Agenda" },
] as const;

const moreLinks = [
  { href: "/cuidado-personal", label: "Cuidado personal" },
  { href: "/cuerpo", label: "Cuerpo" },
  { href: "/sueno-habitos", label: "Sueño y hábitos" },
  { href: "/mente", label: "Mente" },
  { href: "/ajustes", label: "Ajustes" },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed left-3 right-3 bottom-3 z-40 grid grid-cols-5 h-[58px] rounded-[var(--pill)] border border-border bg-glass backdrop-blur-[var(--blur-strong)] saturate-[1.2] shadow-[var(--shadow-3)] px-1"
      aria-label="Navegación principal"
    >
      {primaryTabs.map((tab) => {
        const active =
          pathname === tab.href ||
          pathname.startsWith(`${tab.href}/`) ||
          (tab.href === "/gimnasio" && pathname.startsWith("/gym"));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center justify-center font-mono text-[9px] leading-tight text-muted-foreground rounded-[var(--pill)]",
              active && "text-foreground",
            )}
          >
            {active && (
              <span
                className="w-[7px] h-[7px] rounded-full bg-led mb-1 shadow-[0_0_8px_var(--led)]"
                aria-hidden
              />
            )}
            {tab.label}
          </Link>
        );
      })}
      <Sheet>
        <SheetTrigger
          className={cn(
            "flex flex-col items-center justify-center font-mono text-[9px] text-muted-foreground rounded-[var(--pill)]",
            moreLinks.some((l) => pathname.startsWith(l.href)) && "text-foreground",
          )}
        >
          <MoreHorizontal className="size-4 mb-0.5" aria-hidden />
          Más
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-[var(--r-xl)] max-h-[70dvh]">
          <SheetHeader>
            <SheetTitle className="font-dot">Más módulos</SheetTitle>
          </SheetHeader>
          <ul className="grid grid-cols-2 gap-2 py-4">
            {moreLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block w-full rounded-[var(--pill)] border border-border px-3 py-2.5 text-xs bg-surface"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </nav>
  );
}