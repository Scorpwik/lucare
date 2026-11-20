import { NextResponse } from "next/server";
import { computeNextFireTime } from "@/lib/reminders";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

type ScheduleBody = {
  source_type?: string;
  source_id?: string;
  title?: string;
  body?: string;
  start_time?: string;
  end_time?: string;
  interval_minutes?: number;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as ScheduleBody;
  const {
    source_type = "custom",
    source_id = crypto.randomUUID(),
    title = "Recordatorio LuCare",
    body,
    start_time = "08:00",
    end_time = "22:00",
    interval_minutes = 60,
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
    return NextResponse.json({ ok: true, mode: "demo", scheduled: row });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ scheduled: row, mode: "anonymous" });
    }

    await supabase.from("scheduled_reminders").insert({
      ...row,
      user_id: user.id,
    });

    return NextResponse.json({ ok: true, scheduled: row });
  } catch {
    return NextResponse.json({ ok: true, mode: "fallback", scheduled: row });
  }
}