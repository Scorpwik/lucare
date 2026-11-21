import { getServerDemoState, setServerDemoState } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import {
  persistDailyActivitiesSupabase,
  insertHeartRateSamplesDemo,
  upsertDailyActivitiesDemo,
} from "@/lib/data/health-samples";
import { createClient } from "@/lib/supabase/server";
import type { BodyMetric, SleepLog } from "@/lib/types";

const SOURCE = "health_connect" as const;

export type HealthConnectRows = {
  steps: { activity_date: string; steps: number }[];
  sleep: {
    sleep_date: string;
    hours_slept: number | null;
    bedtime?: string | null;
    wake_time?: string | null;
  }[];
  heart_rate: { recorded_at: string; bpm: number }[];
  weight: { recorded_at: string; weight_kg: number }[];
};

export type ApplyConnectResult = {
  applied: { steps: number; sleep: number; heart_rate: number; weight: number };
  errors: string[];
};

async function resolveUserId(): Promise<string | null> {
  if (isDemoMode()) return getServerDemoState().userId;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function applyHealthConnectRows(rows: HealthConnectRows): Promise<ApplyConnectResult> {
  const userId = await resolveUserId();
  const applied = { steps: 0, sleep: 0, heart_rate: 0, weight: 0 };
  const errors: string[] = [];

  if (!userId) {
    return { applied, errors: ["No autenticado"] };
  }

  if (rows.steps.length) {
    try {
      const payload = rows.steps.map((s) => ({
        activity_date: s.activity_date,
        steps: s.steps,
        source: SOURCE,
      }));
      applied.steps = isDemoMode()
        ? await upsertDailyActivitiesDemo(payload)
        : await persistDailyActivitiesSupabase(userId, payload);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Error al guardar pasos");
    }
  }

  if (rows.heart_rate.length) {
    try {
      const uniqueByTime = new Map<string, { recorded_at: string; bpm: number }>();
      for (const h of rows.heart_rate) {
        uniqueByTime.set(h.recorded_at, h);
      }
      const payload = [...uniqueByTime.values()].map((h) => ({
        recorded_at: h.recorded_at,
        bpm: h.bpm,
        source: SOURCE,
      }));

      if (isDemoMode()) {
        applied.heart_rate = await insertHeartRateSamplesDemo(payload);
      } else {
        const supabase = await createClient();
        for (const h of payload) {
          const { data: existing } = await supabase
            .from("heart_rate_samples")
            .select("id")
            .eq("user_id", userId)
            .eq("recorded_at", h.recorded_at)
            .eq("source", SOURCE)
            .maybeSingle();
          if (existing?.id) continue;
          const { error } = await supabase.from("heart_rate_samples").insert({
            user_id: userId,
            recorded_at: h.recorded_at,
            bpm: h.bpm,
            source: SOURCE,
          });
          if (error) errors.push(error.message);
          else applied.heart_rate += 1;
        }
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Error al guardar pulso");
    }
  }

  for (const s of rows.sleep) {
    try {
      if (isDemoMode()) {
        const state = getServerDemoState();
        const t = new Date().toISOString();
        const idx = state.sleepLogs.findIndex((x) => x.sleep_date === s.sleep_date);
        const row: SleepLog =
          idx >= 0
            ? {
                ...state.sleepLogs[idx],
                hours_slept: s.hours_slept ?? state.sleepLogs[idx].hours_slept,
                bedtime: s.bedtime ?? state.sleepLogs[idx].bedtime,
                wake_time: s.wake_time ?? state.sleepLogs[idx].wake_time,
                notes: "Health Connect",
                updated_at: t,
              }
            : {
                id: crypto.randomUUID(),
                user_id: state.userId,
                sleep_date: s.sleep_date,
                bedtime: s.bedtime ?? null,
                wake_time: s.wake_time ?? null,
                hours_slept: s.hours_slept,
                quality_score: null,
                notes: "Health Connect",
                created_at: t,
                updated_at: t,
              };
        if (idx >= 0) state.sleepLogs[idx] = row;
        else state.sleepLogs.unshift(row);
        setServerDemoState(state);
        applied.sleep += 1;
      } else {
        const supabase = await createClient();
        const { error } = await supabase.from("sleep_logs").upsert(
          {
            user_id: userId,
            sleep_date: s.sleep_date,
            hours_slept: s.hours_slept,
            bedtime: s.bedtime ?? null,
            wake_time: s.wake_time ?? null,
            notes: "Health Connect",
          },
          { onConflict: "user_id,sleep_date" },
        );
        if (error) errors.push(error.message);
        else applied.sleep += 1;
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Error sueño");
    }
  }

  for (const w of rows.weight) {
    try {
      if (isDemoMode()) {
        const state = getServerDemoState();
        const t = new Date().toISOString();
        const idx = state.bodyMetrics.findIndex((m) => m.recorded_at === w.recorded_at);
        const row: BodyMetric =
          idx >= 0
            ? {
                ...state.bodyMetrics[idx],
                weight_kg: w.weight_kg,
                notes: "Health Connect",
                updated_at: t,
              }
            : {
                id: crypto.randomUUID(),
                user_id: state.userId,
                recorded_at: w.recorded_at,
                weight_kg: w.weight_kg,
                waist_cm: null,
                chest_cm: null,
                hips_cm: null,
                body_fat_pct: null,
                muscle_mass_kg: null,
                arm_cm: null,
                thigh_cm: null,
                notes: "Health Connect",
                created_at: t,
                updated_at: t,
              };
        if (idx >= 0) state.bodyMetrics[idx] = row;
        else state.bodyMetrics.unshift(row);
        setServerDemoState(state);
        applied.weight += 1;
      } else {
        const supabase = await createClient();
        const { data: existing } = await supabase
          .from("body_metrics")
          .select("id")
          .eq("user_id", userId)
          .eq("recorded_at", w.recorded_at)
          .maybeSingle();
        if (existing?.id) {
          const { error } = await supabase
            .from("body_metrics")
            .update({ weight_kg: w.weight_kg, notes: "Health Connect" })
            .eq("id", existing.id);
          if (error) errors.push(error.message);
          else applied.weight += 1;
        } else {
          const { error } = await supabase.from("body_metrics").insert({
            user_id: userId,
            recorded_at: w.recorded_at,
            weight_kg: w.weight_kg,
            notes: "Health Connect",
          });
          if (error) errors.push(error.message);
          else applied.weight += 1;
        }
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Error peso");
    }
  }

  return { applied, errors };
}