import { formatTimeEc } from "@/lib/greetings";
import type { AgendaEntry } from "@/lib/types";
import { DomainChip } from "@/components/lucare/domain-chip";
import { EmptyState } from "@/components/lucare/empty-state";
import { dateInGuayaquil } from "@/lib/reminders";

type Props = {
  entries: AgendaEntry[];
  daysAhead?: number;
};

function dayKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function dayLabel(key: string, today: string): string {
  if (key === today) return "Hoy";
  const d = new Date(`${key}T12:00:00`);
  return new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

function formatRange(starts: string, ends: string | null): string {
  const start = formatTimeEc(starts, { hour: "2-digit", minute: "2-digit" });
  if (!ends) return start;
  const end = formatTimeEc(ends, { hour: "2-digit", minute: "2-digit" });
  const ms =
    new Date(ends).getTime() - new Date(starts).getTime();
  const mins = Math.max(0, Math.round(ms / 60_000));
  const dur =
    mins >= 60
      ? `${Math.floor(mins / 60)} h ${mins % 60 ? `${mins % 60} min` : ""}`.trim()
      : `${mins} min`;
  return `${start}–${end} · ${dur}`;
}

function sourceDomain(
  ev: AgendaEntry,
): "sleep" | "pill" | undefined {
  if (ev.kind === "notion_task") return "sleep";
  if (ev.kind === "appointment") return "pill";
  return undefined;
}

function calendarBarColor(ev: AgendaEntry): string {
  if (ev.kind === "appointment") return "var(--pillc)";
  if (ev.kind === "notion_task") return "var(--sleep)";
  return "var(--primary)";
}

export function AgendaTimeline({ entries, daysAhead = 4 }: Props) {
  const today = dateInGuayaquil();
  const todayMs = new Date(`${today}T00:00:00`).getTime();
  const lastDay = new Date(todayMs + (daysAhead - 1) * 86_400_000);
  const lastKey = dayKey(lastDay.toISOString());

  const inWindow = entries.filter((e) => {
    const k = dayKey(e.starts_at);
    return k >= today && k <= lastKey;
  });

  const byDay = new Map<string, AgendaEntry[]>();
  for (const e of inWindow) {
    const k = dayKey(e.starts_at);
    const list = byDay.get(k) ?? [];
    list.push(e);
    byDay.set(k, list);
  }

  const days: string[] = [];
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(todayMs + i * 86_400_000);
    days.push(dayKey(d.toISOString()));
  }

  if (inWindow.length === 0) {
    return (
      <EmptyState
        title="Agenda vacía"
        description="Añade citas en Cuidado o conecta Google Calendar / Notion en Ajustes."
      />
    );
  }

  return (
    <div className="space-y-4 @md:space-y-3">
      {days.map((day) => {
        const items = byDay.get(day) ?? [];
        if (items.length === 0) return null;
        return (
          <section key={day}>
            <h3 className="silk mb-2">{dayLabel(day, today)}</h3>
            <ul className="space-y-0">
              {items.map((ev) => (
                <li
                  key={`${ev.kind}-${ev.id}`}
                  className="relative flex gap-3 py-2.5 border-b border-border last:border-0 pl-3 @md:pl-4"
                >
                  <span
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full opacity-80"
                    style={{ background: calendarBarColor(ev) }}
                    aria-hidden
                  />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="lc-card-title font-medium leading-snug">{ev.title}</p>
                    <p className="font-mono text-xs text-muted-foreground tabular-nums @md:inline">
                      {formatRange(ev.starts_at, ev.ends_at)}
                    </p>
                    <p className="hidden @md:block text-xs text-muted-foreground line-clamp-2">
                      {ev.kind === "notion_task"
                        ? "Deber pendiente · revisa en Notion"
                        : ev.kind === "appointment"
                          ? "Cita médica registrada en LuCare"
                          : "Evento de calendario"}
                    </p>
                  </div>
                  <DomainChip
                    label={ev.source_label}
                    domain={sourceDomain(ev)}
                    className="shrink-0 hidden @sm:inline-flex"
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}