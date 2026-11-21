import { connection } from "next/server";
import { fetchAgendaEntries } from "@/lib/data/agenda";
import { fetchMedications } from "@/lib/data/medications";
import { fetchUserDisplayName } from "@/lib/data/profile";
import { getServerDemoState } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { dateInGuayaquil } from "@/lib/reminders";
import { SaludoWidgetView } from "./saludo-widget-view";

async function countPendingTasks(): Promise<number> {
  if (isDemoMode()) {
    const s = getServerDemoState();
    const notionDeberes = s.externalEvents.filter(
      (e) => e.provider === "notion_deberes",
    ).length;
    return s.tasks.filter((t) => !t.completed).length + notionDeberes;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;
  const [tasksRes, notionRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", false),
    supabase
      .from("external_notion_tasks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);
  return (tasksRes.count ?? 0) + (notionRes.count ?? 0);
}

export async function SaludoWidget() {
  await connection();
  const today = dateInGuayaquil();
  const [displayName, entries, meds, pendingTasks] = await Promise.all([
    fetchUserDisplayName(),
    fetchAgendaEntries({ limit: 40 }),
    fetchMedications(),
    countPendingTasks(),
  ]);

  const eventsToday = entries.filter((e) => {
    const k = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Guayaquil",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(e.starts_at));
    return k === today;
  }).length;

  const medsPending = meds.filter((m) => m.is_active && m.reminder_enabled).length;

  return (
    <SaludoWidgetView
      displayName={displayName}
      eventsToday={eventsToday}
      pendingTasks={pendingTasks}
      medsPending={medsPending}
    />
  );
}