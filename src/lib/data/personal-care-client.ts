"use client";

import { setDemoState } from "@/lib/demo-store";
import { isDemoModeClient } from "@/lib/env";
import type { PersonalCareRoutine } from "@/lib/types";
import type { PersonalRoutineInput } from "@/lib/data/personal-care";

export function clientUpsertPersonalRoutine(
  id: string | null,
  input: PersonalRoutineInput,
): void {
  if (!isDemoModeClient()) {
    void fetch("/api/personal-care/routines", {
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
        personalCareRoutines: prev.personalCareRoutines.map((r) =>
          r.id === id ? { ...r, ...input, category: input.category ?? "general", updated_at: t } : r,
        ),
      };
    }
    const row: PersonalCareRoutine = {
      id: crypto.randomUUID(),
      user_id: prev.userId,
      category: input.category ?? "general",
      sort_order: prev.personalCareRoutines.length,
      reminder_start_time: input.reminder_start_time ?? null,
      reminder_end_time: input.reminder_end_time ?? null,
      reminder_interval_minutes: input.reminder_interval_minutes ?? null,
      created_at: t,
      updated_at: t,
      ...input,
    };
    return {
      ...prev,
      personalCareRoutines: [...prev.personalCareRoutines, row],
    };
  });
}
