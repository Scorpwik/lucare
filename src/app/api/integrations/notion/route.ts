import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  const configured = Boolean(env.NOTION_CLIENT_ID && env.NOTION_CLIENT_SECRET);
  return NextResponse.json({
    provider: "notion_deberes",
    configured,
    message: configured
      ? "OAuth listo — implementación Fase 4"
      : "Notion no configurado",
  });
}