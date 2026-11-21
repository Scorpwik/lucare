import { fetchPersonalCareRoutines } from "@/lib/data/personal-care";
import { GlassCard } from "@/components/lucare/glass-card";

export async function CuidadoPersonalWidget() {
  const routines = await fetchPersonalCareRoutines();
  const next = routines.find((r) => r.reminder_enabled) ?? routines[0];

  return (
    <GlassCard className="p-4">
      <p className="silk mb-1">cuidado personal</p>
      <p className="font-medium text-sm">{next?.name ?? "Sin rutinas"}</p>
      {next?.reminder_enabled && (
        <p className="font-mono text-xs text-muted-foreground mt-2">
          {next.reminder_start_time?.slice(0, 5)}–{next.reminder_end_time?.slice(0, 5)}
        </p>
      )}
    </GlassCard>
  );
}