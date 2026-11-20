import { getServerDemoState } from "@/lib/demo-store";
import { formatTimeEc } from "@/lib/greetings";
import { GlassCard } from "@/components/lucare/glass-card";
import { DomainChip } from "@/components/lucare/domain-chip";

export const metadata = { title: "Agenda" };

export default function AgendaPage() {
  const events = getServerDemoState().externalEvents;

  return (
    <div>
      <header className="mb-4">
        <p className="silk">módulo · agenda</p>
        <h1 className="font-dot font-black text-4xl">Agenda</h1>
      </header>

      <IntegrationBadges />

      <GlassCard className="p-4 mt-4">
        <p className="silk mb-3">eventos · demo / sync</p>
        <ul>
          {events.map((ev) => (
            <li
              key={ev.id}
              className="flex gap-3 items-baseline py-2 border-b border-border text-sm"
            >
              <time className="font-mono text-xs text-muted-foreground w-20 tabular-nums">
                {formatTimeEc(ev.starts_at, {
                  weekday: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
              <span className="flex-1">{ev.title}</span>
              <DomainChip label={ev.source_label} />
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}

function IntegrationBadges() {
  const badges = [
    { label: "Google Calendar", on: false },
    { label: "Notion Deberes", on: false },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <span
          key={b.label}
          className={`font-mono text-[10px] tracking-wide border rounded-[var(--pill)] px-2 py-1 ${
            b.on
              ? "border-success text-success bg-[color-mix(in_srgb,var(--success)_12%,transparent)]"
              : "border-border text-muted-foreground"
          }`}
        >
          {b.label} · {b.on ? "conectado" : "sin configurar"}
        </span>
      ))}
    </div>
  );
}