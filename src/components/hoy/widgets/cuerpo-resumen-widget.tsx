import { fetchBodyMetrics } from "@/lib/data/body";
import { GlassCard } from "@/components/lucare/glass-card";

export async function CuerpoResumenWidget() {
  const metrics = await fetchBodyMetrics();
  const latest = metrics[0];

  return (
    <GlassCard className="p-4">
      <p className="silk mb-1">cuerpo</p>
      <p className="font-dot font-black text-4xl tabular-nums">
        {latest?.weight_kg ?? "—"}
        <span className="text-sm font-sans text-muted-foreground"> kg</span>
      </p>
      <p className="text-xs font-mono text-muted-foreground mt-1">
        Cintura {latest?.waist_cm ?? "—"} cm
      </p>
    </GlassCard>
  );
}