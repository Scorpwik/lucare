import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  const configured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
  return NextResponse.json({
    provider: "google_calendar",
    configured,
    message: configured
      ? "OAuth listo — implementación Fase 4"
      : "Google Calendar no configurado",
    authorize_url: configured ? "/api/integrations/google/callback" : null,
  });
}