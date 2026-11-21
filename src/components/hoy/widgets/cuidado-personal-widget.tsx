import {
  fetchPersonalCareRoutines,
  fetchPersonalCareSteps,
} from "@/lib/data/personal-care";
import { GlassCard } from "@/components/lucare/glass-card";

export async function CuidadoPersonalWidget() {
  const [routines, steps] = await Promise.all([
    fetchPersonalCareRoutines(),
    fetchPersonalCareSteps(),
  ]);
  const next = routines.find((r) => r.reminder_enabled) ?? routines[0];
  const routineSteps = next
    ? steps.filter((s) => s.routine_id === next.id).slice(0, 5)
    : [];

  return (
    <GlassCard className="p-4 sm:p-5 h-full" domain="skin">
      <p className="silk mb-1">cuidado personal</p>
      <p className="lc-card-title font-medium">{next?.name ?? "Sin rutinas"}</p>
      {next?.reminder_enabled && (
        <p className="font-mono text-xs text-muted-foreground mt-1">
          {next.reminder_start_time?.slice(0, 5)}–{next.reminder_end_time?.slice(0, 5)}
        </p>
      )}
      {routineSteps.length > 0 ? (
        <ul className="mt-3 space-y-1.5 text-sm">
          {routineSteps.map((s) => (
            <li key={s.id} className="flex gap-2 items-center">
              <span className="size-4 border border-border rounded-md shrink-0 bg-surface" />
              <span className="truncate">{s.title}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </GlassCard>
  );
}