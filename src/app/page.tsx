import { Suspense } from "react";
import { AsyncPageFallback } from "@/components/layout/async-page-fallback";
import { HomeRedirect } from "@/app/home-redirect";

export const instant = false;

export default function HomePage() {
  return (
    <Suspense fallback={<AsyncPageFallback />}>
      <HomeRedirect />
    </Suspense>
  );
}