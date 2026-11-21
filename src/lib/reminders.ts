import { TIMEZONE } from "@/lib/env";
import type { ReminderWindow } from "@/lib/types";

/** Fecha local YYYY-MM-DD en America/Guayaquil. */
export function dateInGuayaquil(ref = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ref);
}

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m ?? 0);
}

function minutesToTime(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Devuelve minutos locales en America/Guayaquil para una fecha dada */
export function localMinutesInZone(date: Date, timeZone = TIMEZONE): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

/**
 * Calcula la próxima hora de disparo dentro de la ventana inicio–fin
 * repitiendo cada `intervalMinutes`.
 */
export function computeNextFireTime({
  startTime,
  endTime,
  intervalMinutes,
  referenceDate = new Date(),
  timezone = TIMEZONE,
}: ReminderWindow): Date | null {
  if (intervalMinutes <= 0) return null;

  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);
  const nowMin = localMinutesInZone(referenceDate, timezone);

  let cursor = startMin;
  while (cursor <= endMin) {
    if (cursor >= nowMin) {
      const delta = cursor - nowMin;
      return new Date(referenceDate.getTime() + delta * 60_000);
    }
    cursor += intervalMinutes;
  }

  const tomorrow = new Date(referenceDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [sh, sm] = startTime.split(":").map(Number);
  const next = new Date(tomorrow);
  next.setHours(sh, sm ?? 0, 0, 0);
  return next;
}

export function listFireTimesInWindow({
  startTime,
  endTime,
  intervalMinutes,
}: Omit<ReminderWindow, "referenceDate" | "timezone">): string[] {
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);
  const times: string[] = [];
  for (let c = startMin; c <= endMin; c += intervalMinutes) {
    times.push(minutesToTime(c));
  }
  return times;
}