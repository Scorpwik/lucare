
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
    >
      {primaryTabs.map((tab) => {
        const active =
          pathname === tab.href ||
          pathname.startsWith(`${tab.href}/`) ||
          (tab.href === "/gimnasio" && pathname.startsWith("/gym"));
        return (
          <Link
            key={tab.href}
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
