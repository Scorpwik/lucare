import { NextResponse } from "next/server";
import { computeNextFireTime } from "@/lib/reminders";
import { isDemoMode } from "@/lib/env";
import { sendPushToUser } from "@/lib/push/send";
import { vapidConfigured } from "@/lib/push/vapid";
import { createClient } from "@/lib/supabase/server";

type ScheduleBody = {
  source_type?: string;
  source_id?: string;
  title?: string;
  body?: string;
  start_time?: string;
  end_time?: string;
  interval_minutes?: number;
  /** Si es true y VAPID está listo, envía push inmediato de prueba además de agendar. */
  notify_now?: boolean;
};

export async function POST(request: Request) {
  let payload: ScheduleBody;
  try {
    payload = (await request.json()) as ScheduleBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const {
    source_type = "custom",
    source_id = crypto.randomUUID(),
    title = "Recordatorio LuCare",
    body,
    start_time = "08:00",
    end_time = "22:00",
    interval_minutes = 60,
    notify_now = false,
  } = payload;

  const fireAt = computeNextFireTime({
    startTime: start_time,
    endTime: end_time,
    intervalMinutes: interval_minutes,
  });

  if (!fireAt) {
    return NextResponse.json({ error: "Ventana inválida" }, { status: 400 });
  }

  const row = {
    source_type,
    source_id,
    title,
    body: body ?? null,
    fire_at: fireAt.toISOString(),
  };

  if (isDemoMode()) {
    return NextResponse.json({
      ok: true,
      mode: "demo",
      scheduled: row,
      push: vapidConfigured() ? "available" : "vapid_pending",
    });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from("scheduled_reminders").insert({
        ...row,
        user_id: user.id,
      });
      if (error) throw error;
    }

    let push: Awaited<ReturnType<typeof sendPushToUser>> | undefined;
    if (notify_now && user && vapidConfigured()) {
      push = await sendPushToUser(user.id, { title, body: body ?? undefined });
    }

    return NextResponse.json({
      ok: true,
      scheduled: row,
      push,
      mode: user ? "authenticated" : "anonymous",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}