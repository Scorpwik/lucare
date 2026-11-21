import { getServerDemoState } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { JournalEntry, MoodLog } from "@/lib/types";

export type MoodInput = {
  log_date: string;
  mood: number;
  stress?: number | null;
  note?: string | null;
};

export async function fetchMoodLogs(): Promise<MoodLog[]> {
  if (isDemoMode()) {
    return getServerDemoState().moodLogs.sort((a, b) =>
      b.log_date.localeCompare(a.log_date),
    );
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("mood_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MoodLog[];
}

export async function upsertMoodLog(input: MoodInput): Promise<MoodLog> {
  if (isDemoMode()) {
    const t = new Date().toISOString();
    const state = getServerDemoState();
    const idx = state.moodLogs.findIndex((m) => m.log_date === input.log_date);
    if (idx >= 0) {
      state.moodLogs[idx] = { ...state.moodLogs[idx], ...input };
      return state.moodLogs[idx];
    }
    const row: MoodLog = {
      id: crypto.randomUUID(),
      user_id: state.userId,
      stress: input.stress ?? null,
      note: input.note ?? null,
      created_at: t,
      ...input,
    };
    state.moodLogs.unshift(row);
    return row;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data, error } = await supabase
    .from("mood_logs")
    .upsert({ ...input, user_id: user.id }, { onConflict: "user_id,log_date" })
    .select()
    .single();
  if (error) throw error;
  return data as MoodLog;
}

export async function fetchJournalEntries(limit = 20): Promise<JournalEntry[]> {
  if (isDemoMode()) {
    return getServerDemoState().journalEntries
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as JournalEntry[];
}

export async function deleteJournalEntry(id: string): Promise<void> {
  if (isDemoMode()) {
    const state = getServerDemoState();
    state.journalEntries = state.journalEntries.filter((j) => j.id !== id);
    return;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
}

export async function addJournalEntry(body: string): Promise<JournalEntry> {
  if (isDemoMode()) {
    const t = new Date().toISOString();
    const state = getServerDemoState();
    const row: JournalEntry = {
      id: crypto.randomUUID(),
      user_id: state.userId,
      body,
      created_at: t,
      updated_at: t,
    };
    state.journalEntries.unshift(row);
    return row;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data, error } = await supabase
    .from("journal_entries")
    .insert({ user_id: user.id, body })
    .select()
    .single();
  if (error) throw error;
  return data as JournalEntry;
}