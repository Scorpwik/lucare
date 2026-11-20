"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export function MobileFab() {
  return (
    <Link
      href="/cuidado"
      className="lg:hidden fixed right-[18px] bottom-[80px] z-40 grid place-items-center w-[54px] h-[54px] rounded-[20px] bg-linear-to-b from-[#e4454e] to-primary text-primary-foreground font-dot font-black text-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_2px_0_#8a121c,0_10px_20px_rgba(197,30,42,0.35)] focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
      aria-label="Nuevo registro de cuidado"
    >
      <Plus className="size-6" strokeWidth={2.5} />
    </Link>
  );
}