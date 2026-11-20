import { fetchSkincareSteps } from "@/lib/data/skincare";
import { GlassCard } from "@/components/lucare/glass-card";

export async function RutinaAmWidget() {
  const steps = await fetchSkincareSteps();
  const amSteps = steps.filter((s) => s.scheduled_time && s.scheduled_time < "12:00");

  return (
    <GlassCard className="p-4" raised>
      <p className="silk mb-1">rutina · mañana</p>
      <p className="font-dot font-black text-4xl tabular-nums">{amSteps.length}</p>
      <ul className="mt-3 space-y-2 text-sm">
        {amSteps.slice(0, 3).map((step) => (
          <li key={step.id} className="flex gap-2 border-b border-border pb-2">
            <time className="font-mono text-xs text-muted-foreground w-12 shrink-0">
              {step.scheduled_time?.slice(0, 5)}
            </time>
            <span>{step.title}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}