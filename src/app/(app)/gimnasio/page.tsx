import { Suspense } from "react";
import { AsyncPageFallback } from "@/components/layout/async-page-fallback";
import { PageHeading } from "@/components/layout/page-heading";
import { GimnasioPageContent } from "@/components/gimnasio/gimnasio-page-content";

export const metadata = { title: "Gimnasio" };

export default function GimnasioPage() {
  return (
    <div>
      <PageHeading module="módulo · gimnasio" title="Gimnasio" />
      <Suspense fallback={<AsyncPageFallback />}>
        <GimnasioPageContent />
      </Suspense>
    </div>
  );
}