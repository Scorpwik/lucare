"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  WorkoutExercise,
  WorkoutSession,
  WorkoutSet,
  WorkoutTemplate,
} from "@/lib/types";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  clientDeleteExercise,
  clientDeleteTemplate,
  clientEndSession,
  clientGetActiveSession,
  clientLogSet,
  clientScheduleGymReminder,
  clientStartSession,
  clientUpsertExercise,
  clientUpsertTemplate,
  syncGymStateFromDemo,
} from "@/lib/data/gym-client";
import { isDemoModeClient } from "@/lib/env";
import { useClientNow } from "@/lib/use-client-time";
import { useRouter } from "next/navigation";
import { confirmDelete } from "@/lib/feedback";
import { toast } from "sonner";

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

type TabId = "hoy" | "plantillas" | "historial" | "stats";

type Props = {
  templates: WorkoutTemplate[];
  exercises: WorkoutExercise[];
  sessions: WorkoutSession[];
  sets: WorkoutSet[];
};

function sessionVolume(
  sessionId: string,
  sets: WorkoutSet[],
): number {
  return sets
    .filter((s) => s.session_id === sessionId)
    .reduce((acc, s) => acc + (s.reps ?? 0) * (s.weight_kg ?? 0), 0);
}

function lastWeightForExercise(
  exerciseId: string,
  sets: WorkoutSet[],
): number | null {
  const sorted = sets
    .filter((s) => s.exercise_id === exerciseId && s.weight_kg != null)
    .sort(
      (a, b) =>
        new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime(),
    );
  return sorted[0]?.weight_kg ?? null;
}

export function GimnasioTabs({
  templates: initialTemplates,
  exercises: initialExercises,
  sessions: initialSessions,
  sets: initialSets,
}: Props) {
  const router = useRouter();
  const now = useClientNow();
  const [tab, setTab] = React.useState<TabId>("hoy");
  const [templates, setTemplates] = React.useState(initialTemplates);
  const [exercises, setExercises] = React.useState(initialExercises);
  const [sessions, setSessions] = React.useState(initialSessions);
  const [sets, setSets] = React.useState(initialSets);
  const [activeSession, setActiveSession] = React.useState(
    () =>
      clientGetActiveSession() ??
      initialSessions.find((s) => !s.ended_at) ??
      null,
  );
  const [sessionPlanTplId, setSessionPlanTplId] = React.useState<string>("");
  const [selectedExercise, setSelectedExercise] = React.useState<string>(
    initialExercises[0]?.id ?? "",
  );
  const [reps, setReps] = React.useState(10);
  const [weight, setWeight] = React.useState(40);
  const [restLeft, setRestLeft] = React.useState(0);
  const [restTotal, setRestTotal] = React.useState(90);

  const [editTplId, setEditTplId] = React.useState<string | null>(null);
  const [editExId, setEditExId] = React.useState<string | null>(null);

  const [tplForm, setTplForm] = React.useState({
    name: "",
    weekday: 0,
    notes: "",
    reminder_enabled: false,
    reminder_time: "18:00",
  });
  const [exForm, setExForm] = React.useState({
    template_id: initialTemplates[0]?.id ?? "",
    name: "",
    machine: "",
    default_rest_seconds: 90,
  });

  const weekday = now?.getDay() ?? 0;
  const todayTpl =
    templates.find((t) => t.weekday === weekday) ?? templates[0];
  const planTplId =
    sessionPlanTplId || todayTpl?.id || templates[0]?.id || "";
  const planExercises = exercises
    .filter((e) => e.template_id === planTplId)
    .sort((a, b) => a.sort_order - b.sort_order);

  const effectiveExerciseId =
    planExercises.some((e) => e.id === selectedExercise)
      ? selectedExercise
      : (planExercises[0]?.id ?? "");

  React.useEffect(() => {
    if (restLeft <= 0) return;
    const id = window.setInterval(() => {
      setRestLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [restLeft]);

  const applyState = (partial?: {
    templates?: WorkoutTemplate[];
    exercises?: WorkoutExercise[];
    sessions?: WorkoutSession[];
    sets?: WorkoutSet[];
    active?: WorkoutSession | null;
  }) => {
    if (isDemoModeClient()) {
      const s = syncGymStateFromDemo();
      setTemplates(s.templates);
      setExercises(s.exercises);
      setSessions(s.sessions);
      setSets(s.sets);
      setActiveSession(s.active);
      return;
    }
    if (partial?.templates) setTemplates(partial.templates);
    if (partial?.exercises) setExercises(partial.exercises);
    if (partial?.sessions) setSessions(partial.sessions);
    if (partial?.sets) setSets(partial.sets);
    if (partial?.active !== undefined) setActiveSession(partial.active);
  };

  const sessionDurationMin =
    activeSession && now
      ? Math.max(
          0,
          Math.floor(
            (now.getTime() - new Date(activeSession.started_at).getTime()) /
              60_000,
          ),
        )
      : 0;

  const activeSessionSets = activeSession
    ? sets
        .filter((s) => s.session_id === activeSession.id)
        .sort((a, b) => a.set_number - b.set_number)
    : [];

  const exerciseCatalog = React.useMemo(() => {
    const names = new Set<string>();
    for (const ex of exercises) names.add(ex.name);
    return [...names].sort((a, b) => a.localeCompare(b, "es"));
  }, [exercises]);

  const startSession = async (templateId: string | null) => {
    const s = await clientStartSession(templateId);
    if (!s) {
      toast.error("No se pudo iniciar la sesión");
      return;
    }
    if (isDemoModeClient()) {
      applyState();
    } else {
      setSessions((prev) => [s, ...prev]);
      setActiveSession(s);
      router.refresh();
    }
    toast.success(templateId ? "Sesión iniciada" : "Sesión libre iniciada");
  };

  const endSession = async () => {
    if (!activeSession) return;
    const ok = await clientEndSession(activeSession.id);
    if (!ok) {
      toast.error("No se pudo finalizar");
      return;
    }
    if (isDemoModeClient()) {
      applyState();
    } else {
      setActiveSession(null);
      setSessions((prev) =>
        prev.map((x) =>
          x.id === activeSession.id
            ? { ...x, ended_at: new Date().toISOString() }
            : x,
        ),
      );
      router.refresh();
    }
    toast.success("Sesión finalizada");
  };

  const logSet = async () => {
    if (!activeSession || !effectiveExerciseId) return;
    const ex = exercises.find((e) => e.id === effectiveExerciseId);
    const number =
      sets.filter(
        (s) =>
          s.session_id === activeSession.id &&
          s.exercise_id === effectiveExerciseId,
      ).length + 1;
    const row = await clientLogSet({
      session_id: activeSession.id,
      exercise_id: effectiveExerciseId,
      set_number: number,
      reps,
      weight_kg: weight,
      rest_seconds: ex?.default_rest_seconds ?? 90,
    });
    if (!row) {
      toast.error("No se pudo registrar la serie");
      return;
    }
    if (isDemoModeClient()) {
      applyState();
    } else {
      setSets((prev) => [...prev, row]);
      router.refresh();
    }
    const rest = ex?.default_rest_seconds ?? 90;
    setRestTotal(rest);
    setRestLeft(rest);
    toast.success(`Serie ${number} registrada`);
  };

  const resetTplForm = () => {
    setEditTplId(null);
    setTplForm({
      name: "",
      weekday: weekday,
      notes: "",
      reminder_enabled: false,
      reminder_time: "18:00",
    });
  };

  const saveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await clientUpsertTemplate(editTplId, {
      name: tplForm.name,
      weekday: tplForm.weekday,
      notes: tplForm.notes || null,
    });
    if (!saved) {
      toast.error("No se pudo guardar la plantilla");
      return;
    }
    if (tplForm.reminder_enabled) {
      const scheduled = await clientScheduleGymReminder({
        templateId: saved.id,
        title: `Gimnasio · ${saved.name}`,
        body: `Rutina de ${WEEKDAYS[saved.weekday ?? weekday]}`,
        reminder_time: tplForm.reminder_time,
      });
      if (!scheduled) {
        toast.message("Plantilla guardada; recordatorio pendiente (sin VAPID)");
      }
    }
    if (isDemoModeClient()) {
      applyState();
    } else {
      setTemplates((prev) => {
        const next = editTplId
          ? prev.map((t) => (t.id === saved.id ? saved : t))
          : [...prev, saved];
        return next.sort((a, b) => a.sort_order - b.sort_order);
      });
      router.refresh();
    }
    toast.success(editTplId ? "Plantilla actualizada" : "Plantilla guardada");
    resetTplForm();
  };

  const removeTemplate = async (id: string) => {
    if (!confirmDelete("¿Eliminar esta plantilla de entrenamiento?")) return;
    const ok = await clientDeleteTemplate(id);
    if (!ok) {
      toast.error("No se pudo eliminar");
      return;
    }
    if (isDemoModeClient()) {
      applyState();
    } else {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setExercises((prev) => prev.filter((e) => e.template_id !== id));
      router.refresh();
    }
    if (editTplId === id) resetTplForm();
    toast.success("Plantilla eliminada");
  };

  const startEditTemplate = (t: WorkoutTemplate) => {
    setEditTplId(t.id);
    setTplForm({
      name: t.name,
      weekday: t.weekday ?? weekday,
      notes: t.notes ?? "",
      reminder_enabled: false,
      reminder_time: "18:00",
    });
  };

  const resetExForm = () => {
    setEditExId(null);
    setExForm({
      template_id: templates[0]?.id ?? "",
      name: "",
      machine: "",
      default_rest_seconds: 90,
    });
  };

  const saveExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exForm.template_id) return;
    const saved = await clientUpsertExercise(editExId, exForm);
    if (!saved) {
      toast.error("No se pudo guardar el ejercicio");
      return;
    }
    if (isDemoModeClient()) {
      applyState();
    } else {
      setExercises((prev) => {
        const next = editExId
          ? prev.map((x) => (x.id === saved.id ? saved : x))
          : [...prev, saved];
        return next.sort((a, b) => a.sort_order - b.sort_order);
      });
      router.refresh();
    }
    toast.success(editExId ? "Ejercicio actualizado" : "Ejercicio añadido");
    resetExForm();
  };

  const removeExercise = async (id: string) => {
    if (!confirmDelete("¿Eliminar este ejercicio?")) return;
    const ok = await clientDeleteExercise(id);
    if (!ok) {
      toast.error("No se puede eliminar: hay series registradas");
      return;
    }
    if (isDemoModeClient()) {
      applyState();
    } else {
      setExercises((prev) => prev.filter((e) => e.id !== id));
      router.refresh();
    }
    if (editExId === id) resetExForm();
    toast.success("Ejercicio eliminado");
  };

  const startEditExercise = (ex: WorkoutExercise) => {
    setEditExId(ex.id);
    setExForm({
      template_id: ex.template_id,
      name: ex.name,
      machine: ex.machine ?? "",
      default_rest_seconds: ex.default_rest_seconds,
    });
  };

  const volumeByDay = sessions
    .filter((s) => s.ended_at)
    .slice(0, 7)
    .map((session) => {
      const day = new Intl.DateTimeFormat("es-EC", {
        timeZone: "America/Guayaquil",
        weekday: "short",
      }).format(new Date(session.started_at));
      return { day, volume: Math.round(sessionVolume(session.id, sets)) };
    })
    .reverse();

  const prByExercise = exercises.map((ex) => {
    const best = sets
      .filter((s) => s.exercise_id === ex.id)
      .reduce((max, s) => Math.max(max, s.weight_kg ?? 0), 0);
    return { name: ex.name.slice(0, 12), pr: best };
  });

  const lastWeight = effectiveExerciseId
    ? lastWeightForExercise(effectiveExerciseId, sets)
    : null;

  const restPct = restTotal > 0 ? ((restTotal - restLeft) / restTotal) * 100 : 0;

  const tabs: { id: TabId; label: string }[] = [
    { id: "hoy", label: "Rutina hoy" },
    { id: "plantillas", label: "Plantillas" },
    { id: "historial", label: "Historial" },
    { id: "stats", label: "Progreso" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map(({ id, label }) => (
          <LcButton
            key={id}
            type="button"
            variant={tab === id ? "pri" : "ghost"}
            size="sm"
            onClick={() => setTab(id)}
          >
            {label}
          </LcButton>
        ))}
      </div>

      {tab === "hoy" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard className="p-4 space-y-3">
            <p className="silk">sesión en vivo</p>
            <p className="font-dot font-black text-4xl text-gym tabular-nums">
              {sessionDurationMin} min
            </p>
            <div className="space-y-1">
              <Label>Rutina</Label>
              <select
                className="w-full h-10 rounded-md border border-border bg-surface px-3 text-sm"
                value={planTplId}
                onChange={(e) => setSessionPlanTplId(e.target.value)}
                disabled={!!activeSession}
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.weekday != null ? ` (${WEEKDAYS[t.weekday]})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-muted-foreground">
              {planExercises.length} ejercicios en plantilla
            </p>
            {!activeSession ? (
              <div className="flex flex-wrap gap-2">
                <LcButton
                  type="button"
                  variant="pri"
                  onClick={() => void startSession(planTplId || null)}
                >
                  Iniciar sesión
                </LcButton>
                <LcButton
                  type="button"
                  variant="ghost"
                  onClick={() => void startSession(null)}
                >
                  Sesión libre
                </LcButton>
              </div>
            ) : (
              <LcButton type="button" variant="ghost" onClick={() => void endSession()}>
                Finalizar sesión
              </LcButton>
            )}

            <div
              className="mx-auto mt-4 relative w-36 h-36 rounded-full border border-border shadow-[var(--shadow-2)] flex items-center justify-center bg-surface"
              aria-label="Temporizador de descanso"
            >
              <MotionRing pct={restPct} />
              <span className="font-mono text-2xl tabular-nums z-10">{restLeft}s</span>
            </div>
            <div className="flex justify-center gap-2">
              <LcButton
                type="button"
                variant="ghost"
                size="sm"
                disabled={restLeft <= 0}
                onClick={() => setRestLeft(0)}
              >
                Saltar descanso
              </LcButton>
            </div>
            <p className="text-xs font-mono text-muted-foreground text-center">descanso</p>

            {activeSessionSets.length > 0 && (
              <ul className="text-xs font-mono space-y-1 border-t border-border pt-3">
                {activeSessionSets.map((s) => {
                  const ex = exercises.find((e) => e.id === s.exercise_id);
                  return (
                    <li key={s.id}>
                      {ex?.name ?? "Ejercicio"} · serie {s.set_number}: {s.reps}×
                      {s.weight_kg ?? "—"} kg
                    </li>
                  );
                })}
              </ul>
            )}
          </GlassCard>

          <GlassCard className="p-4 space-y-3">
            <p className="silk">registrar serie</p>
            <div className="space-y-1">
              <Label>Ejercicio</Label>
              <select
                className="w-full h-10 rounded-md border border-border bg-surface px-3 text-sm"
                value={effectiveExerciseId}
                onChange={(e) => setSelectedExercise(e.target.value)}
              >
                {planExercises.length === 0 ? (
                  <option value="">Sin ejercicios en plantilla</option>
                ) : (
                  planExercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))
                )}
              </select>
              {lastWeight != null && (
                <p className="text-xs font-mono text-muted-foreground">
                  Último peso: {lastWeight} kg
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Reps</Label>
                <Input
                  type="number"
                  min={1}
                  value={reps}
                  onChange={(e) => setReps(Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Peso (kg)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                />
              </div>
            </div>
            <LcButton
              type="button"
              variant="pri"
              className="w-full"
              disabled={!activeSession || !effectiveExerciseId}
              onClick={() => void logSet()}
            >
              Registrar serie
            </LcButton>
          </GlassCard>
        </div>
      )}

      {tab === "plantillas" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard className="p-4 space-y-2">
            <p className="silk">plantillas y catálogo</p>
            <ul className="text-sm space-y-3">
              {templates.map((t) => (
                <li key={t.id} className="border-b border-border pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-medium">{t.name}</span>
                      <span className="font-mono text-xs text-muted-foreground ml-2">
                        {t.weekday != null ? WEEKDAYS[t.weekday] : "—"}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <LcButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditTemplate(t)}
                      >
                        Editar
                      </LcButton>
                      <LcButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => void removeTemplate(t.id)}
                      >
                        Eliminar
                      </LcButton>
                    </div>
                  </div>
                  <ul className="text-xs text-muted-foreground mt-1">
                    {exercises
                      .filter((e) => e.template_id === t.id)
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((e) => (
                        <li
                          key={e.id}
                          className="flex flex-wrap justify-between gap-1 py-0.5"
                        >
                          <span>
                            · {e.name}
                            {e.machine ? ` (${e.machine})` : ""} · {e.default_rest_seconds}s
                          </span>
                          <span className="flex gap-1">
                            <button
                              type="button"
                              className="underline"
                              onClick={() => startEditExercise(e)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="underline text-destructive"
                              onClick={() => void removeExercise(e.id)}
                            >
                              Quitar
                            </button>
                          </span>
                        </li>
                      ))}
                  </ul>
                </li>
              ))}
            </ul>
            {exerciseCatalog.length > 0 && (
              <p className="text-xs font-mono text-muted-foreground pt-2">
                Catálogo: {exerciseCatalog.join(" · ")}
              </p>
            )}
          </GlassCard>
          <div className="space-y-4">
            <GlassCard className="p-4">
              <p className="silk mb-3">
                {editTplId ? "editar plantilla" : "nueva plantilla"}
              </p>
              <form className="space-y-3" onSubmit={(e) => void saveTemplate(e)}>
                <div>
                  <Label>Nombre</Label>
                  <Input
                    required
                    value={tplForm.name}
                    onChange={(e) => setTplForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Día</Label>
                  <select
                    className="w-full h-10 rounded-md border border-border bg-surface px-3 text-sm"
                    value={tplForm.weekday}
                    onChange={(e) =>
                      setTplForm((f) => ({ ...f, weekday: Number(e.target.value) }))
                    }
                  >
                    {WEEKDAYS.map((d, i) => (
                      <option key={d} value={i}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Notas</Label>
                  <Input
                    value={tplForm.notes}
                    onChange={(e) => setTplForm((f) => ({ ...f, notes: e.target.value }))}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="gym-reminder">Recordatorio push</Label>
                  <Switch
                    id="gym-reminder"
                    checked={tplForm.reminder_enabled}
                    onCheckedChange={(v) =>
                      setTplForm((f) => ({ ...f, reminder_enabled: v }))
                    }
                  />
                </div>
                {tplForm.reminder_enabled && (
                  <div>
                    <Label>Hora</Label>
                    <Input
                      type="time"
                      value={tplForm.reminder_time}
                      onChange={(e) =>
                        setTplForm((f) => ({ ...f, reminder_time: e.target.value }))
                      }
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <LcButton type="submit" variant="pri" className="flex-1">
                    {editTplId ? "Actualizar" : "Guardar"}
                  </LcButton>
                  {editTplId && (
                    <LcButton type="button" variant="ghost" onClick={resetTplForm}>
                      Cancelar
                    </LcButton>
                  )}
                </div>
              </form>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="silk mb-3">
                {editExId ? "editar ejercicio" : "ejercicio en plantilla"}
              </p>
              <form className="space-y-3" onSubmit={(e) => void saveExercise(e)}>
                <div>
                  <Label>Plantilla</Label>
                  <select
                    className="w-full h-10 rounded-md border border-border bg-surface px-3 text-sm"
                    value={exForm.template_id}
                    onChange={(e) =>
                      setExForm((f) => ({ ...f, template_id: e.target.value }))
                    }
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Nombre</Label>
                  <Input
                    required
                    list="gym-exercise-catalog"
                    value={exForm.name}
                    onChange={(e) => setExForm((f) => ({ ...f, name: e.target.value }))}
                  />
                  <datalist id="gym-exercise-catalog">
                    {exerciseCatalog.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <Label>Máquina</Label>
                  <Input
                    value={exForm.machine}
                    onChange={(e) => setExForm((f) => ({ ...f, machine: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Descanso (s)</Label>
                  <Input
                    type="number"
                    min={15}
                    step={5}
                    value={exForm.default_rest_seconds}
                    onChange={(e) =>
                      setExForm((f) => ({
                        ...f,
                        default_rest_seconds: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <LcButton type="submit" variant="pri" className="flex-1">
                    {editExId ? "Actualizar" : "Añadir"}
                  </LcButton>
                  {editExId && (
                    <LcButton type="button" variant="ghost" onClick={resetExForm}>
                      Cancelar
                    </LcButton>
                  )}
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      )}

      {tab === "historial" && (
        <GlassCard className="p-4 space-y-3">
          <p className="silk">sesiones recientes</p>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay entrenamientos.</p>
          ) : (
            <ul className="space-y-3">
              {sessions.map((session) => {
                const tpl = templates.find((t) => t.id === session.template_id);
                const vol = Math.round(sessionVolume(session.id, sets));
                const duration =
                  session.ended_at && session.started_at
                    ? Math.max(
                        1,
                        Math.round(
                          (new Date(session.ended_at).getTime() -
                            new Date(session.started_at).getTime()) /
                            60_000,
                        ),
                      )
                    : null;
                const sessionSets = sets.filter((s) => s.session_id === session.id);
                return (
                  <li
                    key={session.id}
                    className="border-b border-border pb-3 last:border-0"
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <p className="font-medium">
                          {tpl?.name ?? "Sesión libre"}
                          {!session.ended_at && (
                            <span className="text-gym text-xs ml-2">en curso</span>
                          )}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground">
                          {new Intl.DateTimeFormat("es-EC", {
                            timeZone: "America/Guayaquil",
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(session.started_at))}
                          {duration != null ? ` · ${duration} min` : ""}
                        </p>
                      </div>
                      <p className="font-mono text-sm tabular-nums">{vol} vol</p>
                    </div>
                    {sessionSets.length > 0 && (
                      <ul className="text-xs font-mono text-muted-foreground mt-2 space-y-0.5">
                        {sessionSets.map((s) => {
                          const ex = exercises.find((e) => e.id === s.exercise_id);
                          return (
                            <li key={s.id}>
                              {ex?.name}: {s.reps}×{s.weight_kg ?? "—"} kg
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </GlassCard>
      )}

      {tab === "stats" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard className="p-4 h-64">
            <p className="silk mb-2">volumen en el tiempo</p>
            {volumeByDay.length === 0 ? (
              <p className="text-sm text-muted-foreground">Completa sesiones para ver tendencias.</p>
            ) : (
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={volumeByDay}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={40} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="var(--gym)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </GlassCard>
          <GlassCard className="p-4 h-64">
            <p className="silk mb-2">mejor peso por ejercicio (kg)</p>
            {prByExercise.length === 0 ? (
              <p className="text-sm text-muted-foreground">Registra series con peso.</p>
            ) : (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={prByExercise}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} width={32} />
                  <Tooltip />
                  <Bar dataKey="pr" fill="var(--gym)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}

function MotionRing({ pct }: { pct: number }) {
  return (
    <div
      className="absolute inset-2 rounded-full border-4 border-gym/20"
      style={{
        background: `conic-gradient(var(--gym) ${pct}%, transparent ${pct}%)`,
        WebkitMaskImage: "radial-gradient(circle, transparent 62%, #000 63%)",
        maskImage: "radial-gradient(circle, transparent 62%, #000 63%)",
      }}
      aria-hidden
    />
  );
}