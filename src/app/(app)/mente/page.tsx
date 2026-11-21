import { Suspense } from "react";
import { AsyncPageFallback } from "@/components/layout/async-page-fallback";
import { PageHeading } from "@/components/layout/page-heading";
import { MentePageContent } from "@/components/mente/mente-page-content";

export const metadata = { title: "Mente" };

export default function MentePage() {
  return (
    <div>
      <PageHeading module="módulo · mente" title="Mente" />
      <Suspense fallback={<AsyncPageFallback />}>
        <MentePageContent />
      </Suspense>
    </div>
  );
}