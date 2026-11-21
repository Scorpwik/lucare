import { getServerDemoState } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { PersonalCareRoutine, PersonalCareStep } from "@/lib/types";

export type PersonalRoutineInput = {
  name: string;
  category?: string;
  reminder_enabled: boolean;
  reminder_start_time?: string | null;
  reminder_end_time?: string | null;
  reminder_interval_minutes?: number | null;
};

export async function fetchPersonalCareRoutines(): Promise<PersonalCareRoutine[]> {
  if (isDemoMode()) {
    return getServerDemoState().personalCareRoutines.sort(
      (a, b) => a.sort_order - b.sort_order,
    );
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("personal_care_routines")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as PersonalCareRoutine[];
}

export async function fetchPersonalCareSteps(
  routineId?: string,
): Promise<PersonalCareStep[]> {
  if (isDemoMode()) {
    const all = getServerDemoState().personalCareSteps;
    return routineId ? all.filter((s) => s.routine_id === routineId) : all;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  let q = supabase
    .from("personal_care_steps")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order");
  if (routineId) q = q.eq("routine_id", routineId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as PersonalCareStep[];
}

export async function upsertPersonalRoutine(
  id: string | null,
  input: PersonalRoutineInput,
): Promise<PersonalCareRoutine> {
  if (isDemoMode()) {
    const t = new Date().toISOString();
    const state = getServerDemoState();
    if (id) {
      const idx = state.personalCareRoutines.findIndex((r) => r.id === id);
      if (idx >= 0) {
        state.personalCareRoutines[idx] = {
          ...state.personalCareRoutines[idx],
          ...input,
          category: input.category ?? "general",
          updated_at: t,
        };
        return state.personalCareRoutines[idx];
      }
    }
    const row: PersonalCareRoutine = {
      id: crypto.randomUUID(),
      user_id: state.userId,
      category: input.category ?? "general",
      sort_order: state.personalCareRoutines.length,
      reminder_start_time: input.reminder_start_time ?? null,
      reminder_end_time: input.reminder_end_time ?? null,
      reminder_interval_minutes: input.reminder_interval_minutes ?? null,
      created_at: t,
      updated_at: t,
      ...input,
    };
    state.personalCareRoutines.push(row);
    return row;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const payload = { ...input, user_id: user.id, category: input.category ?? "general" };
  if (id) {
    const { data, error } = await supabase
      .from("personal_care_routines")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as PersonalCareRoutine;
  }
  const { data, error } = await supabase
    .from("personal_care_routines")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as PersonalCareRoutine;
}