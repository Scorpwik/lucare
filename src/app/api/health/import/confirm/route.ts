import { NextResponse } from "next/server";
import { applyHealthRows } from "@/lib/health-import/apply";
import type { ParsedHealthRow } from "@/lib/health-import/parse";
import type { HealthSampleSource } from "@/lib/types";

const MAX_ROWS = 5000;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      source?: HealthSampleSource;
      rows?: ParsedHealthRow[];
    };
    const source = body.source ?? "import";
    const rows = body.rows ?? [];
    if (rows.length === 0) {
      return NextResponse.json({ error: "No hay filas para importar" }, { status: 400 });
    }
    if (rows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `Demasiadas filas (máx. ${MAX_ROWS})` },
        { status: 400 },
      );
    }
    const result = await applyHealthRows(rows, source);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}