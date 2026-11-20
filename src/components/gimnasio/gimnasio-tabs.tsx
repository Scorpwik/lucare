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
import {
  clientEndSession,
  clientGetActiveSession,
  clientLogSet,
  clientStartSession,
  clientUpsertExercise,
  clientUpsertTemplate,
} from "@/lib/data/gym-client";
import { getDemoState } from "@/lib/demo-store";
import { useClientNow } from "@/lib/use-client-time";
import { toast } from "sonner";

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

type Props = {
  templates: WorkoutTemplate[];
  exercises: WorkoutExercise[];
  sessions: WorkoutSession[];
  sets: WorkoutSet[];
};

export function GimnasioTabs({
  templates: initialTemplates,
  exercises: initialExercises,
  sessions: initialSessions,
  sets: initialSets,
}: Props) {
  const now = useClientNow();
  const [tab, setTab] = React.useState<"hoy" | "plantillas" | "stats">("hoy");
  const [templates, setTemplates] = React.useState(initialTemplates);
  const [exercises, setExercises] = React.useState(initialExercises);
  const [sessions, setSessions] = React.useState(initialSessions);
  const [sets, setSets] = React.useState(initialSets);
  const [activeSession, setActiveSession] = React.useState(
    () => clientGetActiveSession() ?? initialSessions.find((s) => !s.ended_at) ?? null,
  );
  const [selectedExercise, setSelectedExercise] = React.useState<string>(
    initialExercises[0]?.id ?? "",
  );
  const [reps, setReps] = React.useState(10);
  const [weight, setWeight] = React.useState(40);
  const [restLeft, setRestLeft] = React.useState(0);
  const [restTotal, setRestTotal] = React.useState(90);

  const [tplForm, setTplForm] = React.useState({
    name: "",
    weekday: 0,
    notes: "",
  });
  const [exForm, setExForm] = React.useState({
    template_id: initialTemplates[0]?.id ?? "",
    name: "",
    machine: "",
    default_rest_seconds: 90,
  });

  const weekday = now?.getDay() ?? 0;
  const todayTpl = templates.find((t) => t.weekday === weekday) ?? templates[0];
  const todayExercises = exercises.filter((e) => e.template_id === todayTpl?.id);

  React.useEffect(() => {
    if (restLeft <= 0) return;
    const id = window.setInterval(() => {
      setRestLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [restLeft]);

  const sessionDurationMin =
    activeSession && now
      ? Math.max(
          0,
          Math.floor(
            (now.getTime() - new Date(activeSession.started_at).getTime()) / 60_000,
          ),
        )
      : 0;

  const refreshDemo = () => {
    const s = getDemoState();
    setTemplates(s.workoutTemplates);
    setExercises(s.workoutExercises);
    setSessions(s.workoutSessions);
    setSets(s.workoutSets);
    setActiveSession(clientGetActiveSession());
  };

  const startSession = () => {
    const s = clientStartSession(todayTpl?.id ?? null);
    refreshDemo();
    if (s) setActiveSession(s);
    toast.success("Sesión iniciada");
  };

  const endSession = () => {
    if (!activeSession) return;
    clientEndSession(activeSession.id);
    refreshDemo();
    setActiveSession(null);
    toast.success("Sesión finalizada");
  };

  const logSet = () => {
    if (!activeSession || !selectedExercise) return;
    const ex = exercises.find((e) => e.id === selectedExercise);
    const number =
      sets.filter(
        (s) => s.session_id === activeSession.id && s.exercise_id === selectedExercise,
      ).length + 1;
    clientLogSet({
      session_id: activeSession.id,
      exercise_id: selectedExercise,
      set_number: number,
      reps,
      weight_kg: weight,
      rest_seconds: ex?.default_rest_seconds ?? 90,
    });
    refreshDemo();
    const rest = ex?.default_rest_seconds ?? 90;
    setRestTotal(rest);
    setRestLeft(rest);
    toast.success(`Serie ${number} registrada`);
  };

  const saveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    clientUpsertTemplate(null, {
      name: tplForm.name,
      weekday: tplForm.weekday || now?.getDay() || 0,
      notes: tplForm.notes || null,
    });
    refreshDemo();
    toast.success("Plantilla guardada");
    setTplForm({ name: "", weekday, notes: "" });
  };

  const saveExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exForm.template_id) return;
    clientUpsertExercise(null, exForm);
    refreshDemo();
    toast.success("Ejercicio añadido");
    setExForm({
      template_id: exForm.template_id,
      name: "",
      machine: "",
      default_rest_seconds: 90,
    });
  };

  const volumeByDay = sessions
    .slice(0, 7)
    .map((session) => {
      const day = new Intl.DateTimeFormat("es-EC", {
        timeZone: "America/Guayaquil",
        weekday: "short",
      }).format(new Date(session.started_at));
      const vol = sets
        .filter((s) => s.session_id === session.id)
        .reduce((acc, s) => acc + (s.reps ?? 0) * (s.weight_kg ?? 0), 0);
      return { day, volume: Math.round(vol) };
    })
    .reverse();

  const prByExercise = exercises.map((ex) => {
    const best = sets
      .filter((s) => s.exercise_id === ex.id)
      .reduce((max, s) => Math.max(max, s.weight_kg ?? 0), 0);
    return { name: ex.name.slice(0, 12), pr: best };
  });

  const restPct = restTotal > 0 ? ((restTotal - restLeft) / restTotal) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["hoy", "Rutina hoy"],
            ["plantillas", "Plantillas"],
            ["stats", "Estadísticas"],
          ] as const
        ).map(([id, label]) => (
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
            <p className="text-sm">
              {todayTpl?.name ?? "Sin plantilla"} · {todayExercises.length} ejercicios
            </p>
            {!activeSession ? (
              <LcButton type="button" variant="pri" onClick={startSession}>
                Iniciar sesión
              </LcButton>
            ) : (
              <LcButton type="button" variant="ghost" onClick={endSession}>
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
            <p className="text-xs font-mono text-muted-foreground text-center">descanso</p>
          </GlassCard>

          <GlassCard className="p-4 space-y-3">
            <p className="silk">registrar serie</p>
            <div className="space-y-1">
              <Label>Ejercicio</Label>
              <select
                className="w-full h-10 rounded-md border border-border bg-surface px-3 text-sm"
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
              >
                {todayExercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
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
              disabled={!activeSession}
              onClick={logSet}
            >
              Registrar serie
            </LcButton>
          </GlassCard>
        </div>
      )}

      {tab === "plantillas" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard className="p-4 space-y-2">
            <p className="silk">plantillas</p>
            <ul className="text-sm space-y-2">
              {templates.map((t) => (
                <li key={t.id} className="border-b border-border pb-2">
                  <span className="font-medium">{t.name}</span>
                  <span className="font-mono text-xs text-muted-foreground ml-2">
                    {t.weekday != null ? WEEKDAYS[t.weekday] : "—"}
                  </span>
                  <ul className="text-xs text-muted-foreground mt-1">
                    {exercises
                      .filter((e) => e.template_id === t.id)
                      .map((e) => (
                        <li key={e.id}>
                          · {e.name}
                          {e.machine ? ` (${e.machine})` : ""}
                        </li>
                      ))}
                  </ul>
                </li>
              ))}
            </ul>
          </GlassCard>
          <div className="space-y-4">
            <GlassCard className="p-4">
              <p className="silk mb-3">nueva plantilla</p>
              <form className="space-y-3" onSubmit={saveTemplate}>
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
                <LcButton type="submit" variant="pri" className="w-full">
                  Guardar plantilla
                </LcButton>
              </form>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="silk mb-3">ejercicio en plantilla</p>
              <form className="space-y-3" onSubmit={saveExercise}>
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
                    value={exForm.name}
                    onChange={(e) => setExForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Máquina</Label>
                  <Input
                    value={exForm.machine}
                    onChange={(e) => setExForm((f) => ({ ...f, machine: e.target.value }))}
                  />
                </div>
                <LcButton type="submit" variant="pri" className="w-full">
                  Añadir ejercicio
                </LcButton>
              </form>
            </GlassCard>
          </div>
        </div>
      )}

      {tab === "stats" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard className="p-4 h-64">
            <p className="silk mb-2">volumen en el tiempo</p>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={volumeByDay}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={40} />
                <Tooltip />
                <Line type="monotone" dataKey="volume" stroke="var(--gym)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
          <GlassCard className="p-4 h-64">
            <p className="silk mb-2">PR por ejercicio (kg)</p>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={prByExercise}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} width={32} />
                <Tooltip />
                <Bar dataKey="pr" fill="var(--gym)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
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
