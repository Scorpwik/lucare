"use client";

import { setDemoState } from "@/lib/demo-store";
import { isDemoModeClient } from "@/lib/env";
import type { JournalEntry, MoodLog } from "@/lib/types";
import type { MoodInput } from "@/lib/data/mind";

export async function clientUpsertMood(input: MoodInput): Promise<MoodLog | null> {
  if (!isDemoModeClient()) {
    const res = await fetch("/api/mind/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) return null;
    return (await res.json()) as MoodLog;
  }
  let row: MoodLog | null = null;
  setDemoState((prev) => {
    const t = new Date().toISOString();
    const idx = prev.moodLogs.findIndex((m) => m.log_date === input.log_date);
    if (idx >= 0) {
      const moodLogs = [...prev.moodLogs];
      moodLogs[idx] = { ...moodLogs[idx], ...input };
      row = moodLogs[idx];
      return { ...prev, moodLogs };
    }
    const created: MoodLog = {
      id: crypto.randomUUID(),
      user_id: prev.userId,
      stress: input.stress ?? null,
      note: input.note ?? null,
      created_at: t,
      ...input,
    };
    row = created;
    return { ...prev, moodLogs: [created, ...prev.moodLogs] };
  });
  return row;
}

export async function clientAddJournal(body: string): Promise<JournalEntry | null> {
  if (!isDemoModeClient()) {
    const res = await fetch("/api/mind/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) return null;
    return (await res.json()) as JournalEntry;
  }
  let row: JournalEntry | null = null;
  setDemoState((prev) => {
    const t = new Date().toISOString();
    const created: JournalEntry = {
      id: crypto.randomUUID(),
      user_id: prev.userId,
      body,
      created_at: t,
      updated_at: t,
    };
    row = created;
    return { ...prev, journalEntries: [created, ...prev.journalEntries] };
  });
  return row;
}

export async function clientDeleteJournal(id: string): Promise<boolean> {
  if (!isDemoModeClient()) {
    const res = await fetch(`/api/mind/journal?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return res.ok;
  }
  setDemoState((prev) => ({
    ...prev,
    journalEntries: prev.journalEntries.filter((j) => j.id !== id),
  }));
  return true;
}

export type MoodReminderInput = {
  title?: string;
  body?: string;
  reminder_time: string;
};

export async function clientScheduleMoodCheckIn(
  input: MoodReminderInput,
): Promise<boolean> {
  const [h, m] = input.reminder_time.split(":").map(Number);
  const start = `${String(h).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}`;
  const res = await fetch("/api/push/schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source_type: "mood_checkin",
      source_id: "daily_mood",
      title: input.title ?? "Check-in de ánimo",
      body: input.body ?? "¿Cómo te sientes hoy? Abre Mente en LuCare",
      start_time: start,
      end_time: start,
      interval_minutes: 1440,
    }),
  });
  return res.ok;
}