import { getServerDemoState } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/lucare/glass-card";

type PendingItem = { id: string; title: string; due_at: string | null };

async function fetchPendingItems(): Promise<PendingItem[]> {
  if (isDemoMode()) {
    return getServerDemoState()
      .tasks.filter((t) => !t.completed)
      .map((t) => ({ id: t.id, title: t.title, due_at: t.due_at ?? null }));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [tasksRes, notionRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, due_at")
      .eq("user_id", user.id)
      .eq("completed", false)
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(20),
    supabase
      .from("external_notion_tasks")
      .select("id, title, due_at")
      .eq("user_id", user.id)
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(20),
  ]);

  const items = [
    ...((tasksRes.data ?? []) as PendingItem[]),
    ...((notionRes.data ?? []) as PendingItem[]),
  ];
  return items.sort((a, b) => {
    if (!a.due_at) return 1;
    if (!b.due_at) return -1;
    return a.due_at.localeCompare(b.due_at);
  });
}

export async function TareasWidget() {
  const tasks = await fetchPendingItems();

  return (
    <GlassCard className="p-4">
      <p className="silk mb-1">tareas</p>
      <p className="font-dot font-black text-4xl tabular-nums">{tasks.length}</p>
      {tasks.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Sin tareas pendientes.</p>
      ) : (
        <ul className="mt-2 space-y-2 text-sm">
          {tasks.slice(0, 2).map((t) => (
            <li key={t.id} className="flex gap-2 items-start">
              <span className="size-[18px] border border-foreground rounded-md shrink-0 mt-0.5" />
              {t.title}
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
