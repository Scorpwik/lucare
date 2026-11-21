import { NextResponse } from "next/server";
import { isDemoMode, notionConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { fetchIntegrationStatuses } from "@/lib/data/integrations";
import { syncNotionDeberesForUser } from "@/lib/integrations/sync-user";

export async function GET() {
  const statuses = await fetchIntegrationStatuses();
  const notion = statuses.find((s) => s.provider === "notion_deberes");
  return NextResponse.json(notion);
}

export async function POST() {
  if (isDemoMode()) {
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  if (!notionConfigured()) {
    return NextResponse.json({ error: "Notion no configurado en servidor" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  await supabase.from("calendar_links").upsert(
    {
      user_id: user.id,
      provider: "notion_deberes",
      status: "connected",
      metadata: {},
    },
    { onConflict: "user_id,provider" },
  );

  const result = await syncNotionDeberesForUser(user.id);
  return NextResponse.json(result);
}

export async function DELETE() {
  if (isDemoMode()) {
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  await supabase.from("calendar_links").upsert(
    {
      user_id: user.id,
      provider: "notion_deberes",
      status: "disconnected",
      last_synced_at: null,
      metadata: {},
    },
    { onConflict: "user_id,provider" },
  );

  await supabase.from("external_notion_tasks").delete().eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}