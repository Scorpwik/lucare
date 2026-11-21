import { Suspense } from "react";
import { AsyncPageFallback } from "@/components/layout/async-page-fallback";
import { PageHeading } from "@/components/layout/page-heading";
import { AgendaContent } from "./agenda-content";

export const metadata = { title: "Agenda" };

export default function AgendaPage() {
  return (
    <div>
      <PageHeading module="módulo · agenda" title="Agenda" />

      <Suspense fallback={<AsyncPageFallback />}>
        <AgendaContent />
      </Suspense>
    </div>
  );
}