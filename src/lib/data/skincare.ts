import { getServerDemoState } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { SkincareRoutine, SkincareStep } from "@/lib/types";
import type { RoutineInput, StepInput } from "@/lib/data/form-types";

export async function fetchSkincareRoutines(): Promise<SkincareRoutine[]> {
  if (isDemoMode()) {
    return getServerDemoState().routines.sort((a, b) => a.sort_order - b.sort_order);
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("skincare_routines")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as SkincareRoutine[];
}

export async function fetchSkincareSteps(
  routineId?: string,
): Promise<SkincareStep[]> {
  if (isDemoMode()) {
    const steps = getServerDemoState().steps;
    return routineId
      ? steps.filter((s) => s.routine_id === routineId)
      : steps;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  let q = supabase.from("skincare_steps").select("*").eq("user_id", user.id);
  if (routineId) q = q.eq("routine_id", routineId);
  const { data, error } = await q.order("sort_order");
  if (error) throw error;
  return (data ?? []) as SkincareStep[];
}

export async function upsertRoutine(
  id: string | null,
  input: RoutineInput,
): Promise<SkincareRoutine> {
  if (isDemoMode()) {
    const t = new Date().toISOString();
    const state = getServerDemoState();
    if (id) {
      const idx = state.routines.findIndex((r) => r.id === id);
      if (idx >= 0) {
        state.routines[idx] = { ...state.routines[idx], ...input, updated_at: t };
        return state.routines[idx];
      }
    }
    const routine: SkincareRoutine = {
      id: crypto.randomUUID(),
      user_id: state.userId,
      sort_order: state.routines.length,
      reminder_start_time: input.reminder_start_time ?? null,
      reminder_end_time: input.reminder_end_time ?? null,
      reminder_interval_minutes: input.reminder_interval_minutes ?? null,
      created_at: t,
      updated_at: t,
      ...input,
    };
    state.routines.push(routine);
    return routine;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const payload = { ...input, user_id: user.id };
  if (id) {
    const { data, error } = await supabase
      .from("skincare_routines")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as SkincareRoutine;
  }
  const { data, error } = await supabase
    .from("skincare_routines")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as SkincareRoutine;
}

export async function upsertStep(
  id: string | null,
  input: StepInput,
): Promise<SkincareStep> {
  if (isDemoMode()) {
    const t = new Date().toISOString();
    const state = getServerDemoState();
    if (id) {
      const idx = state.steps.findIndex((s) => s.id === id);
      if (idx >= 0) {
        state.steps[idx] = {
          ...state.steps[idx],
          ...input,
          reminder_enabled: input.reminder_enabled ?? false,
          updated_at: t,
        };
        return state.steps[idx];
      }
    }
    const step: SkincareStep = {
      id: crypto.randomUUID(),
      user_id: state.userId,
      sort_order: state.steps.filter((s) => s.routine_id === input.routine_id).length,
      reminder_enabled: input.reminder_enabled ?? false,
      reminder_start_time: input.reminder_start_time ?? null,
      reminder_end_time: input.reminder_end_time ?? null,
      reminder_interval_minutes: input.reminder_interval_minutes ?? null,
      scheduled_time: input.scheduled_time ?? null,
      product_name: input.product_name ?? null,
      created_at: t,
      updated_at: t,
      ...input,
    };
    state.steps.push(step);
    return step;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const payload = { ...input, user_id: user.id };
  if (id) {
    const { data, error } = await supabase
      .from("skincare_steps")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as SkincareStep;
  }
  const { data, error } = await supabase
    .from("skincare_steps")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as SkincareStep;
}
