"use client";

import Link from "next/link";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error.digest ?? error);
  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-6 space-y-4 text-center" raised>
        <p className="silk">error</p>
        <h1 className="font-dot font-black text-4xl">Algo falló</h1>
        <p className="text-sm text-muted-foreground">
          No pudimos cargar esta página. Puedes reintentar o volver al inicio.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <LcButton type="button" variant="pri" onClick={() => reset()}>
            Reintentar
          </LcButton>
          <Link href="/hoy" className="inline-block">
            <LcButton type="button" variant="ghost" className="w-full">
              Ir a Hoy
            </LcButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}