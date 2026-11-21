import { formatTimeEc } from "@/lib/greetings";
import type { AgendaEntry } from "@/lib/types";
import { DomainChip } from "@/components/lucare/domain-chip";
import { EmptyState } from "@/components/lucare/empty-state";

type Props = {
  entries: AgendaEntry[];
  compact?: boolean;
};

export function AgendaList({ entries, compact }: Props) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="Agenda vacía"
        description="Conecta Google Calendar o Notion Deberes en Ajustes, o usa modo demo."
      />
    );
  }

  return (
    <ul>
      {entries.map((ev) => (
        <li
          key={`${ev.kind}-${ev.id}`}
          className={`flex gap-3 items-baseline py-2 border-b border-border text-sm ${
            compact ? "gap-2" : ""
          }`}
        >
          <time
            className={`font-mono text-xs text-muted-foreground tabular-nums shrink-0 ${
              compact ? "w-14" : "w-20"
            }`}
          >
            {formatTimeEc(ev.starts_at, {
              ...(compact
                ? { hour: "2-digit", minute: "2-digit" }
                : { weekday: "short", hour: "2-digit", minute: "2-digit" }),
            })}
          </time>
          <span className="flex-1">{ev.title}</span>
          <DomainChip
            label={ev.source_label}
            domain={ev.kind === "notion_task" ? "sleep" : undefined}
          />
        </li>
      ))}
    </ul>
  );
}