"use client";

import * as React from "react";
import type { Habit, HabitLog, SleepLog } from "@/lib/types";
import { DomainChip } from "@/components/lucare/domain-chip";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SuenoHabitosChart } from "@/components/sueno-habitos/sueno-habitos-chart";
import { computeStreakToDate } from "@/lib/habit-streak";
import type { HabitInput } from "@/lib/data/sleep-habits";
import {
  clientDeleteHabit,
  clientHabitDoneToday,
  clientScheduleHabitReminder,
  clientScheduleSleepLogReminder,
  clientToggleHabitToday,
  clientUpsertHabit,
  clientUpsertSleepLog,
} from "@/lib/data/sleep-habits-client";
import { getDemoState } from "@/lib/demo-store";
import { isDemoModeClient } from "@/lib/env";
import { useClientNow } from "@/lib/use-client-time";
import { confirmDelete } from "@/lib/feedback";
import { EmptyState } from "@/components/lucare/empty-state";
import { toast } from "sonner";

type Props = {
  initialSleep: SleepLog[];
  initialHabits: Habit[];
  initialHabitLogs: HabitLog[];
};

const defaultHabitForm = (): HabitInput & { id: string | null } => ({
  id: null,
  title: "",
  icon: "✓",
  reminder_enabled: false,
  reminder_start_time: "08:00",
  reminder_end_time: "20:00",
  reminder_interval_minutes: 60,
});

function sleepFormFromLog(log: SleepLog | undefined, fallbackDate: string) {
  if (!log) {
    return {
      sleep_date: fallbackDate,
      bedtime: "22:30",
      wake_time: "06:00",
      hours_slept: "7.5",
      quality_score: "75",
      notes: "",
    };
  }
  return {
    sleep_date: log.sleep_date,
    bedtime: log.bedtime?.slice(0, 5) ?? "22:30",
    wake_time: log.wake_time?.slice(0, 5) ?? "06:00",
    hours_slept: log.hours_slept != null ? String(log.hours_slept) : "",
    quality_score: log.quality_score != null ? String(log.quality_score) : "",
    notes: log.notes ?? "",
  };
}

export function SuenoHabitosPanel({
  initialSleep,
  initialHabits,
  initialHabitLogs,
}: Props) {
  const now = useClientNow();
  const today = now?.toISOString().slice(0, 10) ?? "";
  const [sleepLogs, setSleepLogs] = React.useState(initialSleep);
  const [habits, setHabits] = React.useState(initialHabits);
  const [habitLogs, setHabitLogs] = React.useState(initialHabitLogs);
  const bootDate =
    initialSleep[0]?.sleep_date ??
    initialHabitLogs[0]?.log_date ??
    today;
  const bootLog = initialSleep.find((s) => s.sleep_date === bootDate);
  const [sleepForm, setSleepForm] = React.useState(() =>
    sleepFormFromLog(bootLog, bootDate),
  );
  const [habitForm, setHabitForm] = React.useState(defaultHabitForm);
  const [showHabitForm, setShowHabitForm] = React.useState(false);
  const [sleepReminder, setSleepReminder] = React.useState({
    enabled: false,
    time: "07:30",
  });

  const refreshFromDemo = () => {
    if (!isDemoModeClient()) return;
    const s = getDemoState();
    setSleepLogs(s.sleepLogs);
    setHabits(s.habits.filter((h) => h.is_active));
    setHabitLogs(s.habitLogs);
  };

  const saveSleep = async (e: React.FormEvent) => {
    e.preventDefault();
    const row = await clientUpsertSleepLog({
      sleep_date: sleepForm.sleep_date,
      bedtime: sleepForm.bedtime,
      wake_time: sleepForm.wake_time,
      hours_slept: sleepForm.hours_slept ? Number(sleepForm.hours_slept) : null,
      quality_score: sleepForm.quality_score ? Number(sleepForm.quality_score) : null,
      notes: sleepForm.notes || null,
    });
    if (!isDemoModeClient() && row) {
      setSleepLogs((prev) => {
        const idx = prev.findIndex((s) => s.sleep_date === row.sleep_date);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = row;
          return next;
        }
        return [row, ...prev];
      });
    } else {
      refreshFromDemo();
    }
    if (sleepReminder.enabled) {
      await clientScheduleSleepLogReminder({ reminder_time: sleepReminder.time });
    }
    toast.success("Sueño registrado");
  };

  const loadSleepDate = (log: SleepLog) => {
    setSleepForm(sleepFormFromLog(log, log.sleep_date));
  };

  const toggleHabit = async (habitId: string, done: boolean) => {
    await clientToggleHabitToday(habitId, done, today);
    if (isDemoModeClient()) {
      refreshFromDemo();
    } else {
      setHabitLogs((prev) => {
        const idx = prev.findIndex((l) => l.habit_id === habitId && l.log_date === today);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], completed: done };
          return next;
        }
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            user_id: "",
            habit_id: habitId,
            log_date: today,
            completed: done,
            created_at: new Date().toISOString(),
          },
        ];
      });
    }
  };

  const saveHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitForm.title.trim()) return;
    const input: HabitInput = {
      title: habitForm.title.trim(),
      icon: habitForm.icon || null,
      reminder_enabled: habitForm.reminder_enabled,
      reminder_start_time: habitForm.reminder_start_time,
      reminder_end_time: habitForm.reminder_end_time,
      reminder_interval_minutes: habitForm.reminder_interval_minutes,
    };
    const row = await clientUpsertHabit(habitForm.id, input);
    if (row?.reminder_enabled && row.reminder_start_time && row.reminder_end_time) {
      const scheduled = await clientScheduleHabitReminder({
        habitId: row.id,
        title: row.title,
        start_time: row.reminder_start_time.slice(0, 5),
        end_time: row.reminder_end_time.slice(0, 5),
        interval_minutes: row.reminder_interval_minutes ?? 60,
      });
      if (!scheduled) {
        toast.message("Hábito guardado; push no disponible (revisa VAPID)");
      }
    }
    if (!isDemoModeClient() && row) {
      setHabits((prev) => {
        const idx = prev.findIndex((h) => h.id === row.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = row;
          return next;
        }
        return [...prev, row];
      });
    } else {
      refreshFromDemo();
    }
    setHabitForm(defaultHabitForm());
    setShowHabitForm(false);
    toast.success(habitForm.id ? "Hábito actualizado" : "Hábito creado");
  };

  const editHabit = (h: Habit) => {
    setHabitForm({
      id: h.id,
      title: h.title,
      icon: h.icon ?? "✓",
      reminder_enabled: h.reminder_enabled,
      reminder_start_time: h.reminder_start_time?.slice(0, 5) ?? "08:00",
      reminder_end_time: h.reminder_end_time?.slice(0, 5) ?? "20:00",
      reminder_interval_minutes: h.reminder_interval_minutes ?? 60,
    });
    setShowHabitForm(true);
  };

  const removeHabit = async (id: string) => {
    if (!confirmDelete("¿Archivar este hábito?")) return;
    const ok = await clientDeleteHabit(id);
    if (!ok) {
      toast.error("No se pudo eliminar");
      return;
    }
    if (isDemoModeClient()) refreshFromDemo();
    else setHabits((prev) => prev.filter((h) => h.id !== id));
    toast.success("Hábito archivado");
  };

  const todaySleep = sleepLogs.find((s) => s.sleep_date === today);
  const recentSleep = sleepLogs.filter((s) => s.sleep_date !== sleepForm.sleep_date).slice(0, 5);

  const habitDone = (habitId: string) =>
    isDemoModeClient()
      ? clientHabitDoneToday(habitId, today)
      : habitLogs.some((l) => l.habit_id === habitId && l.log_date === today && l.completed);

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <div className="grid gap-4 lg:grid-cols-2 xl:col-span-8">
        <GlassCard className="p-4 space-y-3">
          <p className="silk">sueño</p>
          <p className="font-dot font-black text-4xl tabular-nums text-sleep">
            {todaySleep?.hours_slept ?? "—"} h
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Hoy · calidad {todaySleep?.quality_score ?? "—"}
          </p>
          <form className="space-y-3 border-t border-border pt-3" onSubmit={saveSleep}>
            <div>
              <Label>Fecha</Label>
              <Input
                type="date"
                value={sleepForm.sleep_date}
                onChange={(e) => setSleepForm((f) => ({ ...f, sleep_date: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Acostarse</Label>
                <Input
                  type="time"
                  value={sleepForm.bedtime}
                  onChange={(e) => setSleepForm((f) => ({ ...f, bedtime: e.target.value }))}
                />
              </div>
              <div>
                <Label>Despertar</Label>
                <Input
                  type="time"
                  value={sleepForm.wake_time}
                  onChange={(e) => setSleepForm((f) => ({ ...f, wake_time: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Horas</Label>
                <Input
                  type="number"
                  step="0.25"
                  value={sleepForm.hours_slept}
                  onChange={(e) => setSleepForm((f) => ({ ...f, hours_slept: e.target.value }))}
                />
              </div>
              <div>
                <Label>Calidad (0–100)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={sleepForm.quality_score}
                  onChange={(e) =>
                    setSleepForm((f) => ({ ...f, quality_score: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Notas</Label>
              <Input
                value={sleepForm.notes}
                onChange={(e) => setSleepForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <FormRow
              label="Recordatorio matutino"
              enabled={sleepReminder.enabled}
              onEnabled={(v: boolean) => setSleepReminder((r) => ({ ...r, enabled: v }))}
            >
              <Input
                type="time"
                value={sleepReminder.time}
                disabled={!sleepReminder.enabled}
                onChange={(e) => setSleepReminder((r) => ({ ...r, time: e.target.value }))}
              />
            </FormRow>
            <LcButton type="submit" variant="pri" className="w-full">
              Guardar sueño
            </LcButton>
          </form>
          {recentSleep.length > 0 && (
            <div className="border-t border-border pt-3 space-y-2">
              <p className="text-xs font-mono text-muted-foreground">Editar otras fechas</p>
              <ul className="space-y-1">
                {recentSleep.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className="text-sm w-full text-left hover:underline"
                      onClick={() => loadSleepDate(s)}
                    >
                      {s.sleep_date} · {s.hours_slept ?? "—"} h · calidad {s.quality_score ?? "—"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="silk">hábitos</p>
            <LcButton
              type="button"
              variant="ghost"
              className="text-xs h-8"
              onClick={() => {
                setHabitForm(defaultHabitForm());
                setShowHabitForm((v) => !v);
              }}
            >
              {showHabitForm ? "Cancelar" : "Nuevo hábito"}
            </LcButton>
          </div>

          {showHabitForm && (
            <form className="space-y-2 border border-border rounded-md p-3" onSubmit={saveHabit}>
              <FormRow label="Título">
                <Input
                  value={habitForm.title}
                  onChange={(e) => setHabitForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ej. Estiramiento"
                />
              </FormRow>
              <FormRow label="Icono">
                <Input
                  value={habitForm.icon ?? ""}
                  onChange={(e) => setHabitForm((f) => ({ ...f, icon: e.target.value }))}
                />
              </FormRow>
              <FormRow
                label="Recordatorios push"
                enabled={habitForm.reminder_enabled}
                onEnabled={(v: boolean) => setHabitForm((f) => ({ ...f, reminder_enabled: v }))}
              >
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input
                    type="time"
                    disabled={!habitForm.reminder_enabled}
                    value={habitForm.reminder_start_time ?? "08:00"}
                    onChange={(e) =>
                      setHabitForm((f) => ({ ...f, reminder_start_time: e.target.value }))
                    }
                  />
                  <Input
                    type="time"
                    disabled={!habitForm.reminder_enabled}
                    value={habitForm.reminder_end_time ?? "20:00"}
                    onChange={(e) =>
                      setHabitForm((f) => ({ ...f, reminder_end_time: e.target.value }))
                    }
                  />
                </div>
                <Input
                  className="mt-2"
                  type="number"
                  min={5}
                  disabled={!habitForm.reminder_enabled}
                  value={habitForm.reminder_interval_minutes ?? 60}
                  onChange={(e) =>
                    setHabitForm((f) => ({
                      ...f,
                      reminder_interval_minutes: Number(e.target.value),
                    }))
                  }
                />
                <p className="text-[10px] font-mono text-muted-foreground mt-1">
                  Intervalo en minutos dentro de la ventana
                </p>
              </FormRow>
              <LcButton type="submit" variant="pri" className="w-full">
                {habitForm.id ? "Actualizar" : "Crear hábito"}
              </LcButton>
            </form>
          )}

          <ul className="space-y-3">
            {habits.length === 0 && (
              <EmptyState
                title="Sin hábitos"
                description="Crea tu primer hábito diario con el botón de arriba."
              />
            )}
            {habits.map((h) => {
              const streak = computeStreakToDate(
                h.id,
                isDemoModeClient() ? getDemoState().habitLogs : habitLogs,
                today,
              );
              const doneToday = habitDone(h.id);
              return (
                <li
                  key={h.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2"
                >
                  <span className="flex items-center gap-2 text-sm min-w-0">
                    <span>{h.icon}</span>
                    <span className="font-medium truncate">{h.title}</span>
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <DomainChip label={`${streak} días`} fun />
                    <Switch checked={doneToday} onCheckedChange={(v) => toggleHabit(h.id, v)} />
                    <LcButton
                      type="button"
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      onClick={() => editHabit(h)}
                    >
                      Editar
                    </LcButton>
                    <LcButton
                      type="button"
                      variant="ghost"
                      className="h-8 px-2 text-xs text-destructive"
                      onClick={() => removeHabit(h.id)}
                    >
                      Quitar
                    </LcButton>
                  </div>
                </li>
              );
            })}
          </ul>
        </GlassCard>
      </div>

      <SuenoHabitosChart sleepLogs={sleepLogs} />
    </div>
  );
}

function FormRow({
  label,
  children,
  enabled,
  onEnabled,
}: {
  label: string;
  children?: React.ReactNode;
  enabled?: boolean;
  onEnabled?: (v: boolean) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        {onEnabled != null && (
          <Switch checked={enabled} onCheckedChange={onEnabled} />
        )}
      </div>
      {children}
    </div>
  );
}