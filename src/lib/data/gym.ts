import { getServerDemoState } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type {
  WorkoutExercise,
  WorkoutSession,
  WorkoutSet,
  WorkoutTemplate,
} from "@/lib/types";

export type TemplateInput = {
  name: string;
  weekday: number | null;
  notes?: string | null;
};

export type ExerciseInput = {
  template_id: string;
  name: string;
  machine?: string | null;
  default_rest_seconds?: number;
};

export type SetInput = {
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps?: number | null;
  weight_kg?: number | null;
  rest_seconds?: number | null;
};

export async function fetchWorkoutTemplates(): Promise<WorkoutTemplate[]> {
  if (isDemoMode()) {
    return getServerDemoState().workoutTemplates.sort(
      (a, b) => a.sort_order - b.sort_order,
    );
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("workout_templates")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as WorkoutTemplate[];
}

export async function fetchWorkoutExercises(
  templateId?: string,
): Promise<WorkoutExercise[]> {
  if (isDemoMode()) {
    const all = getServerDemoState().workoutExercises;
    return templateId
      ? all.filter((e) => e.template_id === templateId)
      : all;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  let q = supabase
    .from("workout_exercises")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order");
  if (templateId) q = q.eq("template_id", templateId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as WorkoutExercise[];
}

export async function fetchWorkoutSessions(limit = 14): Promise<WorkoutSession[]> {
  if (isDemoMode()) {
    return getServerDemoState().workoutSessions
      .sort(
        (a, b) =>
          new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
      )
      .slice(0, limit);
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as WorkoutSession[];
}

export async function fetchWorkoutSets(sessionId: string): Promise<WorkoutSet[]> {
  if (isDemoMode()) {
    return getServerDemoState().workoutSets.filter(
      (s) => s.session_id === sessionId,
    );
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("workout_sets")
    .select("*")
    .eq("user_id", user.id)
    .eq("session_id", sessionId)
    .order("set_number");
  if (error) throw error;
  return (data ?? []) as WorkoutSet[];
}

export async function fetchAllRecentSets(): Promise<WorkoutSet[]> {
  if (isDemoMode()) {
    return getServerDemoState().workoutSets;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("workout_sets")
    .select("*")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as WorkoutSet[];
}

export async function upsertTemplate(
  id: string | null,
  input: TemplateInput,
): Promise<WorkoutTemplate> {
  if (isDemoMode()) {
    const t = new Date().toISOString();
    const state = getServerDemoState();
    if (id) {
      const idx = state.workoutTemplates.findIndex((x) => x.id === id);
      if (idx >= 0) {
        state.workoutTemplates[idx] = {
          ...state.workoutTemplates[idx],
          ...input,
          updated_at: t,
        };
        return state.workoutTemplates[idx];
      }
    }
    const row: WorkoutTemplate = {
      id: crypto.randomUUID(),
      user_id: state.userId,
      notes: input.notes ?? null,
      sort_order: state.workoutTemplates.length,
      created_at: t,
      updated_at: t,
      ...input,
    };
    state.workoutTemplates.push(row);
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
      .from("workout_templates")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as WorkoutTemplate;
  }
  const { data, error } = await supabase
    .from("workout_templates")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as WorkoutTemplate;
}

export async function upsertExercise(
  id: string | null,
  input: ExerciseInput,
): Promise<WorkoutExercise> {
  if (isDemoMode()) {
    const t = new Date().toISOString();
    const state = getServerDemoState();
    if (id) {
      const idx = state.workoutExercises.findIndex((x) => x.id === id);
      if (idx >= 0) {
        state.workoutExercises[idx] = {
          ...state.workoutExercises[idx],
          ...input,
          updated_at: t,
        };
        return state.workoutExercises[idx];
      }
    }
    const row: WorkoutExercise = {
      id: crypto.randomUUID(),
      user_id: state.userId,
      machine: input.machine ?? null,
      default_rest_seconds: input.default_rest_seconds ?? 90,
      sort_order: state.workoutExercises.filter(
        (e) => e.template_id === input.template_id,
      ).length,
      created_at: t,
      updated_at: t,
      ...input,
    };
    state.workoutExercises.push(row);
    return row;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const payload = {
    ...input,
    user_id: user.id,
    default_rest_seconds: input.default_rest_seconds ?? 90,
  };
  if (id) {
    const { data, error } = await supabase
      .from("workout_exercises")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as WorkoutExercise;
  }
  const { data, error } = await supabase
    .from("workout_exercises")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as WorkoutExercise;
}

export async function startSession(
  templateId: string | null,
): Promise<WorkoutSession> {
  if (isDemoMode()) {
    const t = new Date().toISOString();
    const state = getServerDemoState();
    const row: WorkoutSession = {
      id: crypto.randomUUID(),
      user_id: state.userId,
      template_id: templateId,
      started_at: t,
      ended_at: null,
      notes: null,
      created_at: t,
      updated_at: t,
    };
    state.workoutSessions.unshift(row);
    state.activeWorkoutSessionId = row.id;
    return row;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data, error } = await supabase
    .from("workout_sessions")
    .insert({ user_id: user.id, template_id: templateId })
    .select()
    .single();
  if (error) throw error;
  return data as WorkoutSession;
}

export async function logSet(input: SetInput): Promise<WorkoutSet> {
  if (isDemoMode()) {
    const t = new Date().toISOString();
    const state = getServerDemoState();
    const row: WorkoutSet = {
      id: crypto.randomUUID(),
      user_id: state.userId,
      reps: input.reps ?? null,
      weight_kg: input.weight_kg ?? null,
      rest_seconds: input.rest_seconds ?? null,
      completed_at: t,
      created_at: t,
      ...input,
    };
    state.workoutSets.push(row);
    return row;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data, error } = await supabase
    .from("workout_sets")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data as WorkoutSet;
}

export async function endSession(sessionId: string): Promise<void> {
  if (isDemoMode()) {
    const state = getServerDemoState();
    const idx = state.workoutSessions.findIndex((s) => s.id === sessionId);
    if (idx >= 0) {
      state.workoutSessions[idx].ended_at = new Date().toISOString();
      state.activeWorkoutSessionId = null;
    }
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("workout_sessions")
    .update({ ended_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("id", sessionId);
}
