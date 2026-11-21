import { Suspense } from "react";
import { AsyncPageFallback } from "@/components/layout/async-page-fallback";
import { AgendaContent } from "./agenda-content";

export const metadata = { title: "Agenda" };

export default function AgendaPage() {
  return (
    <div>
      <header className="mb-4">
        <p className="silk">módulo · agenda</p>
        <h1 className="font-dot font-black text-4xl">Agenda</h1>
      </header>

      <Suspense fallback={<AsyncPageFallback />}>
        <AgendaContent />
      </Suspense>
    </div>
  );
}