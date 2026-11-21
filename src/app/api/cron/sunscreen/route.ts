import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/env";
import { adminConfigured, getAdminClient } from "@/lib/supabase/admin";
import { sendPushToUserWithClient } from "@/lib/push/send";

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET ?? process.env.INTEGRATION_SYNC_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (isDemoMode()) {
    return NextResponse.json({ ok: true, mode: "demo", processed: 0 });
  }

  if (!adminConfigured()) {
    return NextResponse.json({ error: "Admin no configurado" }, { status: 503 });
  }

  try {
    const supabase = getAdminClient();
    const now = new Date().toISOString();
    const { data: dueRows, error } = await supabase
      .from("user_sunscreen_settings")
      .select("user_id, next_due_at, last_notified_due_at")
      .not("next_due_at", "is", null)
      .lte("next_due_at", now);

    if (error) {
      const code = "code" in error ? String(error.code) : "";
      if (code === "42P01" || code === "PGRST204") {
        return NextResponse.json({ ok: true, skipped: "schema_pending", processed: 0 });
      }
      throw error;
    }

    let processed = 0;
    for (const row of dueRows ?? []) {
      if (
        row.last_notified_due_at &&
        row.next_due_at &&
        new Date(row.last_notified_due_at).getTime() >= new Date(row.next_due_at).getTime()
      ) {
        continue;
      }
      await sendPushToUserWithClient(supabase, row.user_id, {
        title: "LuCare · Bloqueador",
        body: "Toca reaplicar tu SPF.",
      });
      await supabase
        .from("user_sunscreen_settings")
        .update({ last_notified_due_at: row.next_due_at })
        .eq("user_id", row.user_id);
      processed += 1;
    }

    return NextResponse.json({ ok: true, processed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** pg_cron + pg_net (net.http_post) alternative. */
export const POST = GET;
