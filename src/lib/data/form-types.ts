import type { SkincarePeriod } from "@/lib/types";

export type RoutineInput = {
  name: string;
  period: SkincarePeriod;
  reminder_enabled: boolean;
  reminder_start_time?: string | null;
  reminder_end_time?: string | null;
  reminder_interval_minutes?: number | null;
};

export type StepInput = {
  routine_id: string;
  title: string;
  product_name?: string | null;
  scheduled_time?: string | null;
  reminder_enabled?: boolean;
  reminder_start_time?: string | null;
  reminder_end_time?: string | null;
  reminder_interval_minutes?: number | null;
};

export type MedicationInput = {
  name: string;
  dosage?: string | null;
  notes?: string | null;
  reminder_enabled: boolean;
  reminder_start_time?: string | null;
  reminder_end_time?: string | null;
  reminder_interval_minutes?: number | null;
  reminder_times?: string[] | null;
};

export type AppointmentInput = {
  title: string;
  provider?: string | null;
  location?: string | null;
  starts_at: string;
  ends_at?: string | null;
  notes?: string | null;
  reminder_enabled?: boolean;
  reminder_minutes_before?: number | null;
};