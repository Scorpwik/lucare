import { Suspense } from "react";
import { AsyncPageFallback } from "@/components/layout/async-page-fallback";
import { PageHeading } from "@/components/layout/page-heading";
import { CuidadoPageContent } from "@/components/cuidado/cuidado-page-content";

export const metadata = { title: "Cuidado" };

export default function CuidadoPage() {
  return (
    <div>
      <PageHeading
        module="módulo · piel"
        title="Cuidado"
        description="Rutinas, medicamentos y citas con recordatorios."
      />
      <Suspense fallback={<AsyncPageFallback />}>
        <CuidadoPageContent />
      </Suspense>
    </div>
  );
}