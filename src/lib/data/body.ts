import { getServerDemoState } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { BodyGoal, BodyMetric, ProgressPhoto } from "@/lib/types";

export type BodyMetricInput = {
  recorded_at: string;
  weight_kg?: number | null;
  waist_cm?: number | null;
  chest_cm?: number | null;
  hips_cm?: number | null;
  body_fat_pct?: number | null;
  muscle_mass_kg?: number | null;
  arm_cm?: number | null;
  thigh_cm?: number | null;
  notes?: string | null;
};

export type BodyGoalInput = {
  target_weight_kg?: number | null;
  target_waist_cm?: number | null;
  target_body_fat_pct?: number | null;
  reminder_time?: string | null;
  reminder_enabled?: boolean;
  notes?: string | null;
};

function normalizeMetric(row: BodyMetric): BodyMetric {
  return {
    ...row,
    body_fat_pct: row.body_fat_pct ?? null,
    muscle_mass_kg: row.muscle_mass_kg ?? null,
    arm_cm: row.arm_cm ?? null,
    thigh_cm: row.thigh_cm ?? null,
  };
}

export async function fetchBodyMetrics(): Promise<BodyMetric[]> {
  if (isDemoMode()) {
    return getServerDemoState().bodyMetrics
      .map(normalizeMetric)
      .sort(
        (a, b) =>
          new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
      );
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("body_metrics")
    .select("*")
    .eq("user_id", user.id)
    .order("recorded_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as BodyMetric[]).map(normalizeMetric);
}

export async function upsertBodyMetric(
  id: string | null,
  input: BodyMetricInput,
): Promise<BodyMetric> {
  if (isDemoMode()) {
    const t = new Date().toISOString();
    const state = getServerDemoState();
    if (id) {
      const idx = state.bodyMetrics.findIndex((m) => m.id === id);
      if (idx >= 0) {
        state.bodyMetrics[idx] = normalizeMetric({
          ...state.bodyMetrics[idx],
          ...input,
          updated_at: t,
        });
        return state.bodyMetrics[idx];
      }
    }
    const row: BodyMetric = normalizeMetric({
      id: crypto.randomUUID(),
      user_id: state.userId,
      weight_kg: input.weight_kg ?? null,
      waist_cm: input.waist_cm ?? null,
      chest_cm: input.chest_cm ?? null,
      hips_cm: input.hips_cm ?? null,
      body_fat_pct: input.body_fat_pct ?? null,
      muscle_mass_kg: input.muscle_mass_kg ?? null,
      arm_cm: input.arm_cm ?? null,
      thigh_cm: input.thigh_cm ?? null,
      notes: input.notes ?? null,
      created_at: t,
      updated_at: t,
      recorded_at: input.recorded_at,
    });
    state.bodyMetrics.unshift(row);
    return row;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const payload = { ...input, user_id: user.id };
  if (id) {
    const { data, error } = await supabase
      .from("body_metrics")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return normalizeMetric(data as BodyMetric);
  }
  const { data, error } = await supabase
    .from("body_metrics")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return normalizeMetric(data as BodyMetric);
}

export async function deleteBodyMetric(id: string): Promise<void> {
  if (isDemoMode()) {
    const state = getServerDemoState();
    state.bodyMetrics = state.bodyMetrics.filter((m) => m.id !== id);
    return;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { error } = await supabase
    .from("body_metrics")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
}

export async function fetchBodyGoal(): Promise<BodyGoal | null> {
  if (isDemoMode()) {
    return getServerDemoState().bodyGoal ?? null;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("body_goals")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as BodyGoal;
  return {
    ...row,
    reminder_time:
      typeof row.reminder_time === "string"
        ? row.reminder_time.slice(0, 5)
        : null,
  };
}

export async function upsertBodyGoal(input: BodyGoalInput): Promise<BodyGoal> {
  if (isDemoMode()) {
    const t = new Date().toISOString();
    const state = getServerDemoState();
    const existing = state.bodyGoal;
    if (existing) {
      state.bodyGoal = {
        ...existing,
        ...input,
        reminder_enabled: input.reminder_enabled ?? existing.reminder_enabled,
        updated_at: t,
      };
      return state.bodyGoal;
    }
    const row: BodyGoal = {
      id: crypto.randomUUID(),
      user_id: state.userId,
      target_weight_kg: input.target_weight_kg ?? null,
      target_waist_cm: input.target_waist_cm ?? null,
      target_body_fat_pct: input.target_body_fat_pct ?? null,
      reminder_time: input.reminder_time ?? null,
      reminder_enabled: input.reminder_enabled ?? false,
      notes: input.notes ?? null,
      created_at: t,
      updated_at: t,
    };
    state.bodyGoal = row;
    return row;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const payload = {
    user_id: user.id,
    ...input,
    reminder_enabled: input.reminder_enabled ?? false,
  };
  const { data, error } = await supabase
    .from("body_goals")
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  const row = data as BodyGoal;
  return {
    ...row,
    reminder_time:
      typeof row.reminder_time === "string"
        ? row.reminder_time.slice(0, 5)
        : null,
  };
}

export async function fetchProgressPhotos(): Promise<ProgressPhoto[]> {
  if (isDemoMode()) {
    return getServerDemoState().progressPhotos;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("progress_photos")
    .select("*")
    .eq("user_id", user.id)
    .order("taken_at", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as ProgressPhoto[];
  return Promise.all(
    rows.map(async (row) => {
      const { data: signed } = await supabase.storage
        .from("progress-photos")
        .createSignedUrl(row.storage_path, 3600);
      return { ...row, preview_url: signed?.signedUrl ?? null };
    }),
  );
}

export async function registerProgressPhoto(
  storagePath: string,
  caption?: string | null,
): Promise<ProgressPhoto> {
  if (isDemoMode()) {
    const t = new Date().toISOString();
    const state = getServerDemoState();
    const row: ProgressPhoto = {
      id: crypto.randomUUID(),
      user_id: state.userId,
      storage_path: storagePath,
      caption: caption ?? null,
      taken_at: t,
      created_at: t,
      preview_url: storagePath.startsWith("blob:") ? storagePath : null,
    };
    state.progressPhotos.unshift(row);
    return row;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data, error } = await supabase
    .from("progress_photos")
    .insert({
      user_id: user.id,
      storage_path: storagePath,
      caption: caption ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  const row = data as ProgressPhoto;
  const { data: signed } = await supabase.storage
    .from("progress-photos")
    .createSignedUrl(row.storage_path, 3600);
  return { ...row, preview_url: signed?.signedUrl ?? null };
}

export async function deleteProgressPhoto(id: string): Promise<void> {
  if (isDemoMode()) {
    const state = getServerDemoState();
    state.progressPhotos = state.progressPhotos.filter((p) => p.id !== id);
    return;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data: row, error: fetchErr } = await supabase
    .from("progress_photos")
    .select("storage_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (fetchErr) throw fetchErr;
  await supabase.storage.from("progress-photos").remove([row.storage_path]);
  const { error } = await supabase
    .from("progress_photos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
}