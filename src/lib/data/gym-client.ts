"use client";

import { getDemoState, setDemoState } from "@/lib/demo-store";
import { isDemoModeClient } from "@/lib/env";
import type {
  WorkoutExercise,
  WorkoutSession,
  WorkoutSet,
  WorkoutTemplate,
} from "@/lib/types";
import type { ExerciseInput, SetInput, TemplateInput } from "@/lib/data/gym";

async function postGym<T>(path: string, body: unknown): Promise<T | null> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

export function clientUpsertTemplate(
  id: string | null,
  input: TemplateInput,
): WorkoutTemplate | null {
  if (!isDemoModeClient()) {
    void postGym("/api/gym/templates", { id, ...input });
    return null;
  }
  let row: WorkoutTemplate | null = null;
  setDemoState((prev) => {
    const t = new Date().toISOString();
    if (id) {
      const templates = prev.workoutTemplates.map((x) => {
        if (x.id !== id) return x;
        const next = { ...x, ...input, updated_at: t };
        row = next;
        return next;
      });
      return { ...prev, workoutTemplates: templates };
    }
    const created: WorkoutTemplate = {
      id: crypto.randomUUID(),
      user_id: prev.userId,
      notes: input.notes ?? null,
      sort_order: prev.workoutTemplates.length,
      created_at: t,
      updated_at: t,
      ...input,
    };
    row = created;
    return { ...prev, workoutTemplates: [...prev.workoutTemplates, created] };
  });
  return row;
}

export function clientUpsertExercise(
  id: string | null,
  input: ExerciseInput,
): WorkoutExercise | null {
  if (!isDemoModeClient()) {
    void postGym("/api/gym/exercises", { id, ...input });
    return null;
  }
  let row: WorkoutExercise | null = null;
  setDemoState((prev) => {
    const t = new Date().toISOString();
    if (id) {
      const exercises = prev.workoutExercises.map((x) => {
        if (x.id !== id) return x;
        const next = { ...x, ...input, updated_at: t };
        row = next;
        return next;
      });
      return { ...prev, workoutExercises: exercises };
    }
    const created: WorkoutExercise = {
      id: crypto.randomUUID(),
      user_id: prev.userId,
      machine: input.machine ?? null,
      default_rest_seconds: input.default_rest_seconds ?? 90,
      sort_order: prev.workoutExercises.filter(
        (e) => e.template_id === input.template_id,
      ).length,
      created_at: t,
      updated_at: t,
      ...input,
    };
    row = created;
    return { ...prev, workoutExercises: [...prev.workoutExercises, created] };
  });
  return row;
}

export function clientStartSession(templateId: string | null): WorkoutSession | null {
  if (!isDemoModeClient()) {
    void postGym("/api/gym/sessions", { templateId });
    return null;
  }
  let session: WorkoutSession | null = null;
  setDemoState((prev) => {
    const t = new Date().toISOString();
    const row: WorkoutSession = {
      id: crypto.randomUUID(),
      user_id: prev.userId,
      template_id: templateId,
      started_at: t,
      ended_at: null,
      notes: null,
      created_at: t,
      updated_at: t,
    };
    session = row;
    return {
      ...prev,
      workoutSessions: [row, ...prev.workoutSessions],
      activeWorkoutSessionId: row.id,
    };
  });
  return session;
}

export function clientLogSet(input: SetInput): WorkoutSet | null {
  if (!isDemoModeClient()) {
    void postGym("/api/gym/sets", input);
    return null;
  }
  let row: WorkoutSet | null = null;
  setDemoState((prev) => {
    const t = new Date().toISOString();
    const created: WorkoutSet = {
      id: crypto.randomUUID(),
      user_id: prev.userId,
      reps: input.reps ?? null,
      weight_kg: input.weight_kg ?? null,
      rest_seconds: input.rest_seconds ?? null,
      completed_at: t,
      created_at: t,
      ...input,
    };
    row = created;
    return { ...prev, workoutSets: [...prev.workoutSets, created] };
  });
  return row;
}

export function clientEndSession(sessionId: string): void {
  if (!isDemoModeClient()) {
    void postGym("/api/gym/sessions/end", { sessionId });
    return;
  }
  setDemoState((prev) => ({
    ...prev,
    activeWorkoutSessionId: null,
    workoutSessions: prev.workoutSessions.map((s) =>
      s.id === sessionId ? { ...s, ended_at: new Date().toISOString() } : s,
    ),
  }));
}

export function clientGetActiveSession(): WorkoutSession | null {
  const state = getDemoState();
  const id = state.activeWorkoutSessionId;
  if (!id) return null;
  return state.workoutSessions.find((s) => s.id === id && !s.ended_at) ?? null;
}
