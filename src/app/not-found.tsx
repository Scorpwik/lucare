import Link from "next/link";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-6 space-y-4 text-center" raised>
        <p className="silk">404</p>
        <h1 className="font-dot font-black text-5xl">No está aquí</h1>
        <p className="text-sm text-muted-foreground">
          La ruta que buscas no existe en LuCare.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/hoy" className="inline-block">
            <LcButton type="button" variant="pri" className="w-full">
              Ir a Hoy
            </LcButton>
          </Link>
          <Link href="/login" className="inline-block">
            <LcButton type="button" variant="ghost" className="w-full">
              Iniciar sesión
            </LcButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}