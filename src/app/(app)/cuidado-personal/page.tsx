import { Suspense } from "react";
import { AsyncPageFallback } from "@/components/layout/async-page-fallback";
import { CuidadoPersonalPageContent } from "@/components/cuidado-personal/cuidado-personal-page-content";

export const metadata = { title: "Cuidado personal" };

export default function CuidadoPersonalPage() {
  return (
    <div>
      <header className="mb-4">
        <p className="silk">módulo · cuidado personal</p>
        <h1 className="font-dot font-black text-4xl">Cuidado personal</h1>
      </header>
      <Suspense fallback={<AsyncPageFallback />}>
        <CuidadoPersonalPageContent />
      </Suspense>
    </div>
  );
}