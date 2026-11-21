import { strFromU8, unzipSync } from "fflate";
import type { HealthSampleSource } from "@/lib/types";

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
export const MAX_ZIP_ENTRIES = 40;

export type ParsedHealthRow =
  | { kind: "steps"; date: string; steps: number }
  | { kind: "sleep"; date: string; hours: number | null; quality: number | null }
  | { kind: "heart_rate"; at: string; bpm: number }
  | { kind: "weight"; date: string; weightKg: number };

export type ImportPreview = {
  source: HealthSampleSource;
  fileName: string;
  counts: Record<ParsedHealthRow["kind"], number>;
  dateRange: { from: string | null; to: string | null };
  samples: ParsedHealthRow[];
  errors: string[];
  rows: ParsedHealthRow[];
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function pickColumn(headers: string[], patterns: RegExp[]): number {
  return headers.findIndex((h) => patterns.some((p) => p.test(h)));
}

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const splitLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        quoted = !quoted;
        continue;
      }
      if (ch === "," && !quoted) {
        out.push(cur);
        cur = "";
        continue;
      }
      cur += ch;
    }
    out.push(cur);
    return out.map((c) => c.trim());
  };
  const headers = splitLine(lines[0]).map(normalizeHeader);
  const rows = lines.slice(1).map(splitLine);
  return { headers, rows };
}

function parseDateValue(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  const d = new Date(v);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  const m = v.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/);
  if (m) {
    const year = m[3].length === 2 ? `20${m[3]}` : m[3];
    const month = m[2].padStart(2, "0");
    const day = m[1].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return null;
}

function parseDateTimeValue(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  const d = new Date(v);
  if (!Number.isNaN(d.getTime())) return d.toISOString();
  const dateOnly = parseDateValue(v);
  if (dateOnly) return `${dateOnly}T12:00:00.000Z`;
  return null;
}

function inferKind(headers: string[], fileName: string): ParsedHealthRow["kind"] | "unknown" {
  const blob = `${headers.join(" ")} ${fileName}`.toLowerCase();
  if (/step|paso|walk/.test(blob)) return "steps";
  if (/sleep|sueño|asleep|bedtime/.test(blob)) return "sleep";
  if (/heart|pulse|bpm|hr/.test(blob)) return "heart_rate";
  if (/weight|peso|body.?mass/.test(blob)) return "weight";
  return "unknown";
}

function rowsFromCsv(
  csvText: string,
  fileName: string,
  errors: string[],
): ParsedHealthRow[] {
  const { headers, rows } = parseCsv(csvText);
  if (headers.length === 0) return [];
  const kind = inferKind(headers, fileName);
  if (kind === "unknown") {
    errors.push(`${fileName}: no se reconoció el tipo de datos (pasos, sueño, pulso o peso).`);
    return [];
  }

  const dateIdx = pickColumn(headers, [/date/, /day/, /fecha/, /time/]);
  const valueIdx = pickColumn(headers, [
    /step/,
    /count/,
    /value/,
    /amount/,
    /hours/,
    /duration/,
    /bpm/,
    /rate/,
    /weight/,
    /kg/,
  ]);

  const out: ParsedHealthRow[] = [];
  for (const row of rows) {
    const dateRaw = dateIdx >= 0 ? row[dateIdx] : row[0];
    const valRaw = valueIdx >= 0 ? row[valueIdx] : row[row.length - 1];
    if (kind === "heart_rate") {
      const at = parseDateTimeValue(dateRaw);
      const bpm = Number(valRaw?.replace(",", "."));
      if (!at || !Number.isFinite(bpm) || bpm < 30 || bpm > 220) {
        errors.push(`${fileName}: fila de pulso omitida (${dateRaw}, ${valRaw})`);
        continue;
      }
      out.push({ kind: "heart_rate", at, bpm: Math.round(bpm) });
      continue;
    }
    const date = parseDateValue(dateRaw);
    if (!date) {
      errors.push(`${fileName}: fecha no válida (${dateRaw})`);
      continue;
    }
    if (kind === "steps") {
      const steps = Number(valRaw?.replace(/[^\d.]/g, ""));
      if (!Number.isFinite(steps)) continue;
      out.push({ kind: "steps", date, steps: Math.round(steps) });
    } else if (kind === "weight") {
      const weightKg = Number(valRaw?.replace(",", "."));
      if (!Number.isFinite(weightKg)) continue;
      out.push({ kind: "weight", date, weightKg });
    } else {
      const hours = Number(valRaw?.replace(",", "."));
      const qualityIdx = pickColumn(headers, [/quality/, /score/, /calidad/]);
      const qRaw = qualityIdx >= 0 ? row[qualityIdx] : "";
      const quality = qRaw ? Number(qRaw) : null;
      out.push({
        kind: "sleep",
        date,
        hours: Number.isFinite(hours) ? hours : null,
        quality: quality != null && Number.isFinite(quality) ? Math.round(quality) : null,
      });
    }
  }
  return out;
}

export function parseHealthBytes(
  bytes: Uint8Array,
  fileName: string,
  source: HealthSampleSource,
): ImportPreview {
  const errors: string[] = [];
  const rows: ParsedHealthRow[] = [];

  const lower = fileName.toLowerCase();
  if (lower.endsWith(".zip")) {
    try {
      const entries = unzipSync(bytes);
      const names = Object.keys(entries).filter((n) => !n.endsWith("/"));
      if (names.length > MAX_ZIP_ENTRIES) {
        errors.push(`ZIP con demasiados archivos (máx. ${MAX_ZIP_ENTRIES}).`);
      }
      for (const name of names.slice(0, MAX_ZIP_ENTRIES)) {
        if (!name.toLowerCase().endsWith(".csv")) continue;
        const data = entries[name];
        if (!data) continue;
        const text = strFromU8(data);
        rows.push(...rowsFromCsv(text, name, errors));
      }
    } catch {
      errors.push("No se pudo leer el archivo ZIP.");
    }
  } else if (lower.endsWith(".csv")) {
    rows.push(...rowsFromCsv(strFromU8(bytes), fileName, errors));
  } else {
    errors.push("Formato no admitido. Usa CSV o ZIP con CSV.");
  }

  const counts: ImportPreview["counts"] = {
    steps: 0,
    sleep: 0,
    heart_rate: 0,
    weight: 0,
  };
  for (const r of rows) counts[r.kind] += 1;

  const dates = rows
    .map((r) => ("date" in r ? r.date : r.at.slice(0, 10)))
    .filter(Boolean)
  .sort();

  return {
    source,
    fileName,
    counts,
    dateRange: {
      from: dates[0] ?? null,
      to: dates[dates.length - 1] ?? null,
    },
    samples: rows.slice(0, 8),
    errors: errors.slice(0, 20),
    rows,
  };
}