"use client";

import { getDemoState, setDemoState } from "@/lib/demo-store";
import { isDemoModeClient, supabaseConfigured } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { BodyGoal, BodyMetric, ProgressPhoto } from "@/lib/types";
import type { BodyGoalInput, BodyMetricInput } from "@/lib/data/body";

async function bodyApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  const res = await fetch(path, init);
  if (!res.ok) return null;
  return (await res.json()) as T;
}

function normalizeMetric(row: BodyMetric): BodyMetric {
  return {
    ...row,
    body_fat_pct: row.body_fat_pct ?? null,
    muscle_mass_kg: row.muscle_mass_kg ?? null,
    arm_cm: row.arm_cm ?? null,
    thigh_cm: row.thigh_cm ?? null,
  };
}

export async function clientFetchBodyMetrics(): Promise<BodyMetric[]> {
  if (!isDemoModeClient()) {
    const rows = await bodyApi<BodyMetric[]>("/api/body/metrics");
    return (rows ?? []).map(normalizeMetric);
  }
  return getDemoState().bodyMetrics
    .map(normalizeMetric)
    .sort(
      (a, b) =>
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
    );
}

export async function clientUpsertBodyMetric(
  id: string | null,
  input: BodyMetricInput,
): Promise<BodyMetric | null> {
  if (!isDemoModeClient()) {
    return bodyApi<BodyMetric>("/api/body/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...input }),
    });
  }
  let row: BodyMetric | null = null;
  setDemoState((prev) => {
    const t = new Date().toISOString();
    if (id) {
      const bodyMetrics = prev.bodyMetrics.map((m) => {
        if (m.id !== id) return m;
        const next = normalizeMetric({ ...m, ...input, updated_at: t });
        row = next;
        return next;
      });
      return { ...prev, bodyMetrics };
    }
    const created = normalizeMetric({
      id: crypto.randomUUID(),
      user_id: prev.userId,
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
    row = created;
    return { ...prev, bodyMetrics: [created, ...prev.bodyMetrics] };
  });
  return row;
}

export async function clientDeleteBodyMetric(id: string): Promise<boolean> {
  if (!isDemoModeClient()) {
    const res = await fetch(
      `/api/body/metrics?id=${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    return res.ok;
  }
  setDemoState((prev) => ({
    ...prev,
    bodyMetrics: prev.bodyMetrics.filter((m) => m.id !== id),
  }));
  return true;
}

export async function clientFetchBodyGoal(): Promise<BodyGoal | null> {
  if (!isDemoModeClient()) {
    return bodyApi<BodyGoal | null>("/api/body/goals");
  }
  return getDemoState().bodyGoal ?? null;
}

export async function clientUpsertBodyGoal(
  input: BodyGoalInput,
): Promise<BodyGoal | null> {
  if (!isDemoModeClient()) {
    return bodyApi<BodyGoal>("/api/body/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  }
  let goal: BodyGoal | null = null;
  setDemoState((prev) => {
    const t = new Date().toISOString();
    const existing = prev.bodyGoal;
    if (existing) {
      goal = {
        ...existing,
        ...input,
        reminder_enabled: input.reminder_enabled ?? existing.reminder_enabled,
        updated_at: t,
      };
      return { ...prev, bodyGoal: goal };
    }
    goal = {
      id: crypto.randomUUID(),
      user_id: prev.userId,
      target_weight_kg: input.target_weight_kg ?? null,
      target_waist_cm: input.target_waist_cm ?? null,
      target_body_fat_pct: input.target_body_fat_pct ?? null,
      reminder_time: input.reminder_time ?? null,
      reminder_enabled: input.reminder_enabled ?? false,
      notes: input.notes ?? null,
      created_at: t,
      updated_at: t,
    };
    return { ...prev, bodyGoal: goal };
  });
  return goal;
}

export async function clientUploadProgressPhoto(
  file: File,
  caption?: string | null,
): Promise<ProgressPhoto | null> {
  if (isDemoModeClient()) {
    const url = URL.createObjectURL(file);
    const t = new Date().toISOString();
    let created: ProgressPhoto | null = null;
    setDemoState((prev) => {
      created = {
        id: crypto.randomUUID(),
        user_id: prev.userId,
        storage_path: url,
        caption: caption ?? file.name,
        taken_at: t,
        created_at: t,
        preview_url: url,
      };
      return { ...prev, progressPhotos: [created, ...prev.progressPhotos] };
    });
    return created;
  }

  if (!supabaseConfigured()) {
    return null;
  }
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadErr } = await supabase.storage
    .from("progress-photos")
    .upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (uploadErr) return null;

  return bodyApi<ProgressPhoto>("/api/body/photos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ storage_path: path, caption: caption ?? null }),
  });
}

export async function clientDeleteProgressPhoto(id: string): Promise<boolean> {
  if (!isDemoModeClient()) {
    const res = await fetch(
      `/api/body/photos?id=${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    return res.ok;
  }
  setDemoState((prev) => ({
    ...prev,
    progressPhotos: prev.progressPhotos.filter((p) => p.id !== id),
  }));
  return true;
}

export type BodyReminderInput = {
  goalId: string;
  title?: string;
  body?: string;
  reminder_time: string;
};

/** Programa pesaje diario vía stack push existente (degrada sin VAPID). */
export async function clientScheduleBodyWeighIn(
  input: BodyReminderInput,
): Promise<boolean> {
  const [h, m] = input.reminder_time.split(":").map(Number);
  const start = `${String(h).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}`;
  const res = await fetch("/api/push/schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source_type: "body_goal",
      source_id: input.goalId,
      title: input.title ?? "Pesaje LuCare",
      body: input.body ?? "Registra peso y medidas en Cuerpo",
      start_time: start,
      end_time: start,
      interval_minutes: 1440,
    }),
  });
  return res.ok;
}