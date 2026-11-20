import { fetchSleepLogs } from "@/lib/data/sleep-habits";
import { GlassCard } from "@/components/lucare/glass-card";

export async function SuenoWidget() {
  const logs = await fetchSleepLogs(3);
  const entry = logs[0];

  return (
    <GlassCard className="p-4">
      <p className="silk mb-1">sueño</p>
      <p className="font-dot font-black text-4xl tabular-nums text-sleep">
        {entry?.hours_slept ?? "—"} h
      </p>
      <p className="text-xs font-mono text-muted-foreground">
        Calidad {entry?.quality_score ?? "—"}
      </p>
    </GlassCard>
  );
}
