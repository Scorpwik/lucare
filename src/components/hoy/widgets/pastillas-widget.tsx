import { fetchMedications } from "@/lib/data/medications";
import { GlassCard } from "@/components/lucare/glass-card";

export async function PastillasWidget() {
  const meds = await fetchMedications();
  const nextMed = meds.find((m) => m.reminder_enabled);
  const timeLabel =
    nextMed?.reminder_times?.[0]?.slice(0, 5) ??
    nextMed?.reminder_start_time?.slice(0, 5) ??
    "—";

  return (
    <GlassCard className="p-4">
      <p className="silk mb-1">medicación</p>
      <p className="font-dot font-black text-4xl tabular-nums text-pillc">
        {timeLabel}
      </p>
      <p className="text-sm mt-2">{nextMed?.name ?? "Sin medicamentos"}</p>
      <p className="text-xs font-mono text-muted-foreground">
        {meds.length} activos
      </p>
    </GlassCard>
  );
}