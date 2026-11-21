import { fetchUpcomingGoogleEvents } from "@/lib/integrations/google-calendar";
import { fetchPendingNotionDeberes } from "@/lib/integrations/notion-deberes";
import { getValidGoogleAccessToken } from "@/lib/integrations/tokens";
import { getAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { notionConfigured } from "@/lib/env";
import type { IntegrationProvider } from "@/lib/types";

export type SyncResult = {
  provider: IntegrationProvider;
  ok: boolean;
  count: number;
  error?: string;
};

async function upsertCalendarLink(
  userId: string,
  provider: IntegrationProvider,
  patch: {
    status: "connected" | "error" | "syncing" | "disconnected";
    external_account_id?: string | null;
    last_synced_at?: string | null;
    metadata?: Record<string, unknown>;
  },
) {
  const admin = getAdminClient();
  await admin.from("calendar_links").upsert(
    {
      user_id: userId,
      provider,
      status: patch.status,
      external_account_id: patch.external_account_id ?? null,
      last_synced_at: patch.last_synced_at ?? null,
      metadata: patch.metadata ?? {},
    },
    { onConflict: "user_id,provider" },
  );
}

export async function syncGoogleCalendarForUser(userId: string): Promise<SyncResult> {
  if (!adminConfigured()) {
    return { provider: "google_calendar", ok: false, count: 0, error: "Admin no configurado" };
  }

  const admin = getAdminClient();
  const { data: link } = await admin
    .from("calendar_links")
    .select("status")
    .eq("user_id", userId)
    .eq("provider", "google_calendar")
    .maybeSingle();

  if (link?.status !== "connected" && link?.status !== "syncing" && link?.status !== "error") {
    const accessOnly = await getValidGoogleAccessToken(userId);
    if (!accessOnly) {
      return { provider: "google_calendar", ok: false, count: 0, error: "No conectado" };
    }
  }

  const access = await getValidGoogleAccessToken(userId);
  if (!access) {
    await upsertCalendarLink(userId, "google_calendar", {
      status: "disconnected",
      last_synced_at: null,
    });
    return { provider: "google_calendar", ok: false, count: 0, error: "Sin tokens" };
  }

  await upsertCalendarLink(userId, "google_calendar", { status: "syncing" });

  try {
    const now = new Date();
    const until = new Date(now);
    until.setDate(until.getDate() + 30);
    const events = await fetchUpcomingGoogleEvents(access, now, until);
    const admin = getAdminClient();
    const synced_at = new Date().toISOString();

    if (events.length > 0) {
      await admin.from("external_calendar_events").upsert(
        events.map((ev) => ({
          user_id: userId,
          provider: "google_calendar",
          external_id: ev.external_id,
          title: ev.title,
          starts_at: ev.starts_at,
          ends_at: ev.ends_at,
          source_label: "Google",
          raw: ev.raw,
          synced_at,
        })),
        { onConflict: "user_id,provider,external_id" },
      );
    }

    await admin
      .from("external_calendar_events")
      .delete()
      .eq("user_id", userId)
      .eq("provider", "google_calendar")
      .lt("starts_at", now.toISOString());

    await upsertCalendarLink(userId, "google_calendar", {
      status: "connected",
      last_synced_at: synced_at,
    });

    return { provider: "google_calendar", ok: true, count: events.length };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error de sync";
    await upsertCalendarLink(userId, "google_calendar", {
      status: "error",
      metadata: { last_error: message },
    });
    return { provider: "google_calendar", ok: false, count: 0, error: message };
  }
}

export async function syncNotionDeberesForUser(userId: string): Promise<SyncResult> {
  if (!notionConfigured()) {
    return {
      provider: "notion_deberes",
      ok: false,
      count: 0,
      error: "Notion no configurado en servidor",
    };
  }

  const supabase = await createClient();
  const { data: link } = await supabase
    .from("calendar_links")
    .select("status")
    .eq("user_id", userId)
    .eq("provider", "notion_deberes")
    .maybeSingle();

  if (link?.status !== "connected") {
    return { provider: "notion_deberes", ok: false, count: 0, error: "Notion no conectado" };
  }

  if (!adminConfigured()) {
    return { provider: "notion_deberes", ok: false, count: 0, error: "Admin no configurado" };
  }

  await upsertCalendarLink(userId, "notion_deberes", { status: "syncing" });

  try {
    const tasks = await fetchPendingNotionDeberes();
    const admin = getAdminClient();
    const synced_at = new Date().toISOString();

    if (tasks.length > 0) {
      await admin.from("external_notion_tasks").upsert(
        tasks.map((t) => ({
          user_id: userId,
          external_id: t.external_id,
          title: t.title,
          due_at: t.due_at,
          status: t.status,
          raw: t.raw,
          synced_at,
        })),
        { onConflict: "user_id,external_id" },
      );
    }

    await upsertCalendarLink(userId, "notion_deberes", {
      status: "connected",
      last_synced_at: synced_at,
    });

    return { provider: "notion_deberes", ok: true, count: tasks.length };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error Notion";
    await upsertCalendarLink(userId, "notion_deberes", {
      status: "error",
      metadata: { last_error: message },
    });
    return { provider: "notion_deberes", ok: false, count: 0, error: message };
  }
}

export async function syncAllForUser(userId: string): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  results.push(await syncGoogleCalendarForUser(userId));
  results.push(await syncNotionDeberesForUser(userId));
  return results;
}