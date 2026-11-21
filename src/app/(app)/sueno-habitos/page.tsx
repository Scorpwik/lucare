import { Suspense } from "react";
import { AsyncPageFallback } from "@/components/layout/async-page-fallback";
import { SuenoHabitosPageContent } from "@/components/sueno-habitos/sueno-habitos-page-content";

export const metadata = { title: "Sueño y hábitos" };

export default function SuenoHabitosPage() {
  return (
    <div>
      <header className="mb-4">
        <p className="silk">módulo · sueño y hábitos</p>
        <h1 className="font-dot font-black text-4xl">Sueño y hábitos</h1>
      </header>
      <Suspense fallback={<AsyncPageFallback />}>
        <SuenoHabitosPageContent />
      </Suspense>
    </div>
  );
}