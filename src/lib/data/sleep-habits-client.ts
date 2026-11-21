"use client";

import { getDemoState, setDemoState } from "@/lib/demo-store";
import { isDemoModeClient } from "@/lib/env";
import type { SleepLog } from "@/lib/types";
import type { SleepLogInput } from "@/lib/data/sleep-habits";

export function clientUpsertSleepLog(input: SleepLogInput): void {
  if (!isDemoModeClient()) {
    void fetch("/api/sleep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return;
  }
  setDemoState((prev) => {
    const t = new Date().toISOString();
    const idx = prev.sleepLogs.findIndex((s) => s.sleep_date === input.sleep_date);
    if (idx >= 0) {
      const sleepLogs = [...prev.sleepLogs];
      sleepLogs[idx] = { ...sleepLogs[idx], ...input, updated_at: t };
      return { ...prev, sleepLogs };
    }
    const row: SleepLog = {
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
    return { ...prev, sleepLogs: [row, ...prev.sleepLogs] };
  });
}

export function clientToggleHabitToday(habitId: string, completed: boolean): void {
  const today = new Date().toISOString().slice(0, 10);
  if (!isDemoModeClient()) {
    void fetch("/api/habits/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId, logDate: today, completed }),
    });
    return;
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
}

export function clientGetHabitStreak(habitId: string): number {
  const logs = getDemoState().habitLogs.filter(
    (l) => l.habit_id === habitId && l.completed,
  );
  const dates = new Set(logs.map((l) => l.log_date));
  const anchor = [...dates].sort().at(-1);
  if (!anchor) return 0;
  let streak = 0;
  const [y, m, d] = anchor.split("-").map(Number);
  const cursor = new Date(y, (m ?? 1) - 1, d ?? 1);
  for (;;) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (!dates.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}