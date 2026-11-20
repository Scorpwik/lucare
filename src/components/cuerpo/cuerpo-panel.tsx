"use client";

import * as React from "react";
import type { BodyMetric, ProgressPhoto } from "@/lib/types";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientAddProgressPhotoLocal, clientUpsertBodyMetric } from "@/lib/data/body-client";
import { getDemoState } from "@/lib/demo-store";
import { useClientNow } from "@/lib/use-client-time";
import { toast } from "sonner";

type Props = { initialMetrics: BodyMetric[]; initialPhotos: ProgressPhoto[] };

export function CuerpoPanel({ initialMetrics, initialPhotos }: Props) {
  const now = useClientNow();
  const [metrics, setMetrics] = React.useState(initialMetrics);
  const [photos, setPhotos] = React.useState(initialPhotos);
  const [form, setForm] = React.useState({
    recorded_at: "",
    weight_kg: "",
    waist_cm: "",
    chest_cm: "",
    hips_cm: "",
    notes: "",
  });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const recorded_at = form.recorded_at || now?.toISOString().slice(0, 10) || "";
    if (!recorded_at) return;
    clientUpsertBodyMetric(null, {
      recorded_at,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      waist_cm: form.waist_cm ? Number(form.waist_cm) : null,
      chest_cm: form.chest_cm ? Number(form.chest_cm) : null,
      hips_cm: form.hips_cm ? Number(form.hips_cm) : null,
      notes: form.notes || null,
    });
    setMetrics(getDemoState().bodyMetrics);
    toast.success("Medidas guardadas");
  };

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const row = clientAddProgressPhotoLocal(url, file.name);
    setPhotos((p) => [row, ...p]);
    toast.success("Foto añadida (vista previa local en demo)");
  };

  const latest = metrics[0];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <GlassCard className="p-4 space-y-3">
        <p className="silk">último registro</p>
        <p className="font-dot font-black text-4xl tabular-nums">
          {latest?.weight_kg ?? "—"} <span className="text-base font-sans">kg</span>
        </p>
        <ul className="text-sm font-mono text-muted-foreground space-y-1">
          <li>Cintura: {latest?.waist_cm ?? "—"} cm</li>
          <li>Pecho: {latest?.chest_cm ?? "—"} cm</li>
          <li>Cadera: {latest?.hips_cm ?? "—"} cm</li>
        </ul>
        <Field>
          <Label htmlFor="photo">Foto de progreso</Label>
          <Input id="photo" type="file" accept="image/*" onChange={onPhoto} />
        </Field>
        <div className="grid grid-cols-3 gap-2">
          {photos.slice(0, 6).map((p) => (
            <div
              key={p.id}
              className="aspect-square rounded-[var(--r)] border border-border bg-surface overflow-hidden"
            >
              {p.preview_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.preview_url} alt={p.caption ?? "Progreso"} className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>
      </GlassCard>
      <GlassCard className="p-4">
        <p className="silk mb-3">registrar medidas</p>
        <form className="space-y-3" onSubmit={save}>
          <div>
            <Label>Fecha</Label>
            <Input
              type="date"
              required
              value={form.recorded_at}
              onChange={(e) => setForm((f) => ({ ...f, recorded_at: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["weight_kg", "Peso (kg)"],
                ["waist_cm", "Cintura (cm)"],
                ["chest_cm", "Pecho (cm)"],
                ["hips_cm", "Cadera (cm)"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <LcButton type="submit" variant="pri" className="w-full">
            Guardar
          </LcButton>
        </form>
      </GlassCard>
    </div>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1">{children}</div>;
}
