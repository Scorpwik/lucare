import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: false,
    provider: "notion_deberes",
    message: "Integración Notion no configurada (Fase 4)",
  });
}