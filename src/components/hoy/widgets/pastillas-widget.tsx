import { fetchMedications } from "@/lib/data/medications";
import { GlassCard } from "@/components/lucare/glass-card";

export async function PastillasWidget() {
  const meds = await fetchMedications().then((m) => m.filter((x) => x.is_active));
  const withSchedule = meds.filter(
    (m) => m.reminder_enabled && (m.reminder_times?.length || m.reminder_start_time),
  );
  const dosesToday = withSchedule.reduce(
    (acc, m) => acc + (m.reminder_times?.length ?? 1),
    0,
  );
  const takenEstimate = 0;
  const nextMed = withSchedule[0] ?? meds[0];
  const timeLabel =
    nextMed?.reminder_times?.[0]?.slice(0, 5) ??
    nextMed?.reminder_start_time?.slice(0, 5) ??
    "—";

  const ringPct =
    dosesToday > 0 ? Math.round((takenEstimate / dosesToday) * 100) : 0;

  return (
    <GlassCard className="p-4 sm:p-5 h-full" domain="pill">
      <p className="silk mb-2">medicación</p>
      <div className="flex items-center gap-4">
        <div
          className="relative size-16 shrink-0 rounded-full grid place-items-center"
          style={{
            background: `conic-gradient(var(--pillc) ${ringPct}%, color-mix(in srgb, var(--muted) 80%, transparent) 0)`,
          }}
          aria-hidden
        >
          <div className="size-[52px] rounded-full bg-surface flex flex-col items-center justify-center">
            <span className="font-dot font-black text-lg tabular-nums leading-none">
              {takenEstimate}/{dosesToday || meds.length}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground">dosis</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-dot font-black lc-display tabular-nums text-pillc leading-none">
            {timeLabel}
          </p>
          <p className="text-sm mt-1 truncate">{nextMed?.name ?? "Sin medicamentos"}</p>
          <p className="text-xs font-mono text-muted-foreground">
            {meds.length} activos · próxima toma
          </p>
        </div>
      </div>
    </GlassCard>
  );
}