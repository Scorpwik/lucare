"use client";

import { setDemoState } from "@/lib/demo-store";
import { isDemoModeClient } from "@/lib/env";
import type { BodyMetric, ProgressPhoto } from "@/lib/types";
import type { BodyMetricInput } from "@/lib/data/body";

export function clientUpsertBodyMetric(
  id: string | null,
  input: BodyMetricInput,
): void {
  if (!isDemoModeClient()) {
    void fetch("/api/body/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...input }),
    });
    return;
  }
  setDemoState((prev) => {
    const t = new Date().toISOString();
    if (id) {
      return {
        ...prev,
        bodyMetrics: prev.bodyMetrics.map((m) =>
          m.id === id ? { ...m, ...input, updated_at: t } : m,
        ),
      };
    }
    const row: BodyMetric = {
      id: crypto.randomUUID(),
      user_id: prev.userId,
      weight_kg: input.weight_kg ?? null,
      waist_cm: input.waist_cm ?? null,
      chest_cm: input.chest_cm ?? null,
      hips_cm: input.hips_cm ?? null,
      notes: input.notes ?? null,
      created_at: t,
      updated_at: t,
      recorded_at: input.recorded_at,
    };
    return { ...prev, bodyMetrics: [row, ...prev.bodyMetrics] };
  });
}

export function clientAddProgressPhotoLocal(
  blobUrl: string,
  caption?: string | null,
): ProgressPhoto {
  const t = new Date().toISOString();
  let created!: ProgressPhoto;
  setDemoState((prev) => {
    created = {
      id: crypto.randomUUID(),
      user_id: prev.userId,
      storage_path: blobUrl,
      caption: caption ?? null,
      taken_at: t,
      created_at: t,
      preview_url: blobUrl,
    };
    return { ...prev, progressPhotos: [created, ...prev.progressPhotos] };
  });
  return created;
}
