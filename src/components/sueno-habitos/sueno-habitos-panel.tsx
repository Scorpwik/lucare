"use client";

import * as React from "react";
import type { Habit, SleepLog } from "@/lib/types";
import { DomainChip } from "@/components/lucare/domain-chip";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  clientGetHabitStreak,
  clientToggleHabitToday,
  clientUpsertSleepLog,
} from "@/lib/data/sleep-habits-client";
import { getDemoState } from "@/lib/demo-store";
import { useClientNow } from "@/lib/use-client-time";
import { toast } from "sonner";

type Props = { initialSleep: SleepLog[]; initialHabits: Habit[] };

export function SuenoHabitosPanel({ initialSleep, initialHabits }: Props) {
  const now = useClientNow();
  const today = now?.toISOString().slice(0, 10) ?? "";
  const [sleepLogs, setSleepLogs] = React.useState(initialSleep);
  const [habits, setHabits] = React.useState(initialHabits);
  const [sleepForm, setSleepForm] = React.useState({
    bedtime: "22:30",
    wake_time: "06:00",
    hours_slept: "7.5",
    quality_score: "75",
    notes: "",
  });

  const saveSleep = (e: React.FormEvent) => {
    e.preventDefault();
    clientUpsertSleepLog({
      sleep_date: today,
      bedtime: sleepForm.bedtime,
      wake_time: sleepForm.wake_time,
      hours_slept: Number(sleepForm.hours_slept),
      quality_score: Number(sleepForm.quality_score),
      notes: sleepForm.notes || null,
    });
    setSleepLogs(getDemoState().sleepLogs);
    toast.success("Sueño registrado");
  };

  const toggleHabit = (habitId: string, done: boolean) => {
    clientToggleHabitToday(habitId, done);
    setHabits(getDemoState().habits);
  };

  const todaySleep = sleepLogs.find((s) => s.sleep_date === today);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <GlassCard className="p-4 space-y-3">
        <p className="silk">sueño de hoy</p>
        <p className="font-dot font-black text-4xl tabular-nums text-sleep">
          {todaySleep?.hours_slept ?? "—"} h
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          Calidad {todaySleep?.quality_score ?? "—"} · {todaySleep?.bedtime?.slice(0, 5)} →{" "}
          {todaySleep?.wake_time?.slice(0, 5)}
        </p>
        <form className="space-y-3 border-t border-border pt-3" onSubmit={saveSleep}>
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
          <LcButton type="submit" variant="pri" className="w-full">
            Guardar sueño
          </LcButton>
        </form>
      </GlassCard>
      <GlassCard className="p-4 space-y-3">
        <p className="silk">hábitos</p>
        <ul className="space-y-3">
          {habits.map((h) => {
            const streak = clientGetHabitStreak(h.id);
            const doneToday = getDemoState().habitLogs.some(
              (l) => l.habit_id === h.id && l.log_date === today && l.completed,
            );
            return (
              <li
                key={h.id}
                className="flex items-center justify-between gap-2 border-b border-border pb-2"
              >
                <span className="flex items-center gap-2 text-sm">
                  <span>{h.icon}</span>
                  <span className="font-medium">{h.title}</span>
                </span>
                <div className="flex items-center gap-2">
                  <DomainChip label={`${streak} días`} fun domain="default" />
                  <Switch checked={doneToday} onCheckedChange={(v) => toggleHabit(h.id, v)} />
                </div>
              </li>
            );
          })}
        </ul>
      </GlassCard>
    </div>
  );
}
