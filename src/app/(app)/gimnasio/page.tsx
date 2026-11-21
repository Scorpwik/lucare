import { Suspense } from "react";
import { AsyncPageFallback } from "@/components/layout/async-page-fallback";
import { GimnasioPageContent } from "@/components/gimnasio/gimnasio-page-content";

export const metadata = { title: "Gimnasio" };

export default function GimnasioPage() {
  return (
    <div>
      <header className="mb-4">
        <p className="silk">módulo · gimnasio</p>
        <h1 className="font-dot font-black text-4xl">Gimnasio</h1>
      </header>
      <Suspense fallback={<AsyncPageFallback />}>
        <GimnasioPageContent />
      </Suspense>
    </div>
  );
}