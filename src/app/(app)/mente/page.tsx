import { Suspense } from "react";
import { AsyncPageFallback } from "@/components/layout/async-page-fallback";
import { MentePageContent } from "@/components/mente/mente-page-content";

export const metadata = { title: "Mente" };

export default function MentePage() {
  return (
    <div>
      <header className="mb-4">
        <p className="silk">módulo · mente</p>
        <h1 className="font-dot font-black text-4xl">Mente</h1>
      </header>
      <Suspense fallback={<AsyncPageFallback />}>
        <MentePageContent />
      </Suspense>
    </div>
  );
}