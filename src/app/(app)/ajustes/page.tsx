import { Suspense } from "react";
import { AsyncPageFallback } from "@/components/layout/async-page-fallback";
import { AjustesContent } from "./ajustes-content";

export const metadata = { title: "Ajustes" };

export default function AjustesPage({
  searchParams,
}: {
  searchParams: Promise<{ integration?: string; reason?: string }>;
}) {
  return (
    <div>
      <header className="mb-4">
        <p className="silk">módulo · ajustes</p>
        <h1 className="font-dot font-black text-4xl">Ajustes</h1>
      </header>

      <Suspense fallback={<AsyncPageFallback />}>
        <AjustesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
