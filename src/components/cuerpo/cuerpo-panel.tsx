"use client";

import * as React from "react";
import Link from "next/link";
import type { BodyGoal, BodyMetric, ProgressPhoto } from "@/lib/types";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CuerpoCharts } from "@/components/cuerpo/cuerpo-charts";
import {
  clientDeleteBodyMetric,
  clientDeleteProgressPhoto,
  clientScheduleBodyWeighIn,
  clientUploadProgressPhoto,
  clientUpsertBodyGoal,
  clientUpsertBodyMetric,
} from "@/lib/data/body-client";
import { clientFetchBodyMetrics } from "@/lib/data/body-client";
import { useClientNow } from "@/lib/use-client-time";
import { confirmDelete } from "@/lib/feedback";
import { toast } from "sonner";

type Props = {
  initialMetrics: BodyMetric[];
  initialPhotos: ProgressPhoto[];
  initialGoal: BodyGoal | null;
};

const emptyForm = {
  id: null as string | null,
  recorded_at: "",
  weight_kg: "",
  waist_cm: "",
  chest_cm: "",
  hips_cm: "",
  body_fat_pct: "",
  muscle_mass_kg: "",
  arm_cm: "",
  thigh_cm: "",
  notes: "",
};

export function CuerpoPanel({
  initialMetrics,
  initialPhotos,
  initialGoal,
}: Props) {
  const now = useClientNow();
  const [metrics, setMetrics] = React.useState(initialMetrics);
  const [photos, setPhotos] = React.useState(initialPhotos);
  const [goal, setGoal] = React.useState<BodyGoal | null>(initialGoal);
  const [form, setForm] = React.useState(emptyForm);
  const [goalForm, setGoalForm] = React.useState(() => goalToForm(initialGoal));
  const [saving, setSaving] = React.useState(false);

  const latest = metrics[0];
  const oldest = metrics.length > 0 ? metrics[metrics.length - 1] : null;

  const goalProgress = React.useMemo(() => {
    if (!goal?.target_weight_kg || latest?.weight_kg == null) return null;
    const target = goal.target_weight_kg;
    const current = latest.weight_kg;
    const start = oldest?.weight_kg ?? current;
    const denom = start - target;
    if (Math.abs(denom) < 0.01) return { pct: current <= target ? 100 : 0, left: current - target };
    const pct = Math.min(100, Math.max(0, ((start - current) / denom) * 100));
    return { pct, left: current - target };
  }, [goal, latest, oldest]);

  const saveMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    const recorded_at =
      form.recorded_at || now?.toISOString().slice(0, 10) || "";
    if (!recorded_at) return;
    setSaving(true);
    const row = await clientUpsertBodyMetric(form.id, {
      recorded_at,
      weight_kg: parseNum(form.weight_kg),
      waist_cm: parseNum(form.waist_cm),
      chest_cm: parseNum(form.chest_cm),
      hips_cm: parseNum(form.hips_cm),
      body_fat_pct: parseNum(form.body_fat_pct),
      muscle_mass_kg: parseNum(form.muscle_mass_kg),
      arm_cm: parseNum(form.arm_cm),
      thigh_cm: parseNum(form.thigh_cm),
      notes: form.notes || null,
    });
    setSaving(false);
    if (!row) {
      toast.error("No se pudo guardar");
      return;
    }
    const next = await clientFetchBodyMetrics();
    setMetrics(next.length ? next : [row, ...metrics.filter((m) => m.id !== row.id)]);
    setForm(emptyForm);
    toast.success(form.id ? "Registro actualizado" : "Medidas guardadas");
  };

  const startEdit = (m: BodyMetric) => {
    setForm({
      id: m.id,
      recorded_at: m.recorded_at.slice(0, 10),
      weight_kg: numStr(m.weight_kg),
      waist_cm: numStr(m.waist_cm),
      chest_cm: numStr(m.chest_cm),
      hips_cm: numStr(m.hips_cm),
      body_fat_pct: numStr(m.body_fat_pct),
      muscle_mass_kg: numStr(m.muscle_mass_kg),
      arm_cm: numStr(m.arm_cm),
      thigh_cm: numStr(m.thigh_cm),
      notes: m.notes ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeMetric = async (id: string) => {
    if (!confirmDelete("¿Eliminar este registro de medidas?")) return;
    const ok = await clientDeleteBodyMetric(id);
    if (!ok) {
      toast.error("No se pudo eliminar");
      return;
    }
    setMetrics((prev) => prev.filter((m) => m.id !== id));
    if (form.id === id) setForm(emptyForm);
    toast.success("Registro eliminado");
  };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const row = await clientUploadProgressPhoto(file, file.name);
    if (!row) {
      toast.error("No se pudo subir la foto");
      return;
    }
    setPhotos((p) => [row, ...p]);
    toast.success("Foto añadida");
    e.target.value = "";
  };

  const removePhoto = async (id: string) => {
    if (!confirmDelete("¿Eliminar esta foto de progreso?")) return;
    const ok = await clientDeleteProgressPhoto(id);
    if (!ok) {
      toast.error("No se pudo eliminar");
      return;
    }
    setPhotos((p) => p.filter((x) => x.id !== id));
    toast.success("Foto eliminada");
  };

  const saveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const row = await clientUpsertBodyGoal({
      target_weight_kg: parseNum(goalForm.target_weight_kg),
      target_waist_cm: parseNum(goalForm.target_waist_cm),
      target_body_fat_pct: parseNum(goalForm.target_body_fat_pct),
      reminder_time: goalForm.reminder_time || null,
      reminder_enabled: goalForm.reminder_enabled,
      notes: goalForm.notes || null,
    });
    setSaving(false);
    if (!row) {
      toast.error("No se pudo guardar la meta");
      return;
    }
    setGoal(row);
    if (row.reminder_enabled && row.reminder_time) {
      const scheduled = await clientScheduleBodyWeighIn({
        goalId: row.id,
        reminder_time: row.reminder_time,
      });
      if (scheduled) toast.message("Recordatorio de pesaje programado");
    }
    toast.success("Meta guardada");
  };

  return (
    <div className="space-y-4">
      <PanelGrid className="lg:grid-cols-3">
        <GlassCard className="p-4 space-y-3 lg:col-span-1">
          <p className="silk">último registro</p>
          <p className="font-dot font-black text-4xl tabular-nums">
            {latest?.weight_kg ?? "—"}{" "}
            <span className="text-base font-sans">kg</span>
          </p>
          <ul className="text-sm font-mono text-muted-foreground space-y-1">
            <li>Cintura: {latest?.waist_cm ?? "—"} cm</li>
            <li>Grasa: {latest?.body_fat_pct ?? "—"} %</li>
            <li>Músculo: {latest?.muscle_mass_kg ?? "—"} kg</li>
          </ul>
          {goalProgress && goal?.target_weight_kg != null ? (
            <div className="pt-2 border-t border-border">
              <p className="text-xs silk mb-1">meta peso {goal.target_weight_kg} kg</p>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-[var(--sleep)] transition-all"
                  style={{ width: `${goalProgress.pct}%` }}
                />
              </div>
              <p className="text-xs font-mono text-muted-foreground mt-1">
                {goalProgress.left > 0
                  ? `Faltan ${goalProgress.left.toFixed(1)} kg`
                  : goalProgress.left < 0
                    ? `${Math.abs(goalProgress.left).toFixed(1)} kg bajo la meta`
                    : "En la meta"}
              </p>
            </div>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Sueño y hábitos en{" "}
            <Link href="/sueno-habitos" className="underline text-foreground">
              Sueño y hábitos
            </Link>
            .
          </p>
        </GlassCard>

        <GlassCard className="p-4 lg:col-span-2">
          <p className="silk mb-3">{form.id ? "editar registro" : "registrar medidas"}</p>
          <form className="space-y-3" onSubmit={saveMetric}>
            <div>
              <Label>Fecha</Label>
              <Input
                type="date"
                required
                value={form.recorded_at}
                onChange={(e) =>
                  setForm((f) => ({ ...f, recorded_at: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {metricFields.map(([key, label]) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={form[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
            <Field>
              <Label>Notas</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </Field>
            <div className="flex gap-2">
              <LcButton type="submit" variant="pri" className="flex-1" disabled={saving}>
                {form.id ? "Actualizar" : "Guardar"}
              </LcButton>
              {form.id ? (
                <LcButton
                  type="button"
                  variant="default"
                  onClick={() => setForm(emptyForm)}
                >
                  Cancelar
                </LcButton>
              ) : null}
            </div>
          </form>
        </GlassCard>
      </PanelGrid>

      <CuerpoCharts metrics={metrics} />

      <PanelGrid className="lg:grid-cols-2">
        <GlassCard className="p-4">
          <p className="silk mb-3">meta corporal</p>
          <form className="space-y-3" onSubmit={saveGoal}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Peso objetivo (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={goalForm.target_weight_kg}
                  onChange={(e) =>
                    setGoalForm((f) => ({ ...f, target_weight_kg: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Cintura objetivo (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={goalForm.target_waist_cm}
                  onChange={(e) =>
                    setGoalForm((f) => ({ ...f, target_waist_cm: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Grasa objetivo (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={goalForm.target_body_fat_pct}
                  onChange={(e) =>
                    setGoalForm((f) => ({
                      ...f,
                      target_body_fat_pct: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Recordatorio pesaje</Label>
                <Input
                  type="time"
                  value={goalForm.reminder_time}
                  disabled={!goalForm.reminder_enabled}
                  onChange={(e) =>
                    setGoalForm((f) => ({ ...f, reminder_time: e.target.value }))
                  }
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={goalForm.reminder_enabled}
                onChange={(e) =>
                  setGoalForm((f) => ({
                    ...f,
                    reminder_enabled: e.target.checked,
                  }))
                }
              />
              Activar recordatorio Web Push diario
            </label>
            <LcButton type="submit" variant="pri" className="w-full" disabled={saving}>
              Guardar meta
            </LcButton>
          </form>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="silk mb-2">fotos de progreso</p>
          <Field>
            <Label htmlFor="photo">Subir imagen</Label>
            <Input id="photo" type="file" accept="image/*" onChange={onPhoto} />
          </Field>
          <p className="text-xs text-muted-foreground mb-3">
            En producción: bucket <code className="font-mono">progress-photos</code> con URL firmada.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {photos.length === 0 ? (
              <p className="col-span-full text-sm text-muted-foreground">
                Sin fotos aún — añade una para comparar visualmente.
              </p>
            ) : (
              photos.slice(0, 9).map((p) => (
                <div
                  key={p.id}
                  className="relative aspect-square rounded-[var(--r)] border border-border bg-surface overflow-hidden group"
                >
                  {p.preview_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.preview_url}
                      alt={p.caption ?? "Progreso"}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-background/80 opacity-0 group-hover:opacity-100"
                    onClick={() => void removePhoto(p.id)}
                  >
                    Quitar
                  </button>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </PanelGrid>

      <GlassCard className="p-4">
        <p className="silk mb-3">historial</p>
        {metrics.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin registros todavía.</p>
        ) : (
          <ul className="divide-y divide-border">
            {metrics.map((m) => (
              <li
                key={m.id}
                className="py-2 flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <span className="font-mono tabular-nums">{m.recorded_at.slice(0, 10)}</span>
                <span className="text-muted-foreground font-mono">
                  {m.weight_kg != null ? `${m.weight_kg} kg` : "—"}
                  {m.waist_cm != null ? ` · cintura ${m.waist_cm}` : ""}
                  {m.body_fat_pct != null ? ` · grasa ${m.body_fat_pct}%` : ""}
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    className="text-xs underline"
                    onClick={() => startEdit(m)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="text-xs text-danger underline"
                    onClick={() => void removeMetric(m.id)}
                  >
                    Eliminar
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}

const metricFields = [
  ["weight_kg", "Peso (kg)"],
  ["waist_cm", "Cintura (cm)"],
  ["chest_cm", "Pecho (cm)"],
  ["hips_cm", "Cadera (cm)"],
  ["body_fat_pct", "Grasa (%)"],
  ["muscle_mass_kg", "Músculo (kg)"],
  ["arm_cm", "Brazo (cm)"],
  ["thigh_cm", "Muslo (cm)"],
] as const;

function PanelGrid({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`grid gap-4 ${className}`}>{children}</div>;
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1">{children}</div>;
}

function parseNum(v: string): number | null {
  if (!v.trim()) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function numStr(n: number | null | undefined): string {
  return n != null ? String(n) : "";
}

function goalToForm(goal: BodyGoal | null) {
  return {
    target_weight_kg: numStr(goal?.target_weight_kg),
    target_waist_cm: numStr(goal?.target_waist_cm),
    target_body_fat_pct: numStr(goal?.target_body_fat_pct),
    reminder_time: goal?.reminder_time ?? "07:30",
    reminder_enabled: goal?.reminder_enabled ?? false,
    notes: goal?.notes ?? "",
  };
}