"use client";

import { getDemoState, setDemoState } from "@/lib/demo-store";
import { isDemoModeClient } from "@/lib/env";
import type { Habit, SleepLog } from "@/lib/types";
import type { HabitInput, SleepLogInput } from "@/lib/data/sleep-habits";
import { computeStreakToDate } from "@/lib/habit-streak";

export function clientGetHabitStreak(habitId: string, asOfDate?: string): number {
  const logs = getDemoState().habitLogs;
  const today = asOfDate ?? new Date().toISOString().slice(0, 10);
  return computeStreakToDate(habitId, logs, today);
}

export function clientHabitDoneToday(habitId: string, today: string): boolean {
  return getDemoState().habitLogs.some(
    (l) => l.habit_id === habitId && l.log_date === today && l.completed,
  );
}

export async function clientUpsertSleepLog(input: SleepLogInput): Promise<SleepLog | null> {
  if (!isDemoModeClient()) {
    const res = await fetch("/api/sleep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) return null;
    return (await res.json()) as SleepLog;
  }
  let row: SleepLog | null = null;
  setDemoState((prev) => {
    const t = new Date().toISOString();
    const idx = prev.sleepLogs.findIndex((s) => s.sleep_date === input.sleep_date);
    if (idx >= 0) {
      const sleepLogs = [...prev.sleepLogs];
      sleepLogs[idx] = { ...sleepLogs[idx], ...input, updated_at: t };
      row = sleepLogs[idx];
      return { ...prev, sleepLogs };
    }
    const created: SleepLog = {
      id: crypto.randomUUID(),
      user_id: prev.userId,
      bedtime: input.bedtime ?? null,
      wake_time: input.wake_time ?? null,
      hours_slept: input.hours_slept ?? null,
      quality_score: input.quality_score ?? null,
      notes: input.notes ?? null,
      created_at: t,
      updated_at: t,
      sleep_date: input.sleep_date,
    };
    row = created;
    return { ...prev, sleepLogs: [created, ...prev.sleepLogs] };
  });
  return row;
}

export async function clientToggleHabitToday(
  habitId: string,
  completed: boolean,
  logDate?: string,
): Promise<boolean> {
  const today = logDate ?? new Date().toISOString().slice(0, 10);
  if (!isDemoModeClient()) {
    const res = await fetch("/api/habits/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId, logDate: today, completed }),
    });
    return res.ok;
  }
  setDemoState((prev) => {
    const idx = prev.habitLogs.findIndex(
      (l) => l.habit_id === habitId && l.log_date === today,
    );
    const t = new Date().toISOString();
    if (idx >= 0) {
      const habitLogs = [...prev.habitLogs];
      habitLogs[idx] = { ...habitLogs[idx], completed };
      return { ...prev, habitLogs };
    }
    return {
      ...prev,
      habitLogs: [
        ...prev.habitLogs,
        {
          id: crypto.randomUUID(),
          user_id: prev.userId,
          habit_id: habitId,
          log_date: today,
          completed,
          created_at: t,
        },
      ],
    };
  });
  return true;
}

export async function clientUpsertHabit(
  id: string | null,
  input: HabitInput,
): Promise<Habit | null> {
  if (!isDemoModeClient()) {
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...input }),
    });
    if (!res.ok) return null;
    return (await res.json()) as Habit;
  }
  let row: Habit | null = null;
  setDemoState((prev) => {
    const t = new Date().toISOString();
    if (id) {
      const habits = prev.habits.map((h) => {
        if (h.id !== id) return h;
        const next: Habit = {
          ...h,
          ...input,
          icon: input.icon ?? h.icon,
          updated_at: t,
        };
        row = next;
        return next;
      });
      return { ...prev, habits };
    }
    const created: Habit = {
      id: crypto.randomUUID(),
      user_id: prev.userId,
      title: input.title,
      icon: input.icon ?? null,
      sort_order: input.sort_order ?? prev.habits.length,
      is_active: true,
      reminder_enabled: input.reminder_enabled,
      reminder_start_time: input.reminder_start_time ?? null,
      reminder_end_time: input.reminder_end_time ?? null,
      reminder_interval_minutes: input.reminder_interval_minutes ?? null,
      created_at: t,
      updated_at: t,
    };
    row = created;
    return { ...prev, habits: [...prev.habits, created] };
  });
  return row;
}

export async function clientDeleteHabit(id: string): Promise<boolean> {
  if (!isDemoModeClient()) {
    const res = await fetch(`/api/habits?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return res.ok;
  }
  setDemoState((prev) => ({
    ...prev,
    habits: prev.habits.map((h) => (h.id === id ? { ...h, is_active: false } : h)),
  }));
  return true;
}

export type HabitReminderScheduleInput = {
  habitId: string;
  title: string;
  start_time: string;
  end_time: string;
  interval_minutes: number;
  body?: string;
};

/** Programa recordatorios de hábito vía stack push existente. */
export async function clientScheduleHabitReminder(
  input: HabitReminderScheduleInput,
): Promise<boolean> {
  const res = await fetch("/api/push/schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source_type: "habit",
      source_id: input.habitId,
      title: input.title,
      body: input.body ?? "Marca tu hábito en LuCare",
      start_time: input.start_time,
      end_time: input.end_time,
      interval_minutes: input.interval_minutes,
    }),
  });
  return res.ok;
}

export type SleepReminderInput = {
  title?: string;
  body?: string;
  reminder_time: string;
};

export async function clientScheduleSleepLogReminder(
  input: SleepReminderInput,
): Promise<boolean> {
  const [h, m] = input.reminder_time.split(":").map(Number);
  const start = `${String(h).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}`;
  const res = await fetch("/api/push/schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source_type: "sleep_log",
      source_id: "daily_sleep",
      title: input.title ?? "Registro de sueño",
      body: input.body ?? "Anota cómo dormiste en Sueño y hábitos",
      start_time: start,
      end_time: start,
      interval_minutes: 1440,
    }),
  });
  return res.ok;
}