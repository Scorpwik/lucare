"use client";

import { setDemoState } from "@/lib/demo-store";
import type { SkincareRoutine } from "@/lib/types";
import type { RoutineInput } from "@/lib/data/form-types";

export function clientUpsertRoutine(id: string | null, input: RoutineInput): void {
  setDemoState((prev) => {
    const t = new Date().toISOString();
    if (id) {
      return {
        ...prev,
        routines: prev.routines.map((r) =>
          r.id === id ? { ...r, ...input, updated_at: t } : r,
        ),
      };
    }
    const routine: SkincareRoutine = {
      id: crypto.randomUUID(),
      user_id: prev.userId,
      sort_order: prev.routines.length,
      reminder_start_time: input.reminder_start_time ?? null,
      reminder_end_time: input.reminder_end_time ?? null,
      reminder_interval_minutes: input.reminder_interval_minutes ?? null,
      created_at: t,
      updated_at: t,
      ...input,
    };
    return { ...prev, routines: [...prev.routines, routine] };
  });
}