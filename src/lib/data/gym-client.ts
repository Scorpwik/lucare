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

export async function clientUpsertTemplate(
  id: string | null,
  input: TemplateInput,
): Promise<WorkoutTemplate | null> {
  if (!isDemoModeClient()) {
    return postGym<WorkoutTemplate>("/api/gym/templates", { id, ...input });
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

export async function clientDeleteTemplate(id: string): Promise<boolean> {
  if (!isDemoModeClient()) {
    const res = await fetch(`/api/gym/templates?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return res.ok;
  }
  setDemoState((prev) => ({
    ...prev,
    workoutTemplates: prev.workoutTemplates.filter((t) => t.id !== id),
    workoutExercises: prev.workoutExercises.filter((e) => e.template_id !== id),
  }));
  return true;
}

export async function clientUpsertExercise(
  id: string | null,
  input: ExerciseInput,
): Promise<WorkoutExercise | null> {
  if (!isDemoModeClient()) {
    return postGym<WorkoutExercise>("/api/gym/exercises", { id, ...input });
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

export async function clientDeleteExercise(id: string): Promise<boolean> {
  if (!isDemoModeClient()) {
    const res = await fetch(`/api/gym/exercises?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) return false;
    return true;
  }
  try {
    const inUse = getDemoState().workoutSets.some((s) => s.exercise_id === id);
    if (inUse) return false;
    setDemoState((prev) => ({
      ...prev,
      workoutExercises: prev.workoutExercises.filter((e) => e.id !== id),
    }));
    return true;
  } catch {
    return false;
  }
}

export async function clientStartSession(
  templateId: string | null,
): Promise<WorkoutSession | null> {
  if (!isDemoModeClient()) {
    return postGym<WorkoutSession>("/api/gym/sessions", { templateId });
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

export async function clientLogSet(input: SetInput): Promise<WorkoutSet | null> {
  if (!isDemoModeClient()) {
    return postGym<WorkoutSet>("/api/gym/sets", input);
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

export async function clientEndSession(sessionId: string): Promise<boolean> {
  if (!isDemoModeClient()) {
    const res = await fetch("/api/gym/sessions/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    return res.ok;
  }
  setDemoState((prev) => ({
    ...prev,
    activeWorkoutSessionId: null,
    workoutSessions: prev.workoutSessions.map((s) =>
      s.id === sessionId ? { ...s, ended_at: new Date().toISOString() } : s,
    ),
  }));
  return true;
}

export function clientGetActiveSession(): WorkoutSession | null {
  const state = getDemoState();
  const id = state.activeWorkoutSessionId;
  if (!id) return null;
  return state.workoutSessions.find((s) => s.id === id && !s.ended_at) ?? null;
}

export function syncGymStateFromDemo(): {
  templates: WorkoutTemplate[];
  exercises: WorkoutExercise[];
  sessions: WorkoutSession[];
  sets: WorkoutSet[];
  active: WorkoutSession | null;
} {
  const s = getDemoState();
  return {
    templates: s.workoutTemplates,
    exercises: s.workoutExercises,
    sessions: s.workoutSessions,
    sets: s.workoutSets,
    active: clientGetActiveSession(),
  };
}

export type GymReminderInput = {
  templateId: string;
  title: string;
  body?: string;
  reminder_time: string;
};

/** Programa recordatorio vía stack push existente (degrada si no hay VAPID). */
export async function clientScheduleGymReminder(
  input: GymReminderInput,
): Promise<boolean> {
  const [h, m] = input.reminder_time.split(":").map(Number);
  const start = `${String(h).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}`;
  const res = await fetch("/api/push/schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source_type: "workout_template",
      source_id: input.templateId,
      title: input.title,
      body: input.body ?? "Hora de entrenar",
      start_time: start,
      end_time: start,
      interval_minutes: 1440,
    }),
  });
  return res.ok;
}