import type { HabitLog } from "@/lib/types";

export function computeStreak(
  habitId: string,
  logs: HabitLog[],
  anchorDate?: string,
): number {
  const dates = new Set(
    logs.filter((l) => l.habit_id === habitId && l.completed).map((l) => l.log_date),
  );
  const habitDates = [...dates].sort();
  const anchor = anchorDate ?? habitDates.at(-1);
  if (!anchor) return 0;
  let streak = 0;
  const [y, m, d] = anchor.split("-").map(Number);
  const cursor = new Date(y, (m ?? 1) - 1, d ?? 1);
  for (;;) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (!dates.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Racha hasta la fecha dada (gracia de un día si hoy aún no está marcado). */
export function computeStreakToDate(
  habitId: string,
  logs: HabitLog[],
  asOfDate: string,
): number {
  const dates = new Set(
    logs.filter((l) => l.habit_id === habitId && l.completed).map((l) => l.log_date),
  );
  if (dates.size === 0) return 0;
  let anchor = asOfDate;
  if (!dates.has(anchor)) {
    const [y, m, d] = anchor.split("-").map(Number);
    const prev = new Date(y, (m ?? 1) - 1, d ?? 1);
    prev.setDate(prev.getDate() - 1);
    anchor = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-${String(prev.getDate()).padStart(2, "0")}`;
    if (!dates.has(anchor)) return 0;
  }
  return computeStreak(habitId, logs, anchor);
}