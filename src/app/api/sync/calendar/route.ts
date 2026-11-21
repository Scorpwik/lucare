import { NextResponse } from "next/server";
import { env, isDemoMode } from "@/lib/env";
import { adminConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { syncAllForUser } from "@/lib/integrations/sync-user";

export async function POST(request: Request) {
  const secret = request.headers.get("x-sync-secret");
  if (env.INTEGRATION_SYNC_SECRET && secret !== env.INTEGRATION_SYNC_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const started = new Date().toISOString();

  if (isDemoMode()) {
    return NextResponse.json({
      ok: true,
      mode: "demo",
      started_at: started,
      finished_at: new Date().toISOString(),
      providers: ["google_calendar", "notion_deberes"],
      synced_events: 0,
      message: "Demo — sin sync remota",
    });
  }

  if (!adminConfigured()) {
    return NextResponse.json(
      { error: "Service role no configurado" },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const userId = typeof body.user_id === "string" ? body.user_id : null;

  if (userId) {
    const results = await syncAllForUser(userId);
    return NextResponse.json({
      ok: results.every((r) => r.ok),
      started_at: started,
      finished_at: new Date().toISOString(),
      results,
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const results = await syncAllForUser(user.id);
    return NextResponse.json({
      ok: results.every((r) => r.ok),
      started_at: started,
      finished_at: new Date().toISOString(),
      results,
    });
  }

  const admin = getAdminClient();
  const { data: links } = await admin
    .from("calendar_links")
    .select("user_id, provider, status")
    .eq("status", "connected");

  const userIds = [...new Set((links ?? []).map((l) => l.user_id as string))];
  const allResults = [];
  for (const id of userIds) {
    allResults.push(...(await syncAllForUser(id)));
  }

  return NextResponse.json({
    ok: allResults.length === 0 || allResults.some((r) => r.ok),
    started_at: started,
    finished_at: new Date().toISOString(),
    users: userIds.length,
    results: allResults,
  });
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    next_run: "POST con x-sync-secret o sesión de usuario",
  });
}