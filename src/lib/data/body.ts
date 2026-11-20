import { getServerDemoState } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { BodyMetric, ProgressPhoto } from "@/lib/types";

export type BodyMetricInput = {
  recorded_at: string;
  weight_kg?: number | null;
  waist_cm?: number | null;
  chest_cm?: number | null;
  hips_cm?: number | null;
  notes?: string | null;
};

export async function fetchBodyMetrics(): Promise<BodyMetric[]> {
  if (isDemoMode()) {
    return getServerDemoState().bodyMetrics.sort(
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
  return (data ?? []) as BodyMetric[];
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
        state.bodyMetrics[idx] = { ...state.bodyMetrics[idx], ...input, updated_at: t };
        return state.bodyMetrics[idx];
      }
    }
    const row: BodyMetric = {
      id: crypto.randomUUID(),
      user_id: state.userId,
      weight_kg: input.weight_kg ?? null,
      waist_cm: input.waist_cm ?? null,
      chest_cm: input.chest_cm ?? null,
      hips_cm: input.hips_cm ?? null,
      notes: input.notes ?? null,
      created_at: t,
      updated_at: t,
      recorded_at: input.recorded_at,
    };
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
    return data as BodyMetric;
  }
  const { data, error } = await supabase
    .from("body_metrics")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as BodyMetric;
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
  return data as ProgressPhoto;
}
