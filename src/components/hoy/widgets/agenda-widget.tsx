import { getServerDemoState } from "@/lib/demo-store";
import { formatTimeEc } from "@/lib/greetings";
import { GlassCard } from "@/components/lucare/glass-card";
import { DomainChip } from "@/components/lucare/domain-chip";

export function AgendaWidget() {
  const events = getServerDemoState().externalEvents.slice(0, 3);

  return (
    <GlassCard className="p-4 col-span-full lg:col-span-2">
      <p className="silk mb-2">agenda · sincronizada</p>
      <ul className="space-y-2">
        {events.map((ev) => (
          <li
            key={ev.id}
            className="flex gap-2 items-baseline border-b border-border pb-2 text-sm"
          >
            <time className="font-mono text-xs text-muted-foreground w-14 shrink-0 tabular-nums">
              {formatTimeEc(ev.starts_at, { hour: "2-digit", minute: "2-digit" })}
            </time>
            <span className="flex-1">{ev.title}</span>
            <DomainChip label={ev.source_label} domain="sleep" />
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}