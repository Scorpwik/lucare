import { getServerDemoState } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import {
  clampSunscreenInterval,
  computeSunscreenNextDue,
  DEFAULT_SUNSCREEN_INTERVAL_MIN,
} from "@/lib/sunscreen";
import type { UserSunscreenSettings } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

function isMissingSchemaError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = "code" in err ? String((err as { code?: string }).code) : "";
  const message = "message" in err ? String((err as { message?: string }).message) : "";
  return (
    code === "42P01" ||
    code === "42703" ||
    code === "PGRST204" ||
    message.includes("user_sunscreen_settings")
  );
}

function defaultSettings(userId: string): UserSunscreenSettings {
  const t = new Date().toISOString();
  return {
    user_id: userId,
    last_applied_at: null,
    reapply_interval_minutes: DEFAULT_SUNSCREEN_INTERVAL_MIN,
    next_due_at: null,
    last_notified_due_at: null,
    created_at: t,
    updated_at: t,
  };
}

export async function fetchSunscreenSettings(): Promise<UserSunscreenSettings | null> {
  if (isDemoMode()) {
    return getServerDemoState().sunscreenSettings;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_sunscreen_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    if (isMissingSchemaError(error)) return defaultSettings(user.id);
    throw error;
  }
  if (!data) return defaultSettings(user.id);
  return data as UserSunscreenSettings;
}

export type SunscreenPatch = {
  last_applied_at?: string | null;
  reapply_interval_minutes?: number;
};

export async function upsertSunscreenSettings(patch: SunscreenPatch): Promise<UserSunscreenSettings> {
  if (isDemoMode()) {
    const state = getServerDemoState();
    const prev = state.sunscreenSettings;
    const interval = clampSunscreenInterval(
      patch.reapply_interval_minutes ?? prev.reapply_interval_minutes,
    );
    const lastApplied =
      patch.last_applied_at !== undefined ? patch.last_applied_at : prev.last_applied_at;
    const nextDue = lastApplied
      ? computeSunscreenNextDue(lastApplied, interval)?.toISOString() ?? null
      : null;
    state.sunscreenSettings = {
      ...prev,
      last_applied_at: lastApplied,
      reapply_interval_minutes: interval,
      next_due_at: nextDue,
      updated_at: new Date().toISOString(),
    };
    return state.sunscreenSettings;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sin sesión");

  const existing = await fetchSunscreenSettings();
  const interval = clampSunscreenInterval(
    patch.reapply_interval_minutes ?? existing?.reapply_interval_minutes ?? DEFAULT_SUNSCREEN_INTERVAL_MIN,
  );
  const lastApplied =
    patch.last_applied_at !== undefined
      ? patch.last_applied_at
      : (existing?.last_applied_at ?? null);
  const nextDue = lastApplied
    ? computeSunscreenNextDue(lastApplied, interval)?.toISOString() ?? null
    : null;

  const row = {
    user_id: user.id,
    last_applied_at: lastApplied,
    reapply_interval_minutes: interval,
    next_due_at: nextDue,
  };

  const { data, error } = await supabase
    .from("user_sunscreen_settings")
    .upsert(row, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) {
    if (isMissingSchemaError(error)) {
      return {
        ...defaultSettings(user.id),
        ...row,
        last_notified_due_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    throw error;
  }
  return data as UserSunscreenSettings;
}