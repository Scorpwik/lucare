import { getServerDemoState } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { MedicalAppointment, Medication } from "@/lib/types";
import type { AppointmentInput, MedicationInput } from "@/lib/data/form-types";

export async function fetchMedications(): Promise<Medication[]> {
  if (isDemoMode()) {
    return getServerDemoState().medications.filter((m) => m.is_active);
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return (data ?? []) as Medication[];
}

export async function fetchAppointments(): Promise<MedicalAppointment[]> {
  if (isDemoMode()) {
    return getServerDemoState().appointments.sort(
      (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
    );
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("medical_appointments")
    .select("*")
    .eq("user_id", user.id)
    .order("starts_at");
  if (error) throw error;
  return (data ?? []) as MedicalAppointment[];
}

export async function upsertMedication(
  id: string | null,
  input: MedicationInput,
): Promise<Medication> {
  if (isDemoMode()) {
    const t = new Date().toISOString();
    const state = getServerDemoState();
    if (id) {
      const idx = state.medications.findIndex((m) => m.id === id);
      if (idx >= 0) {
        state.medications[idx] = {
          ...state.medications[idx],
          ...input,
          updated_at: t,
        };
        return state.medications[idx];
      }
    }
    const med: Medication = {
      id: crypto.randomUUID(),
      user_id: state.userId,
      is_active: true,
      reminder_times: input.reminder_times ?? null,
      dosage: input.dosage ?? null,
      notes: input.notes ?? null,
      reminder_start_time: input.reminder_start_time ?? null,
      reminder_end_time: input.reminder_end_time ?? null,
      reminder_interval_minutes: input.reminder_interval_minutes ?? null,
      created_at: t,
      updated_at: t,
      ...input,
    };
    state.medications.push(med);
    return med;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const payload = { ...input, user_id: user.id, is_active: true };
  if (id) {
    const { data, error } = await supabase
      .from("medications")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Medication;
  }
  const { data, error } = await supabase
    .from("medications")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Medication;
}

export async function upsertAppointment(
  id: string | null,
  input: AppointmentInput,
): Promise<MedicalAppointment> {
  if (isDemoMode()) {
    const t = new Date().toISOString();
    const state = getServerDemoState();
    if (id) {
      const idx = state.appointments.findIndex((a) => a.id === id);
      if (idx >= 0) {
        state.appointments[idx] = {
          ...state.appointments[idx],
          ...input,
          reminder_enabled: input.reminder_enabled ?? true,
          updated_at: t,
        };
        return state.appointments[idx];
      }
    }
    const appt: MedicalAppointment = {
      id: crypto.randomUUID(),
      user_id: state.userId,
      provider: input.provider ?? null,
      location: input.location ?? null,
      ends_at: input.ends_at ?? null,
      notes: input.notes ?? null,
      reminder_enabled: input.reminder_enabled ?? true,
      reminder_minutes_before: input.reminder_minutes_before ?? 60,
      created_at: t,
      updated_at: t,
      ...input,
    };
    state.appointments.push(appt);
    return appt;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const payload = { ...input, user_id: user.id };
  if (id) {
    const { data, error } = await supabase
      .from("medical_appointments")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as MedicalAppointment;
  }
  const { data, error } = await supabase
    .from("medical_appointments")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as MedicalAppointment;
}

export async function deleteAppointment(id: string): Promise<void> {
  if (isDemoMode()) {
    const state = getServerDemoState();
    state.appointments = state.appointments.filter((a) => a.id !== id);
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase
    .from("medical_appointments")
    .delete()
    .eq("user_id", user.id)
    .eq("id", id);

  if (error) throw error;
}
