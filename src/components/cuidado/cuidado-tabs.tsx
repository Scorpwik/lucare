"use client";

import * as React from "react";
import type { MedicalAppointment, Medication, SkincareRoutine, SkincareStep } from "@/lib/types";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { clientUpsertAppointment, clientUpsertMedication } from "@/lib/data/medications-client";
import { clientUpsertRoutine } from "@/lib/data/skincare-client";
import { getDemoState } from "@/lib/demo-store";
import { isDemoModeClient } from "@/lib/env";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  routines: SkincareRoutine[];
  steps: SkincareStep[];
  medications: Medication[];
  appointments: MedicalAppointment[];
};

export function CuidadoTabs({
  routines: initialRoutines,
  steps: initialSteps,
  medications: initialMeds,
  appointments: initialAppts,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = React.useState<"rutinas" | "medicamentos" | "citas">("rutinas");
  const [routines, setRoutines] = React.useState(initialRoutines);
  const [steps] = React.useState(initialSteps);
  const [meds, setMeds] = React.useState(initialMeds);
  const [appts, setAppts] = React.useState(initialAppts);
  const [editApptId, setEditApptId] = React.useState<string | null>(null);

  const [routineForm, setRoutineForm] = React.useState({
    name: "",
    period: "am" as const,
    reminder_enabled: false,
  });

  const [medForm, setMedForm] = React.useState({
    name: "",
    dosage: "",
    reminder_enabled: true,
  });

  const [apptForm, setApptForm] = React.useState({
    title: "",
    provider: "",
    location: "",
    starts_at: "",
    ends_at: "",
    notes: "",
    reminder_enabled: true,
    reminder_minutes_before: 60,
  });

  const resetApptForm = () => {
    setEditApptId(null);
    setApptForm({
      title: "",
      provider: "",
      location: "",
      starts_at: "",
      ends_at: "",
      notes: "",
      reminder_enabled: true,
      reminder_minutes_before: 60,
    });
  };

  const saveRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    clientUpsertRoutine(null, {
      name: routineForm.name,
      period: routineForm.period,
      reminder_enabled: routineForm.reminder_enabled,
    });
    if (isDemoModeClient()) setRoutines(getDemoState().routines);
    toast.success("Rutina guardada");
    setRoutineForm({ name: "", period: "am", reminder_enabled: false });
    router.refresh();
  };

  const saveMed = (e: React.FormEvent) => {
    e.preventDefault();
    clientUpsertMedication(null, {
      name: medForm.name,
      dosage: medForm.dosage || null,
      reminder_enabled: medForm.reminder_enabled,
    });
    if (isDemoModeClient()) setMeds(getDemoState().medications);
    toast.success("Medicamento guardado");
    setMedForm({ name: "", dosage: "", reminder_enabled: true });
    router.refresh();
  };

  const saveAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    const starts = new Date(apptForm.starts_at).toISOString();
    const ends = apptForm.ends_at ? new Date(apptForm.ends_at).toISOString() : null;
    const saved = await clientUpsertAppointment(editApptId, {
      title: apptForm.title,
      provider: apptForm.provider || null,
      location: apptForm.location || null,
      starts_at: starts,
      ends_at: ends,
      notes: apptForm.notes || null,
      reminder_enabled: apptForm.reminder_enabled,
      reminder_minutes_before: apptForm.reminder_minutes_before,
    });
    if (isDemoModeClient()) {
      setAppts(
        getDemoState().appointments.sort(
          (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
        ),
      );
    } else if (saved) {
      setAppts((prev) => {
        const next = editApptId
          ? prev.map((a) => (a.id === saved.id ? saved : a))
          : [...prev, saved];
        return next.sort(
          (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
        );
      });
      router.refresh();
    }
    toast.success(editApptId ? "Cita actualizada" : "Cita guardada");
    resetApptForm();
  };

  const startEditAppt = (a: MedicalAppointment) => {
    setEditApptId(a.id);
    setApptForm({
      title: a.title,
      provider: a.provider ?? "",
      location: a.location ?? "",
      starts_at: a.starts_at.slice(0, 16),
      ends_at: a.ends_at ? a.ends_at.slice(0, 16) : "",
      notes: a.notes ?? "",
      reminder_enabled: a.reminder_enabled,
      reminder_minutes_before: a.reminder_minutes_before ?? 60,
    });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {(["rutinas", "medicamentos", "citas"] as const).map((t) => (
          <LcButton
            key={t}
            type="button"
            size="sm"
            variant={tab === t ? "pri" : "ghost"}
            onClick={() => setTab(t)}
          >
            {t === "rutinas" ? "Rutinas" : t === "medicamentos" ? "Medicamentos" : "Citas"}
          </LcButton>
        ))}
      </div>

      {tab === "rutinas" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard className="p-4">
            <p className="silk mb-3">rutinas activas</p>
            <ul className="space-y-2 text-sm">
              {routines.map((r) => (
                <li key={r.id} className="border-b border-border pb-2">
                  <span className="font-medium">{r.name}</span>
                  <span className="font-mono text-xs text-muted-foreground ml-2">{r.period}</span>
                  <ul className="mt-1 text-muted-foreground">
                    {steps
                      .filter((s) => s.routine_id === r.id)
                      .map((s) => (
                        <li key={s.id}>· {s.title}</li>
                      ))}
                  </ul>
                </li>
              ))}
            </ul>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="silk mb-3">nueva rutina</p>
            <form className="space-y-3" onSubmit={saveRoutine}>
              <div>
                <Label htmlFor="r-name">Nombre</Label>
                <Input
                  id="r-name"
                  required
                  value={routineForm.name}
                  onChange={(e) => setRoutineForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <LcButton type="submit" variant="pri" className="w-full">
                Guardar rutina
              </LcButton>
            </form>
          </GlassCard>
        </div>
      )}

      {tab === "medicamentos" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard className="p-4">
            <p className="silk mb-3">medicamentos</p>
            <ul className="space-y-2 text-sm">
              {meds.map((m) => (
                <li key={m.id} className="border-b border-border pb-2">
                  <span className="font-medium">{m.name}</span>
                  {m.dosage && (
                    <span className="text-muted-foreground ml-2">{m.dosage}</span>
                  )}
                </li>
              ))}
            </ul>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="silk mb-3">nuevo medicamento</p>
            <form className="space-y-3" onSubmit={saveMed}>
              <div>
                <Label htmlFor="m-name">Nombre</Label>
                <Input
                  id="m-name"
                  required
                  value={medForm.name}
                  onChange={(e) => setMedForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="m-dose">Dosis</Label>
                <Input
                  id="m-dose"
                  value={medForm.dosage}
                  onChange={(e) => setMedForm((f) => ({ ...f, dosage: e.target.value }))}
                />
              </div>
              <LcButton type="submit" variant="pri" className="w-full">
                Guardar medicamento
              </LcButton>
            </form>
          </GlassCard>
        </div>
      )}

      {tab === "citas" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard className="p-4">
            <p className="silk mb-3">próximas citas</p>
            <ul className="space-y-3 text-sm">
              {appts.map((a) => (
                <li key={a.id} className="flex flex-col gap-1 border-b border-border pb-2">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">{a.title}</span>
                    <LcButton type="button" variant="ghost" size="sm" onClick={() => startEditAppt(a)}>
                      Editar
                    </LcButton>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("es-EC", {
                      timeZone: "America/Guayaquil",
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(a.starts_at))}
                  </span>
                  {a.provider && (
                    <span className="text-muted-foreground">{a.provider}</span>
                  )}
                </li>
              ))}
            </ul>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="silk mb-3">{editApptId ? "editar cita" : "nueva cita"}</p>
            <form className="space-y-3" onSubmit={saveAppt}>
              <div>
                <Label htmlFor="a-title">Título</Label>
                <Input
                  id="a-title"
                  required
                  value={apptForm.title}
                  onChange={(e) => setApptForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="a-prov">Profesional / centro</Label>
                <Input
                  id="a-prov"
                  value={apptForm.provider}
                  onChange={(e) => setApptForm((f) => ({ ...f, provider: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="a-loc">Ubicación</Label>
                <Input
                  id="a-loc"
                  value={apptForm.location}
                  onChange={(e) => setApptForm((f) => ({ ...f, location: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="a-start">Inicio</Label>
                <Input
                  id="a-start"
                  type="datetime-local"
                  required
                  value={apptForm.starts_at}
                  onChange={(e) => setApptForm((f) => ({ ...f, starts_at: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="a-end">Fin (opcional)</Label>
                <Input
                  id="a-end"
                  type="datetime-local"
                  value={apptForm.ends_at}
                  onChange={(e) => setApptForm((f) => ({ ...f, ends_at: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 items-center">
                <Label>Recordatorio</Label>
                <Switch
                  checked={apptForm.reminder_enabled}
                  onCheckedChange={(v) => setApptForm((f) => ({ ...f, reminder_enabled: v }))}
                />
              </div>
              {apptForm.reminder_enabled && (
                <div>
                  <Label htmlFor="a-rem">Minutos antes</Label>
                  <Input
                    id="a-rem"
                    type="number"
                    min={5}
                    step={5}
                    value={apptForm.reminder_minutes_before}
                    onChange={(e) =>
                      setApptForm((f) => ({
                        ...f,
                        reminder_minutes_before: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              )}
              <div className="flex gap-2">
                <LcButton type="submit" variant="pri" className="flex-1">
                  Guardar cita
                </LcButton>
                {editApptId && (
                  <LcButton type="button" variant="ghost" onClick={resetApptForm}>
                    Cancelar
                  </LcButton>
                )}
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}