"use client";

import { getDemoState, setDemoState } from "@/lib/demo-store";
import { isDemoModeClient } from "@/lib/env";
import {
  clampSunscreenInterval,
  computeSunscreenNextDue,
  DEFAULT_SUNSCREEN_INTERVAL_MIN,
} from "@/lib/sunscreen";
import type { UserSunscreenSettings } from "@/lib/types";
import { friendlyError } from "@/lib/feedback";
import { toast } from "sonner";

export function clientGetSunscreenSettings(): UserSunscreenSettings {
  return getDemoState().sunscreenSettings;
}

export async function clientFetchSunscreenSettings(): Promise<UserSunscreenSettings | null> {
  if (isDemoModeClient()) {
    return clientGetSunscreenSettings();
  }
  const res = await fetch("/api/sunscreen");
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "No se pudo cargar bloqueador");
  }
  const data = (await res.json()) as { settings: UserSunscreenSettings | null };
  return data.settings;
}

export async function clientMarkSunscreenApplied(): Promise<UserSunscreenSettings> {
  const now = new Date().toISOString();
  if (isDemoModeClient()) {
    setDemoState((prev) => {
      const interval = prev.sunscreenSettings.reapply_interval_minutes;
      const nextDue = computeSunscreenNextDue(now, interval)?.toISOString() ?? null;
      return {
        ...prev,
        sunscreenSettings: {
          ...prev.sunscreenSettings,
          last_applied_at: now,
          next_due_at: nextDue,
          updated_at: now,
        },
      };
    });
    return clientGetSunscreenSettings();
  }
  const res = await fetch("/api/sunscreen", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apply_now: true }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    toast.error(friendlyError(data?.error, "No se pudo registrar"));
    throw new Error(data?.error ?? "patch sunscreen");
  }
  const data = (await res.json()) as { settings: UserSunscreenSettings };
  return data.settings;
}

export async function clientSetSunscreenInterval(minutes: number): Promise<UserSunscreenSettings> {
  const interval = clampSunscreenInterval(minutes);
  if (isDemoModeClient()) {
    setDemoState((prev) => {
      const last = prev.sunscreenSettings.last_applied_at;
      const nextDue = last
        ? computeSunscreenNextDue(last, interval)?.toISOString() ?? null
        : null;
      const t = new Date().toISOString();
      return {
        ...prev,
        sunscreenSettings: {
          ...prev.sunscreenSettings,
          reapply_interval_minutes: interval,
          next_due_at: nextDue,
          updated_at: t,
        },
      };
    });
    return clientGetSunscreenSettings();
  }
  const res = await fetch("/api/sunscreen", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reapply_interval_minutes: interval }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    toast.error(friendlyError(data?.error, "No se pudo guardar intervalo"));
    throw new Error(data?.error ?? "patch interval");
  }
  const data = (await res.json()) as { settings: UserSunscreenSettings };
  return data.settings;
}

export function demoSunscreenFallback(): UserSunscreenSettings {
  const t = new Date().toISOString();
  return {
    user_id: getDemoState().userId,
    last_applied_at: null,
    reapply_interval_minutes: DEFAULT_SUNSCREEN_INTERVAL_MIN,
    next_due_at: null,
    last_notified_due_at: null,
    created_at: t,
    updated_at: t,
  };
}