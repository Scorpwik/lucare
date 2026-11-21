import { getServerDemoState } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Habit, HabitLog, SleepLog } from "@/lib/types";

export type SleepLogInput = {
  sleep_date: string;
  bedtime?: string | null;
  wake_time?: string | null;
  hours_slept?: number | null;
  quality_score?: number | null;
  notes?: string | null;
};

export async function fetchSleepLogs(limit = 14): Promise<SleepLog[]> {
  if (isDemoMode()) {
    return getServerDemoState().sleepLogs
      .sort((a, b) => b.sleep_date.localeCompare(a.sleep_date))
      .slice(0, limit);
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("sleep_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("sleep_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as SleepLog[];
}

export async function upsertSleepLog(
  input: SleepLogInput,
): Promise<SleepLog> {
  if (isDemoMode()) {
    const t = new Date().toISOString();
    const state = getServerDemoState();
    const idx = state.sleepLogs.findIndex(
      (s) => s.sleep_date === input.sleep_date,
    );
    if (idx >= 0) {
      state.sleepLogs[idx] = { ...state.sleepLogs[idx], ...input, updated_at: t };
      return state.sleepLogs[idx];
    }
    const row: SleepLog = {
      id: crypto.randomUUID(),
      user_id: state.userId,
      bedtime: input.bedtime ?? null,
      wake_time: input.wake_time ?? null,
      hours_slept: input.hours_slept ?? null,
      quality_score: input.quality_score ?? null,
      notes: input.notes ?? null,
      created_at: t,
      updated_at: t,
      sleep_date: input.sleep_date,
    };
    state.sleepLogs.unshift(row);
    return row;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data, error } = await supabase
    .from("sleep_logs")
    .upsert({ ...input, user_id: user.id }, { onConflict: "user_id,sleep_date" })
    .select()
    .single();
  if (error) throw error;
  return data as SleepLog;
}

export async function fetchHabits(): Promise<Habit[]> {
  if (isDemoMode()) {
    return getServerDemoState().habits.filter((h) => h.is_active);
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as Habit[];
}

export async function fetchHabitLogs(): Promise<HabitLog[]> {
  if (isDemoMode()) {
    return getServerDemoState().habitLogs;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false })
    .limit(400);
  if (error) throw error;
  return (data ?? []) as HabitLog[];
}

export function computeStreak(
  habitId: string,
  logs: HabitLog[],
  anchorDate?: string,
): number {
  const dates = new Set(
    logs.filter((l) => l.habit_id === habitId && l.completed).map((l) => l.log_date),
  );
  const habitDates = [...dates].sort();
  const anchor = anchorDate ?? habitDates.at(-1);
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

export async function toggleHabitLog(
  habitId: string,
  logDate: string,
  completed: boolean,
): Promise<void> {
  if (isDemoMode()) {
    const state = getServerDemoState();
    const idx = state.habitLogs.findIndex(
      (l) => l.habit_id === habitId && l.log_date === logDate,
    );
    const t = new Date().toISOString();
    if (idx >= 0) {
      state.habitLogs[idx].completed = completed;
      return;
    }
    state.habitLogs.push({
      id: crypto.randomUUID(),
      user_id: state.userId,
      habit_id: habitId,
      log_date: logDate,
      completed,
      created_at: t,
    });
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  await supabase.from("habit_logs").upsert(
    {
      user_id: user.id,
      habit_id: habitId,
      log_date: logDate,
      completed,
    },
    { onConflict: "user_id,habit_id,log_date" },
  );
}