import { getServerDemoState, setServerDemoState } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import type { DailyActivity, HeartRateSample, HealthSampleSource } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export async function fetchDailyActivities(limit = 14): Promise<DailyActivity[]> {
  if (isDemoMode()) {
    return [...getServerDemoState().dailyActivities]
      .sort((a, b) => b.activity_date.localeCompare(a.activity_date))
      .slice(0, limit);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("daily_activities")
    .select("*")
    .eq("user_id", user.id)
    .order("activity_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as DailyActivity[];
}

export async function fetchHeartRateSamples(limit = 50): Promise<HeartRateSample[]> {
  if (isDemoMode()) {
    return [...getServerDemoState().heartRateSamples]
      .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))
      .slice(0, limit);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("heart_rate_samples")
    .select("*")
    .eq("user_id", user.id)
    .order("recorded_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as HeartRateSample[];
}

export async function upsertDailyActivitiesDemo(
  rows: Omit<DailyActivity, "id" | "user_id" | "created_at" | "updated_at">[],
): Promise<number> {
  const state = getServerDemoState();
  let count = 0;
  for (const row of rows) {
    const idx = state.dailyActivities.findIndex(
      (a) => a.activity_date === row.activity_date && a.source === row.source,
    );
    const t = new Date().toISOString();
    if (idx >= 0) {
      state.dailyActivities[idx] = {
        ...state.dailyActivities[idx],
        steps: row.steps,
        updated_at: t,
      };
    } else {
      state.dailyActivities.push({
        id: crypto.randomUUID(),
        user_id: state.userId,
        activity_date: row.activity_date,
        steps: row.steps,
        source: row.source,
        created_at: t,
        updated_at: t,
      });
    }
    count += 1;
  }
  setServerDemoState(state);
  return count;
}

export async function insertHeartRateSamplesDemo(
  rows: { recorded_at: string; bpm: number; source: HealthSampleSource }[],
): Promise<number> {
  const state = getServerDemoState();
  const t = new Date().toISOString();
  for (const row of rows) {
    state.heartRateSamples.push({
      id: crypto.randomUUID(),
      user_id: state.userId,
      recorded_at: row.recorded_at,
      bpm: row.bpm,
      source: row.source,
      created_at: t,
    });
  }
  setServerDemoState(state);
  return rows.length;
}

export async function persistDailyActivitiesSupabase(
  userId: string,
  rows: { activity_date: string; steps: number | null; source: HealthSampleSource }[],
): Promise<number> {
  const supabase = await createClient();
  let count = 0;
  for (const row of rows) {
    const { error } = await supabase.from("daily_activities").upsert(
      {
        user_id: userId,
        activity_date: row.activity_date,
        steps: row.steps,
        source: row.source,
      },
      { onConflict: "user_id,activity_date,source" },
    );
    if (!error) count += 1;
  }
  return count;
}

export async function persistHeartRateSamplesSupabase(
  userId: string,
  rows: { recorded_at: string; bpm: number; source: HealthSampleSource }[],
): Promise<number> {
  if (rows.length === 0) return 0;
  const supabase = await createClient();
  const payload = rows.map((r) => ({
    user_id: userId,
    recorded_at: r.recorded_at,
    bpm: r.bpm,
    source: r.source,
  }));
  const { error } = await supabase.from("heart_rate_samples").insert(payload);
  if (error) throw error;
  return payload.length;
}