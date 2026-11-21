"use client";

import Link from "next/link";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error.digest ?? error);
  return (
    <GlassCard className="p-6 space-y-4 max-w-lg mx-auto mt-8">
      <p className="silk">error</p>
      <h1 className="font-dot font-black text-4xl">Algo falló</h1>
      <p className="text-sm text-muted-foreground">
        Hubo un problema al cargar esta sección. Intenta de nuevo.
      </p>
      <div className="flex flex-wrap gap-2">
        <LcButton type="button" variant="pri" onClick={() => reset()}>
          Reintentar
        </LcButton>
        <Link href="/hoy">
          <LcButton type="button" variant="ghost">
            Ir a Hoy
          </LcButton>
        </Link>
      </div>
    </GlassCard>
  );
}