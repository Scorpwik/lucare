import { NextResponse } from "next/server";

/** Notion usa token interno por env — no hay OAuth callback. */
export async function GET() {
  return NextResponse.json({
    ok: false,
    message: "Notion se configura con NOTION_TOKEN en el servidor. Usa POST /api/integrations/notion para activar.",
  });
}