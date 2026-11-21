"use client";

import { setDemoState, getDemoState } from "@/lib/demo-store";
import { isDemoModeClient } from "@/lib/env";
import type { MedicalAppointment, Medication } from "@/lib/types";
import type { AppointmentInput, MedicationInput } from "@/lib/data/form-types";

export function clientUpsertMedication(
  id: string | null,
  input: MedicationInput,
): void {
  if (!isDemoModeClient()) {
    void fetch("/api/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...input }),
    });
    return;
  }
  setDemoState((prev) => {
    const t = new Date().toISOString();
    if (id) {
      return {
        ...prev,
        medications: prev.medications.map((m) =>
          m.id === id ? { ...m, ...input, updated_at: t } : m,
        ),
      };
    }
    const med: Medication = {
      id: crypto.randomUUID(),
      user_id: prev.userId,
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
    return { ...prev, medications: [...prev.medications, med] };
  });
}

export async function clientUpsertAppointment(
  id: string | null,
  input: AppointmentInput,
): Promise<MedicalAppointment | null> {
  if (!isDemoModeClient()) {
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...input }),
    });
    if (!res.ok) return null;
    return (await res.json()) as MedicalAppointment;
  }
  let created: MedicalAppointment | null = null;
  setDemoState((prev) => {
    const t = new Date().toISOString();
    if (id) {
      const appts = prev.appointments.map((a) => {
        if (a.id !== id) return a;
        const next = {
          ...a,
          ...input,
          reminder_enabled: input.reminder_enabled ?? true,
          updated_at: t,
        };
        created = next;
        return next;
      });
      return { ...prev, appointments: appts };
    }
    const appt: MedicalAppointment = {
      id: crypto.randomUUID(),
      user_id: prev.userId,
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
    created = appt;
    return { ...prev, appointments: [...prev.appointments, appt] };
  });
  return created ?? getDemoState().appointments.at(-1) ?? null;
}