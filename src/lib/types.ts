export type SkincarePeriod = "am" | "pm" | "custom";

export type WidgetKey =
  | "saludo"
  | "bloqueador"
  | "rutina_am"
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

export type IntegrationProvider = "google_calendar" | "notion_deberes";

export type CalendarLinkStatus = "disconnected" | "connected" | "error" | "syncing";

export interface Profile {
  id: string;
  display_name?: string | null;
  timezone?: string;
  referenceDate?: Date;
}

export interface DashboardWidget {
  id: string;
  user_id: string;
  widget_key: WidgetKey;
  visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SkincareRoutine {
  id: string;
  user_id: string;
  name: string;
  period: SkincarePeriod;
  sort_order: number;
  reminder_enabled: boolean;
  reminder_start_time: string | null;
  reminder_end_time: string | null;
  reminder_interval_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface SkincareStep {
  id: string;
  user_id: string;
  routine_id: string;
  title: string;
  product_name: string | null;
  scheduled_time: string | null;
  sort_order: number;
  reminder_enabled: boolean;
  reminder_start_time: string | null;
  reminder_end_time: string | null;
  reminder_interval_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string | null;
  notes: string | null;
  reminder_enabled: boolean;
  reminder_start_time: string | null;
  reminder_end_time: string | null;
  reminder_interval_minutes: number | null;
  reminder_times: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicalAppointment {
  id: string;
  user_id: string;
  title: string;
  provider: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  notes: string | null;
  reminder_enabled: boolean;
  reminder_minutes_before: number | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  due_at: string | null;
  completed: boolean;
  module_source: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExternalCalendarEvent {
  id: string;
  user_id: string;
  provider: string;
  external_id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  source_label: string;
  synced_at?: string;
}

export interface ExternalNotionTask {
  id: string;
  user_id: string;
  external_id: string;
  title: string;
  due_at: string | null;
  status: string | null;
  synced_at?: string;
}

/** Entrada unificada para widgets y /agenda */
export interface AgendaEntry {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  source_label: string;
  kind: "event" | "notion_task";
}

export interface CalendarLink {
  id: string;
  user_id: string;
  provider: IntegrationProvider;
  status: CalendarLinkStatus;
  external_account_id: string | null;
  metadata: Record<string, unknown>;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReminderWindow {
  startTime: string;
  endTime: string;
  intervalMinutes: number;
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