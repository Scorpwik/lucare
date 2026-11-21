"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
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
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-glass backdrop-blur-[var(--blur-strong)] pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegación principal"
    >
      <ul className="grid grid-cols-5 items-stretch">
        {primaryTabs.map((tab) => {
          const active =
            pathname === tab.href ||
            pathname.startsWith(`${tab.href}/`) ||
            (tab.href === "/gimnasio" && pathname.startsWith("/gym"));
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex flex-col items-center justify-center py-2 text-[10px] font-mono tracking-wide ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
        <li>
          <Sheet>
            <SheetTrigger className="flex flex-col items-center justify-center py-2 w-full text-[10px] font-mono tracking-wide text-muted-foreground">
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
        </li>
      </ul>
    </nav>
  );
}