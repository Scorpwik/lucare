import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/env";
import { sendPushToUser } from "@/lib/push/send";
import { vapidConfigured } from "@/lib/push/vapid";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  if (isDemoMode()) {
    return NextResponse.json({
      ok: true,
      mode: "demo",
      skipped: "vapid",
      hint: "Usa la prueba local desde Ajustes.",
    });
  }

  if (!vapidConfigured()) {
    return NextResponse.json(
      { error: "VAPID no configurado", skipped: "vapid" },
      { status: 503 },
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const result = await sendPushToUser(user.id, {
      title: "LuCare · prueba",
      body: "Las notificaciones push están activas.",
    });

    if (result.skipped === "vapid") {
      return NextResponse.json({ ok: false, skipped: "vapid" }, { status: 503 });
    }
    if (result.skipped === "no_subscriptions") {
      return NextResponse.json(
        { ok: false, skipped: "no_subscriptions", error: "Sin suscripciones" },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}