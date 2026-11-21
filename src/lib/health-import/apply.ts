import { getServerDemoState, setServerDemoState } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import type { ParsedHealthRow } from "@/lib/health-import/parse";
import {
  insertHeartRateSamplesDemo,
  persistDailyActivitiesSupabase,
  persistHeartRateSamplesSupabase,
  upsertDailyActivitiesDemo,
} from "@/lib/data/health-samples";
import { createClient } from "@/lib/supabase/server";
import type { BodyMetric, HealthSampleSource, SleepLog } from "@/lib/types";

export type ImportApplyResult = {
  applied: Record<ParsedHealthRow["kind"], number>;
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

export async function applyHealthRows(
  rows: ParsedHealthRow[],
  source: HealthSampleSource,
): Promise<ImportApplyResult> {
  const userId = await resolveUserId();
  if (!userId) {
    return {
      applied: { steps: 0, sleep: 0, heart_rate: 0, weight: 0 },
      errors: ["No autenticado"],
    };
  }

  const applied = { steps: 0, sleep: 0, heart_rate: 0, weight: 0 };
  const errors: string[] = [];

  const steps = rows.filter((r) => r.kind === "steps");
  const sleep = rows.filter((r) => r.kind === "sleep");
  const hr = rows.filter((r) => r.kind === "heart_rate");
  const weight = rows.filter((r) => r.kind === "weight");

  if (steps.length) {
    try {
      if (isDemoMode()) {
        applied.steps = await upsertDailyActivitiesDemo(
          steps.map((s) => ({
            activity_date: s.date,
            steps: s.steps,
            source,
          })),
        );
      } else {
        applied.steps = await persistDailyActivitiesSupabase(
          userId,
          steps.map((s) => ({
            activity_date: s.date,
            steps: s.steps,
            source,
          })),
        );
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Error al guardar pasos");
    }
  }

  if (hr.length) {
    try {
      const payload = hr.map((h) => ({
        recorded_at: h.at,
        bpm: h.bpm,
        source,
      }));
      applied.heart_rate = isDemoMode()
        ? await insertHeartRateSamplesDemo(payload)
        : await persistHeartRateSamplesSupabase(userId, payload);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Error al guardar pulso");
    }
  }

  if (sleep.length) {
    for (const s of sleep) {
      try {
        if (isDemoMode()) {
          const state = getServerDemoState();
          const t = new Date().toISOString();
          const idx = state.sleepLogs.findIndex((x) => x.sleep_date === s.date);
          const row: SleepLog =
            idx >= 0
              ? {
                  ...state.sleepLogs[idx],
                  hours_slept: s.hours ?? state.sleepLogs[idx].hours_slept,
                  quality_score: s.quality ?? state.sleepLogs[idx].quality_score,
                  updated_at: t,
                }
              : {
                  id: crypto.randomUUID(),
                  user_id: state.userId,
                  sleep_date: s.date,
                  bedtime: null,
                  wake_time: null,
                  hours_slept: s.hours,
                  quality_score: s.quality,
                  notes: "Importado",
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
              sleep_date: s.date,
              hours_slept: s.hours,
              quality_score: s.quality,
              notes: "Importado",
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
  }

  if (weight.length) {
    for (const w of weight) {
      try {
        if (isDemoMode()) {
          const state = getServerDemoState();
          const t = new Date().toISOString();
          const idx = state.bodyMetrics.findIndex((m) => m.recorded_at === w.date);
          const row: BodyMetric =
            idx >= 0
              ? {
                  ...state.bodyMetrics[idx],
                  weight_kg: w.weightKg,
                  updated_at: t,
                }
              : {
                  id: crypto.randomUUID(),
                  user_id: state.userId,
                  recorded_at: w.date,
                  weight_kg: w.weightKg,
                  waist_cm: null,
                  chest_cm: null,
                  hips_cm: null,
                  body_fat_pct: null,
                  muscle_mass_kg: null,
                  arm_cm: null,
                  thigh_cm: null,
                  notes: "Importado",
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
            .eq("recorded_at", w.date)
            .maybeSingle();
          if (existing?.id) {
            const { error } = await supabase
              .from("body_metrics")
              .update({ weight_kg: w.weightKg, notes: "Importado" })
              .eq("id", existing.id);
            if (error) errors.push(error.message);
            else applied.weight += 1;
          } else {
            const { error } = await supabase.from("body_metrics").insert({
              user_id: userId,
              recorded_at: w.date,
              weight_kg: w.weightKg,
              notes: "Importado",
            });
            if (error) errors.push(error.message);
            else applied.weight += 1;
          }
        }
      } catch (e) {
        errors.push(e instanceof Error ? e.message : "Error peso");
      }
    }
  }

  return { applied, errors };
}