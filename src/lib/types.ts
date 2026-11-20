  | "pastillas"
  | "citas"
  | "agenda"
  | "tareas"
  | "gimnasio"
  | "cuerpo_resumen"
  | "sueno"
  | "habitos_racha"
  | "animo"
  | "cuidado_personal";

export interface Profile {
  id: string;
  referenceDate?: Date;
  timezone?: string;
}

export interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  weekday: number | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  user_id: string;
  template_id: string;
  name: string;
  machine: string | null;
  default_rest_seconds: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  template_id: string | null;
  started_at: string;
  ended_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSet {
  id: string;
  user_id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  rest_seconds: number | null;
  completed_at: string;
  created_at: string;
}

export interface BodyMetric {
  id: string;
  user_id: string;
  recorded_at: string;
  weight_kg: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  hips_cm: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProgressPhoto {
  id: string;
  user_id: string;
  storage_path: string;
  caption: string | null;
  taken_at: string;
  created_at: string;
  /** Solo demo / vista previa local */
  preview_url?: string | null;
}

export interface SleepLog {
  id: string;
  user_id: string;
  sleep_date: string;
  bedtime: string | null;
  wake_time: string | null;
  hours_slept: number | null;
  quality_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  user_id: string;
  habit_id: string;
  log_date: string;
  completed: boolean;
  created_at: string;
}

export interface MoodLog {
  id: string;
  user_id: string;
  log_date: string;
  mood: number;
  stress: number | null;
  note: string | null;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalCareRoutine {
  id: string;
  user_id: string;
  name: string;
  category: string;
  sort_order: number;
  reminder_enabled: boolean;
  reminder_start_time: string | null;
  reminder_end_time: string | null;
  reminder_interval_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface PersonalCareStep {
  id: string;
  user_id: string;
  routine_id: string;
  title: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
