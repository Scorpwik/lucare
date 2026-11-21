import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/env";
import { deleteGoogleTokens } from "@/lib/integrations/tokens";
import { createClient } from "@/lib/supabase/server";
import { fetchIntegrationStatuses } from "@/lib/data/integrations";
import { syncGoogleCalendarForUser } from "@/lib/integrations/sync-user";

export async function GET() {
  const statuses = await fetchIntegrationStatuses();
  const google = statuses.find((s) => s.provider === "google_calendar");
  return NextResponse.json(google);
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

  await deleteGoogleTokens(user.id);
  await supabase.from("calendar_links").upsert(
    {
      user_id: user.id,
      provider: "google_calendar",
      status: "disconnected",
      last_synced_at: null,
      metadata: {},
    },
    { onConflict: "user_id,provider" },
  );

  await supabase
    .from("external_calendar_events")
    .delete()
    .eq("user_id", user.id)
    .eq("provider", "google_calendar");

  return NextResponse.json({ ok: true });
}

export async function POST() {
  if (isDemoMode()) {
    return NextResponse.json({
      ok: true,
      mode: "demo",
      message: "Sync simulado en demo",
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const result = await syncGoogleCalendarForUser(user.id);
  return NextResponse.json(result);
}