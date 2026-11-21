"use client";

import { setDemoState } from "@/lib/demo-store";
import { isDemoModeClient } from "@/lib/env";
import type { JournalEntry, MoodLog } from "@/lib/types";
import type { MoodInput } from "@/lib/data/mind";

export function clientUpsertMood(input: MoodInput): void {
  if (!isDemoModeClient()) {
    void fetch("/api/mind/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return;
  }
  setDemoState((prev) => {
    const t = new Date().toISOString();
    const idx = prev.moodLogs.findIndex((m) => m.log_date === input.log_date);
    if (idx >= 0) {
      const moodLogs = [...prev.moodLogs];
      moodLogs[idx] = { ...moodLogs[idx], ...input };
      return { ...prev, moodLogs };
    }
    const row: MoodLog = {
      id: crypto.randomUUID(),
      user_id: prev.userId,
      stress: input.stress ?? null,
      note: input.note ?? null,
      created_at: t,
      ...input,
    };
    return { ...prev, moodLogs: [row, ...prev.moodLogs] };
  });
}

export function clientAddJournal(body: string): void {
  if (!isDemoModeClient()) {
    void fetch("/api/mind/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    return;
  }
  setDemoState((prev) => {
    const t = new Date().toISOString();
    const row: JournalEntry = {
      id: crypto.randomUUID(),
      user_id: prev.userId,
      body,
      created_at: t,
      updated_at: t,
    };
    return { ...prev, journalEntries: [row, ...prev.journalEntries] };
  });
}