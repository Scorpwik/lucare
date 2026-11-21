import { Suspense } from "react";
import { AsyncPageFallback } from "@/components/layout/async-page-fallback";
import { PageHeading } from "@/components/layout/page-heading";
import { SuenoHabitosPageContent } from "@/components/sueno-habitos/sueno-habitos-page-content";

export const metadata = { title: "Sueño y hábitos" };

export default function SuenoHabitosPage() {
  return (
    <div>
      <PageHeading module="módulo · sueño y hábitos" title="Sueño y hábitos" />
      <Suspense fallback={<AsyncPageFallback />}>
        <SuenoHabitosPageContent />
      </Suspense>
    </div>
  );
}