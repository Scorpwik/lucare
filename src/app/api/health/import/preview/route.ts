import { NextResponse } from "next/server";
import {
  MAX_IMPORT_BYTES,
  parseHealthBytes,
  type ImportPreview,
} from "@/lib/health-import/parse";
import type { HealthSampleSource } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const source = (form.get("source") as HealthSampleSource) ?? "import";
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }
    if (file.size > MAX_IMPORT_BYTES) {
      return NextResponse.json(
        { error: `Archivo demasiado grande (máx. ${MAX_IMPORT_BYTES / (1024 * 1024)} MB)` },
        { status: 400 },
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const preview = parseHealthBytes(bytes, file.name, source);
    const payload: Omit<ImportPreview, "rows"> & { rowCount: number } = {
      source: preview.source,
      fileName: preview.fileName,
      counts: preview.counts,
      dateRange: preview.dateRange,
      samples: preview.samples,
      errors: preview.errors,
      rowCount: preview.rows.length,
    };
    return NextResponse.json({ preview: payload, rows: preview.rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}