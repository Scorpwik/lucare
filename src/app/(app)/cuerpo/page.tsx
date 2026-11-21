import { Suspense } from "react";
import { AsyncPageFallback } from "@/components/layout/async-page-fallback";
import { PageHeading } from "@/components/layout/page-heading";
import { CuerpoPageContent } from "@/components/cuerpo/cuerpo-page-content";

export const metadata = { title: "Cuerpo" };

export default function CuerpoPage() {
  return (
    <div>
      <PageHeading module="módulo · cuerpo" title="Cuerpo" />
      <Suspense fallback={<AsyncPageFallback />}>
        <CuerpoPageContent />
      </Suspense>
    </div>
  );
}