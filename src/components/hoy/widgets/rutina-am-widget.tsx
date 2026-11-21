import { fetchSkincareSteps } from "@/lib/data/skincare";
import { GlassCard } from "@/components/lucare/glass-card";

export async function RutinaAmWidget() {
  const steps = await fetchSkincareSteps();
  const amSteps = steps.filter((s) => s.scheduled_time && s.scheduled_time < "12:00");
  const done = 0;
  const total = amSteps.length;

  return (
    <GlassCard className="p-4 sm:p-5 h-full" raised domain="skin">
      <div className="flex items-start justify-between gap-2">
        <p className="silk mb-1">rutina · mañana</p>
        <p className="font-mono text-xs text-muted-foreground">
          {done}/{total}
        </p>
      </div>
      {total > 0 ? (
        <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
          <div
            className="h-full bg-[var(--skin)]"
            style={{ width: `${total ? (done / total) * 100 : 0}%` }}
          />
        </div>
      ) : null}
      <p className="font-dot font-black lc-display tabular-nums">{total}</p>
      <ul className="mt-2 space-y-2 text-sm max-h-[min(200px,40vh)] overflow-y-auto">
        {amSteps.slice(0, 6).map((step) => (
          <li key={step.id} className="flex gap-2 border-b border-border pb-2 items-start">
            <span className="size-[18px] border border-border rounded-md shrink-0 mt-0.5 bg-surface" />
            <div className="min-w-0">
              <time className="font-mono text-xs text-muted-foreground">
                {step.scheduled_time?.slice(0, 5)}
              </time>
              <p className="leading-snug">{step.title}</p>
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}