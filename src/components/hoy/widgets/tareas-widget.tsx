import { connection } from "next/server";
import { getServerDemoState } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/lucare/glass-card";
import { DomainChip } from "@/components/lucare/domain-chip";

type PendingItem = {
  id: string;
  title: string;
  due_at: string | null;
  status?: string | null;
  source: "task" | "notion";
};

function relativeDue(iso: string | null, now: Date): string {
  if (!iso) return "Sin fecha";
  const due = new Date(iso);
  const diffDays = Math.round(
    (due.getTime() - now.setHours(0, 0, 0, 0)) / 86_400_000,
  );
  if (diffDays < 0) return `Atrasado ${Math.abs(diffDays)} d`;
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Mañana";
  return `En ${diffDays} d`;
}

function absoluteDue(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

async function fetchPendingItems(): Promise<PendingItem[]> {
  if (isDemoMode()) {
    const s = getServerDemoState();
    const tasks = s.tasks
      .filter((t) => !t.completed)
      .map((t) => ({
        id: t.id,
        title: t.title,
        due_at: t.due_at ?? null,
        status: null,
        source: "task" as const,
      }));
    const notion = s.externalEvents
      .filter((e) => e.provider === "notion_deberes")
      .map((e) => ({
        id: e.id,
        title: e.title,
        due_at: e.starts_at,
        status: "Pendiente",
        source: "notion" as const,
      }));
    return [...tasks, ...notion].sort((a, b) => {
      if (!a.due_at) return 1;
      if (!b.due_at) return -1;
      return a.due_at.localeCompare(b.due_at);
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [tasksRes, notionRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, due_at, module_source")
      .eq("user_id", user.id)
      .eq("completed", false)
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(20),
    supabase
      .from("external_notion_tasks")
      .select("id, title, due_at, status")
      .eq("user_id", user.id)
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(20),
  ]);

  const items: PendingItem[] = [
  ...(tasksRes.data ?? []).map((t) => ({
      id: t.id,
      title: t.title,
      due_at: t.due_at,
      status: t.module_source,
      source: "task" as const,
    })),
    ...(notionRes.data ?? []).map((t) => ({
      id: t.id,
      title: t.title,
      due_at: t.due_at,
      status: t.status,
      source: "notion" as const,
    })),
  ];
  return items.sort((a, b) => {
    if (!a.due_at) return 1;
    if (!b.due_at) return -1;
    return a.due_at.localeCompare(b.due_at);
  });
}

export async function TareasWidget() {
  await connection();
  const now = new Date();
  const tasks = await fetchPendingItems();
  const total = tasks.length;
  const doneDemo = isDemoMode()
    ? getServerDemoState().tasks.filter((t) => t.completed).length
    : 0;
  const progressDenom = total + doneDemo;
  const progressPct =
    progressDenom > 0 ? Math.round((doneDemo / progressDenom) * 100) : 0;

  return (
    <GlassCard className="p-4 sm:p-5 flex flex-col min-h-full h-full" domain="sleep">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="silk">tareas · deberes</p>
        <p className="font-dot font-black lc-display tabular-nums">{total}</p>
      </div>
      {progressDenom > 0 ? (
        <div className="mb-3">
          <div className="flex justify-between text-xs font-mono text-muted-foreground mb-1">
            <span>Progreso</span>
            <span>
              {doneDemo}/{progressDenom}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-[var(--sleep)] transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      ) : null}
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin tareas pendientes.</p>
      ) : (
        <ul className="space-y-2 text-sm flex-1 min-h-0 overflow-y-auto max-h-[min(320px,50vh)] @lg:max-h-none pr-0.5">
          {tasks.slice(0, 12).map((t) => {
            const rel = relativeDue(t.due_at, now);
            const overdue = t.due_at && new Date(t.due_at) < now;
            return (
              <li
                key={`${t.source}-${t.id}`}
                className={`flex gap-2 items-start rounded-[var(--r-sm)] border border-border px-2.5 py-2 bg-surface/50 ${
                  overdue ? "border-danger/40 bg-[color-mix(in_srgb,var(--danger)_6%,transparent)]" : ""
                }`}
              >
                <span className="size-[18px] border border-foreground rounded-md shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="lc-card-title font-medium leading-snug">{t.title}</p>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">
                    <span className={overdue ? "text-danger" : ""}>{rel}</span>
                    <span className="hidden @md:inline"> · {absoluteDue(t.due_at)}</span>
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <DomainChip
                      label={t.source === "notion" ? "Notion" : t.status ?? "LuCare"}
                      domain={t.source === "notion" ? "sleep" : undefined}
                    />
                    {t.status && t.source === "notion" ? (
                      <DomainChip label={t.status} />
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}