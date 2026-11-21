import { Suspense } from "react";
import { AsyncPageFallback } from "@/components/layout/async-page-fallback";
import { PageHeading } from "@/components/layout/page-heading";
import { CuidadoPersonalPageContent } from "@/components/cuidado-personal/cuidado-personal-page-content";

export const metadata = { title: "Cuidado personal" };

export default function CuidadoPersonalPage() {
  return (
    <div>
      <PageHeading module="módulo · cuidado personal" title="Cuidado personal" />
      <Suspense fallback={<AsyncPageFallback />}>
        <CuidadoPersonalPageContent />
      </Suspense>
    </div>
  );
}