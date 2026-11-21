import { Suspense } from "react";
import { AsyncPageFallback } from "@/components/layout/async-page-fallback";
import { HoyPageContent } from "@/components/hoy/hoy-page-content";

export const metadata = { title: "Hoy" };

export default function HoyPage() {
  return (
    <Suspense fallback={<AsyncPageFallback />}>
      <HoyPageContent />
    </Suspense>
  );
}