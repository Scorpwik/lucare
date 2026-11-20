import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: false,
    provider: "google_calendar",
    message: "Integración Google Calendar no configurada (Fase 4)",
  });
}