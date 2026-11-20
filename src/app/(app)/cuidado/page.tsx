import { Suspense } from "react";
import { AsyncPageFallback } from "@/components/layout/async-page-fallback";
import { CuidadoPageContent } from "@/components/cuidado/cuidado-page-content";

export const metadata = { title: "Cuidado" };

export default function CuidadoPage() {
  return (
    <div>
      <header className="mb-4">
        <p className="silk">módulo · piel</p>
        <h1 className="font-dot font-black text-4xl">Cuidado</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Rutinas, medicamentos y citas con recordatorios.
        </p>
      </header>
      <Suspense fallback={<AsyncPageFallback />}>
        <CuidadoPageContent />
      </Suspense>
    </div>
  );
}