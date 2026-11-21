import { Suspense } from "react";
import { AsyncPageFallback } from "@/components/layout/async-page-fallback";
import { PageHeading } from "@/components/layout/page-heading";
import { AjustesContent } from "./ajustes-content";

export const metadata = { title: "Ajustes" };

export default function AjustesPage({
  searchParams,
}: {
  searchParams: Promise<{ integration?: string; reason?: string }>;
}) {
  return (
    <div>
      <PageHeading module="módulo · ajustes" title="Ajustes" />

      <Suspense fallback={<AsyncPageFallback />}>
        <AjustesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
