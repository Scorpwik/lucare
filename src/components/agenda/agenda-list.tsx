import { formatTimeEc } from "@/lib/greetings";
import type { AgendaEntry } from "@/lib/types";
import { DomainChip } from "@/components/lucare/domain-chip";
import { EmptyState } from "@/components/lucare/empty-state";

type Props = {
  entries: AgendaEntry[];
  compact?: boolean;
  wide?: boolean;
};

function formatDuration(starts: string, ends: string | null): string | null {
  if (!ends) return null;
  const mins = Math.round(
    (new Date(ends).getTime() - new Date(starts).getTime()) / 60_000,
  );
  if (mins < 1) return null;
  return mins >= 60
    ? `${Math.floor(mins / 60)} h ${mins % 60 ? `${mins % 60} min` : ""}`.trim()
    : `${mins} min`;
}

export function AgendaList({ entries, compact, wide }: Props) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="Agenda vacía"
        description="Añade citas en Cuidado o conecta Google Calendar / Notion en Ajustes."
      />
    );
  }

  return (
    <ul>
      {entries.map((ev) => {
        const duration = formatDuration(ev.starts_at, ev.ends_at);
        const endLabel =
          ev.ends_at && (wide || !compact)
            ? formatTimeEc(ev.ends_at, { hour: "2-digit", minute: "2-digit" })
            : null;
        return (
          <li
            key={`${ev.kind}-${ev.id}`}
            className={`flex gap-3 items-start py-2.5 border-b border-border text-sm lc-card-interactive rounded-[var(--r-sm)] px-1 -mx-1 hover:bg-surface/40 ${
              compact ? "gap-2" : ""
            }`}
          >
            <time
              className={`font-mono text-xs text-muted-foreground tabular-nums shrink-0 ${
                compact ? "w-14" : wide ? "w-28" : "w-20"
              }`}
            >
              {formatTimeEc(ev.starts_at, {
                ...(compact
                  ? { hour: "2-digit", minute: "2-digit" }
                  : {
                      weekday: wide ? "short" : undefined,
                      day: wide ? "numeric" : undefined,
                      month: wide ? "short" : undefined,
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
              })}
              {wide && endLabel ? ` – ${endLabel}` : null}
            </time>
            <div className="flex-1 min-w-0">
              <span className="lc-card-title font-medium block leading-snug">{ev.title}</span>
              {wide && duration ? (
                <span className="text-xs font-mono text-muted-foreground">{duration}</span>
              ) : null}
            </div>
            <DomainChip
              label={ev.source_label}
              domain={
                ev.kind === "notion_task"
                  ? "sleep"
                  : ev.kind === "appointment"
                    ? "pill"
                    : undefined
              }
            />
          </li>
        );
      })}
    </ul>
  );
}