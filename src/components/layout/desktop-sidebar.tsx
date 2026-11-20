
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
