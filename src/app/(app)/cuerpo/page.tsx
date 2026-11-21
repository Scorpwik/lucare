import { Suspense } from "react";
import { AsyncPageFallback } from "@/components/layout/async-page-fallback";
import { CuerpoPageContent } from "@/components/cuerpo/cuerpo-page-content";

export const metadata = { title: "Cuerpo" };

export default function CuerpoPage() {
  return (
    <div>
      <header className="mb-4">
        <p className="silk">módulo · cuerpo</p>
        <h1 className="font-dot font-black text-4xl">Cuerpo</h1>
      </header>
      <Suspense fallback={<AsyncPageFallback />}>
        <CuerpoPageContent />
      </Suspense>
    </div>
  );
}