import { fetchAgendaEntries } from "@/lib/data/agenda";
import { fetchBodyMetrics } from "@/lib/data/body";
import { fetchDailyActivities } from "@/lib/data/health-samples";
import { fetchHabits, fetchHabitLogs, fetchSleepLogs } from "@/lib/data/sleep-habits";
import { fetchMoodLogs } from "@/lib/data/mind";
import { fetchWorkoutSessions } from "@/lib/data/gym";
import { dateInGuayaquil } from "@/lib/reminders";

export type WellnessSnapshot = {
  generatedAt: string;
  today: string;
  sleep: { date: string; hours: number | null; quality: number | null }[];
  habits: { title: string; streakApprox: number; completedToday: boolean }[];
  mood: { date: string; mood: number; stress: number | null }[];
  body: { date: string; weightKg: number | null }[];
  gym: { startedAt: string; endedAt: string | null }[];
  agendaToday: { title: string; startsAt: string }[];
  steps: { date: string; steps: number }[];
};

function approximateStreak(
  habitId: string,
  logs: { habit_id: string; log_date: string; completed: boolean }[],
  today: string,
): number {
  const dates = new Set(
    logs.filter((l) => l.habit_id === habitId && l.completed).map((l) => l.log_date),
  );
  let streak = 0;
  const cursor = new Date(`${today}T12:00:00`);
  for (let i = 0; i < 60; i++) {
    const d = cursor.toISOString().slice(0, 10);
    if (dates.has(d)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (i === 0) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    } else {
      break;
    }
  }
  return streak;
}

export async function buildWellnessSnapshot(): Promise<WellnessSnapshot> {
  const today = dateInGuayaquil();
  const [sleep, habits, habitLogs, moods, metrics, sessions, agenda, steps] =
    await Promise.all([
      fetchSleepLogs(7),
      fetchHabits(),
      fetchHabitLogs(),
      fetchMoodLogs(),
      fetchBodyMetrics(),
      fetchWorkoutSessions(5),
      fetchAgendaEntries({
        from: new Date(`${today}T00:00:00-05:00`),
        to: new Date(`${today}T23:59:59-05:00`),
      }),
      fetchDailyActivities(7),
    ]);

  return {
    generatedAt: new Date().toISOString(),
    today,
    sleep: sleep.map((s) => ({
      date: s.sleep_date,
      hours: s.hours_slept,
      quality: s.quality_score,
    })),
    habits: habits
      .filter((h) => h.is_active)
      .slice(0, 8)
      .map((h) => ({
        title: h.title,
        streakApprox: approximateStreak(h.id, habitLogs, today),
        completedToday: habitLogs.some(
          (l) => l.habit_id === h.id && l.log_date === today && l.completed,
        ),
      })),
    mood: moods.slice(0, 5).map((m) => ({
      date: m.log_date,
      mood: m.mood,
      stress: m.stress,
    })),
    body: metrics.slice(0, 10).map((b) => ({
      date: b.recorded_at,
      weightKg: b.weight_kg,
    })),
    gym: sessions.map((s) => ({
      startedAt: s.started_at,
      endedAt: s.ended_at,
    })),
    agendaToday: agenda.map((a) => ({
      title: a.title,
      startsAt: a.starts_at,
    })),
    steps: steps
      .filter((s) => s.steps != null)
      .map((s) => ({ date: s.activity_date, steps: s.steps as number })),
  };
}

export function snapshotToPromptText(snapshot: WellnessSnapshot): string {
  return JSON.stringify(snapshot, null, 0);
}