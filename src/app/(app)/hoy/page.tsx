import { Suspense } from "react";
import { AsyncPageFallback } from "@/components/layout/async-page-fallback";
import { PageHeading } from "@/components/layout/page-heading";
import { HoyPageContent } from "@/components/hoy/hoy-page-content";

export const metadata = { title: "Hoy" };

export default function HoyPage() {
  return (
    <div>
      <PageHeading module="módulo · hoy" title="Panel" />
      <Suspense fallback={<AsyncPageFallback />}>
        <HoyPageContent />
      </Suspense>
    </div>
  );
}