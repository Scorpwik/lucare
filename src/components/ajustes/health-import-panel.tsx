"use client";

import * as React from "react";
import type { ParsedHealthRow } from "@/lib/health-import/parse";
import type { HealthSampleSource } from "@/lib/types";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload } from "lucide-react";

type PreviewPayload = {
  source: HealthSampleSource;
  fileName: string;
  counts: Record<ParsedHealthRow["kind"], number>;
  dateRange: { from: string | null; to: string | null };
  samples: ParsedHealthRow[];
  errors: string[];
  rowCount: number;
};

const COLUMN_HINT = `Columnas habituales: fecha (date/day), valor (steps/count, hours, bpm, weight/kg). 
Samsung Health y Health Connect exportan CSV distintos; el importador infiere el tipo por nombre y cabeceras.`;

export function HealthImportPanel() {
  const [source, setSource] = React.useState<HealthSampleSource>("samsung_health");
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<PreviewPayload | null>(null);
  const [rows, setRows] = React.useState<ParsedHealthRow[]>([]);
  const [busy, setBusy] = React.useState(false);

  const onPreview = async () => {
    if (!file) {
      toast.message("Selecciona un archivo CSV o ZIP");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("source", source);
      const res = await fetch("/api/health/import/preview", { method: "POST", body: fd });
      const data = (await res.json()) as {
        preview?: PreviewPayload;
        rows?: ParsedHealthRow[];
        error?: string;
      };
      if (!res.ok) {
        toast.error(data.error ?? "Error al analizar");
        return;
      }
      setPreview(data.preview ?? null);
      setRows(data.rows ?? []);
      toast.success("Vista previa lista");
    } finally {
      setBusy(false);
    }
  };

  const onConfirm = async () => {
    if (!rows.length) return;
    setBusy(true);
    try {
      const res = await fetch("/api/health/import/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, rows }),
      });
      const data = (await res.json()) as {
        applied?: Record<ParsedHealthRow["kind"], number>;
        errors?: string[];
        error?: string;
      };
      if (!res.ok) {
        toast.error(data.error ?? "Importación fallida");
        return;
      }
      const applied = data.applied;
      toast.success(
        applied
          ? `Importado: ${applied.steps} pasos, ${applied.sleep} sueño, ${applied.heart_rate} pulso, ${applied.weight} peso`
          : "Importación completada",
      );
      if (data.errors?.length) {
        toast.message("Algunas filas no se guardaron", { description: data.errors[0] });
      }
      setPreview(null);
      setRows([]);
      setFile(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassCard className="p-4 mt-4 space-y-4">
      <div>
        <p className="silk mb-1">salud · samsung / health connect</p>
        <p className="text-xs text-muted-foreground">
          Importa exportaciones CSV o ZIP (solo se leen archivos .csv dentro del ZIP). Máx. 5 MB.
        </p>
      </div>

      <p className="text-xs text-muted-foreground whitespace-pre-line border border-dashed border-border rounded-[var(--pill)] p-3">
        {COLUMN_HINT}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="health-source" className="text-xs font-mono text-muted-foreground">
            Origen
          </Label>
          <select
            id="health-source"
            className="mt-1 w-full rounded-[var(--pill)] border border-border bg-surface px-3 py-2 text-sm"
            value={source}
            onChange={(e) => setSource(e.target.value as HealthSampleSource)}
          >
            <option value="samsung_health">Samsung Health</option>
            <option value="health_connect">Health Connect</option>
            <option value="import">Otro / genérico</option>
          </select>
        </div>
        <div>
          <Label htmlFor="health-file" className="text-xs font-mono text-muted-foreground">
            Archivo
          </Label>
          <input
            id="health-file"
            type="file"
            accept=".csv,.zip,text/csv,application/zip"
            className="mt-1 w-full text-xs"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setPreview(null);
              setRows([]);
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <LcButton type="button" variant="ghost" size="sm" disabled={busy || !file} onClick={() => void onPreview()}>
          <Upload className="size-3.5 mr-1" />
          Vista previa
        </LcButton>
        <LcButton type="button" size="sm" disabled={busy || !rows.length} onClick={() => void onConfirm()}>
          Confirmar importación
        </LcButton>
      </div>

      {!preview && !file && (
        <p className="text-xs text-muted-foreground">Aún no hay archivo seleccionado.</p>
      )}

      {preview && (
        <div className="border border-border rounded-[var(--r)] p-3 text-xs space-y-2">
          <p className="font-mono">
            {preview.fileName} · {preview.rowCount} filas ·{" "}
            {preview.dateRange.from ?? "—"} → {preview.dateRange.to ?? "—"}
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-muted-foreground">
            <li>pasos: {preview.counts.steps}</li>
            <li>sueño: {preview.counts.sleep}</li>
            <li>pulso: {preview.counts.heart_rate}</li>
            <li>peso: {preview.counts.weight}</li>
          </ul>
          {preview.samples.length > 0 && (
            <pre className="text-[10px] overflow-x-auto bg-surface rounded-[var(--pill)] p-2">
              {JSON.stringify(preview.samples.slice(0, 3), null, 2)}
            </pre>
          )}
          {preview.errors.length > 0 && (
            <ul className="text-amber-600 dark:text-amber-400 space-y-1">
              {preview.errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </GlassCard>
  );
}