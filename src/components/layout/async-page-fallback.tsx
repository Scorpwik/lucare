import { GlassCard } from "@/components/lucare/glass-card";
import { LoadingState } from "@/components/lucare/loading-state";

/** Fallback LuCare para secciones async bajo &lt;Suspense&gt; (datos con cookies/Supabase). */
export function AsyncPageFallback() {
  return (
    <GlassCard className="p-10 min-h-[220px] flex items-center justify-center rounded-[var(--r-lg)]">
      <LoadingState />
    </GlassCard>
  );
}