import { NextResponse } from "next/server";
import { env, isDemoMode } from "@/lib/env";

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
      message: "Estructura de sync periódico — sin credenciales",
    });
  }

  return NextResponse.json({
    ok: true,
    started_at: started,
    finished_at: new Date().toISOString(),
    synced_events: 0,
    message: "Sync stub — conectar proveedores en Fase 4",
  });
}

export async function GET() {
  return NextResponse.json({
    status: "idle",
    next_run: "cron externo / Vercel Cron",
  });
}