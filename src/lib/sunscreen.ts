export const DEFAULT_SUNSCREEN_INTERVAL_MIN = 120;
export const MIN_SUNSCREEN_INTERVAL_MIN = 60;
export const MAX_SUNSCREEN_INTERVAL_MIN = 240;
export const SUNSCREEN_INTERVAL_STEP_MIN = 30;

export function clampSunscreenInterval(minutes: number): number {
  const stepped = Math.round(minutes / SUNSCREEN_INTERVAL_STEP_MIN) * SUNSCREEN_INTERVAL_STEP_MIN;
  return Math.min(MAX_SUNSCREEN_INTERVAL_MIN, Math.max(MIN_SUNSCREEN_INTERVAL_MIN, stepped));
}

export function computeSunscreenNextDue(
  lastAppliedAt: string | null,
  intervalMinutes: number,
): Date | null {
  if (!lastAppliedAt) return null;
  const base = new Date(lastAppliedAt).getTime();
  if (Number.isNaN(base)) return null;
  return new Date(base + intervalMinutes * 60_000);
}

export function sunscreenDueNow(nextDueAt: string | null, now = new Date()): boolean {
  if (!nextDueAt) return false;
  const t = new Date(nextDueAt).getTime();
  return !Number.isNaN(t) && t <= now.getTime();
}

export function formatCountdownMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function sunscreenProgress(
  lastAppliedAt: string | null,
  nextDueAt: string | null,
  now: Date,
): number {
  if (!lastAppliedAt || !nextDueAt) return 0;
  const start = new Date(lastAppliedAt).getTime();
  const end = new Date(nextDueAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  const elapsed = now.getTime() - start;
  const total = end - start;
  return Math.min(1, Math.max(0, elapsed / total));
}