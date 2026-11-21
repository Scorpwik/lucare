import { connection } from "next/server";
import { getServerDemoState } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import { fetchAppointments } from "@/lib/data/medications";
import { createClient } from "@/lib/supabase/server";
import type { AgendaEntry } from "@/lib/types";

function mergeAndSort(entries: AgendaEntry[]): AgendaEntry[] {
  return [...entries].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  );
}

export async function fetchAgendaEntries(options?: {
  limit?: number;
  from?: Date;
  to?: Date;
}): Promise<AgendaEntry[]> {
  await connection();
  const limit = options?.limit;
  const from = options?.from ?? new Date();
  const to = options?.to ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const appointmentEntries = async (): Promise<AgendaEntry[]> => {
    const appts = await fetchAppointments();
    return appts
      .filter((a) => {
        const t = new Date(a.starts_at).getTime();
        return t >= from.getTime() && t <= to.getTime();
      })
      .map(
        (a): AgendaEntry => ({
          id: a.id,
          title: a.title,
          starts_at: a.starts_at,
          ends_at: a.ends_at,
          source_label: "Cita",
          kind: "appointment",
        }),
      );
  };

  if (isDemoMode()) {
    const external = getServerDemoState().externalEvents
      .filter((ev) => {
        const t = new Date(ev.starts_at).getTime();
        return t >= from.getTime() && t <= to.getTime();
      })
      .map(
        (ev): AgendaEntry => ({
          id: ev.id,
          title: ev.title,
          starts_at: ev.starts_at,
          ends_at: ev.ends_at,
          source_label: ev.source_label,
          kind: ev.provider === "notion_deberes" ? "notion_task" : "event",
        }),
      );
    const sorted = mergeAndSort([...external, ...(await appointmentEntries())]);
    return limit ? sorted.slice(0, limit) : sorted;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [eventsRes, tasksRes] = await Promise.all([
    supabase
      .from("external_calendar_events")
      .select("id, title, starts_at, ends_at, source_label")
      .eq("user_id", user.id)
      .gte("starts_at", from.toISOString())
      .lte("starts_at", to.toISOString())
      .order("starts_at"),
    supabase
      .from("external_notion_tasks")
      .select("id, title, due_at, status")
      .eq("user_id", user.id)
      .not("due_at", "is", null)
      .gte("due_at", from.toISOString())
      .lte("due_at", to.toISOString())
      .order("due_at"),
  ]);

  const events: AgendaEntry[] = (eventsRes.data ?? []).map((ev) => ({
    id: ev.id,
    title: ev.title,
    starts_at: ev.starts_at,
    ends_at: ev.ends_at,
    source_label: ev.source_label ?? "Google",
    kind: "event",
  }));

  const tasks: AgendaEntry[] = (tasksRes.data ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    starts_at: t.due_at!,
    ends_at: null,
    source_label: "Notion",
    kind: "notion_task",
  }));

  const merged = mergeAndSort([
    ...events,
    ...tasks,
    ...(await appointmentEntries()),
  ]);
  return limit ? merged.slice(0, limit) : merged;
}