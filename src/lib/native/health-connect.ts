/**
 * Health Connect bridge (Android native only). Dynamic imports keep Capacitor off the server bundle.
 */

const LAST_SYNC_KEY = "lucare_health_connect_last_sync";
const AUTO_SYNC_KEY = "lucare_health_connect_last_auto";
export const HEALTH_CONNECT_AUTO_THROTTLE_MS = 30 * 60 * 1000;

const READ_TYPES = ["steps", "sleep", "heartRate", "weight", "restingHeartRate"] as const;

export type HealthConnectSyncPayload = {
  steps: { activity_date: string; steps: number }[];
  sleep: {
    sleep_date: string;
    hours_slept: number | null;
    bedtime: string | null;
    wake_time: string | null;
  }[];
  heart_rate: { recorded_at: string; bpm: number }[];
  weight: { recorded_at: string; weight_kg: number }[];
};

export type HealthConnectSyncResult = {
  applied: { steps: number; sleep: number; heart_rate: number; weight: number };
  errors?: string[];
};

function isoDate(iso: string): string {
  return iso.slice(0, 10);
}

function timeFromIso(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(11, 19);
}

function hoursBetween(start: string, end: string): number | null {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return null;
  return Math.round(((b - a) / 3_600_000) * 100) / 100;
}

export function getLastHealthConnectSync(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_SYNC_KEY);
}

export function setLastHealthConnectSync(iso: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_SYNC_KEY, iso);
}

export function shouldRunAutoHealthSync(now = Date.now()): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(AUTO_SYNC_KEY);
  if (!raw) return true;
  const last = Number(raw);
  if (Number.isNaN(last)) return true;
  return now - last >= HEALTH_CONNECT_AUTO_THROTTLE_MS;
}

export function markAutoHealthSyncRan(now = Date.now()): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTO_SYNC_KEY, String(now));
}

export async function isHealthConnectNative(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const { Capacitor } = await import("@capacitor/core");
  return Capacitor.isNativePlatform();
}

export async function checkHealthConnectAvailable(): Promise<{
  ok: boolean;
  reason?: string;
}> {
  if (!(await isHealthConnectNative())) {
    return { ok: false, reason: "web" };
  }
  const { Health } = await import("@capgo/capacitor-health");
  const avail = await Health.isAvailable();
  if (!avail.available) {
    return { ok: false, reason: avail.reason ?? "Health Connect no disponible" };
  }
  return { ok: true };
}

const CORE_READ: (typeof READ_TYPES)[number][] = ["steps", "sleep", "heartRate", "weight"];

function hasCoreReadAccess(readAuthorized: string[] | undefined, readDenied: string[] | undefined): boolean {
  const authorized = readAuthorized ?? [];
  const denied = readDenied ?? [];
  return CORE_READ.every((t) => authorized.includes(t) && !denied.includes(t));
}

export async function ensureHealthConnectPermissions(): Promise<boolean> {
  const { Health } = await import("@capgo/capacitor-health");
  const check = await Health.checkAuthorization({
    read: [...READ_TYPES],
    requestHistoryAccess: true,
  });
  if (hasCoreReadAccess(check.readAuthorized, check.readDenied)) {
    return true;
  }
  const status = await Health.requestAuthorization({
    read: [...READ_TYPES],
    requestHistoryAccess: true,
  });
  return hasCoreReadAccess(status.readAuthorized, status.readDenied);
}

function syncWindowStart(): { start: Date; end: Date } {
  const end = new Date();
  const last = getLastHealthConnectSync();
  let days = 30;
  if (last) {
    const lastMs = new Date(last).getTime();
    if (!Number.isNaN(lastMs)) {
      const diffDays = Math.ceil((end.getTime() - lastMs) / 86_400_000);
      days = Math.max(7, diffDays + 1);
    }
  }
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days);
  return { start, end };
}

export async function readHealthConnectPayload(): Promise<HealthConnectSyncPayload> {
  const { Health } = await import("@capgo/capacitor-health");
  const { start, end } = syncWindowStart();
  const startIso = start.toISOString();
  const endIso = end.toISOString();

  const stepsAgg = await Health.queryAggregated({
    dataType: "steps",
    startDate: startIso,
    endDate: endIso,
    bucket: "day",
    aggregation: "sum",
  });

  const steps = stepsAgg.samples
    .map((s) => ({
      activity_date: isoDate(s.startDate),
      steps: Math.round(s.value),
    }))
    .filter((s) => s.steps > 0);

  const sleepSamples = await Health.readSamples({
    dataType: "sleep",
    startDate: startIso,
    endDate: endIso,
    limit: 500,
    ascending: true,
  });

  const sleepByDate = new Map<
    string,
    {
      sleep_date: string;
      hours_slept: number | null;
      bedtime: string | null;
      wake_time: string | null;
    }
  >();

  for (const sample of sleepSamples.samples) {
    const night = isoDate(sample.endDate);
    const hours =
      hoursBetween(sample.startDate, sample.endDate) ??
      (sample.unit === "minute" ? sample.value / 60 : sample.value);
    const existing = sleepByDate.get(night);
    const row = {
      sleep_date: night,
      hours_slept: hours != null ? Math.round(hours * 100) / 100 : null,
      bedtime: timeFromIso(sample.startDate),
      wake_time: timeFromIso(sample.endDate),
    };
    if (!existing || (row.hours_slept ?? 0) > (existing.hours_slept ?? 0)) {
      sleepByDate.set(night, row);
    }
  }

  const hrAgg = await Health.queryAggregated({
    dataType: "heartRate",
    startDate: startIso,
    endDate: endIso,
    bucket: "day",
    aggregation: ["average", "min", "max"],
  });

  const heart_rate: HealthConnectSyncPayload["heart_rate"] = [];
  for (const bucket of hrAgg.samples) {
    const date = isoDate(bucket.startDate);
    const avg = bucket.values.average ?? bucket.value;
    const min = bucket.values.min;
    const max = bucket.values.max;
    if (avg != null && !Number.isNaN(avg)) {
      heart_rate.push({
        recorded_at: `${date}T12:00:00.000Z`,
        bpm: Math.round(avg),
      });
    }
    if (min != null && !Number.isNaN(min)) {
      heart_rate.push({
        recorded_at: `${date}T12:01:00.000Z`,
        bpm: Math.round(min),
      });
    }
    if (max != null && !Number.isNaN(max)) {
      heart_rate.push({
        recorded_at: `${date}T12:02:00.000Z`,
        bpm: Math.round(max),
      });
    }
  }

  const restingAgg = await Health.queryAggregated({
    dataType: "restingHeartRate",
    startDate: startIso,
    endDate: endIso,
    bucket: "day",
    aggregation: "average",
  });
  for (const bucket of restingAgg.samples) {
    const date = isoDate(bucket.startDate);
    heart_rate.push({
      recorded_at: `${date}T12:03:00.000Z`,
      bpm: Math.round(bucket.value),
    });
  }

  const weightSamples = await Health.readSamples({
    dataType: "weight",
    startDate: startIso,
    endDate: endIso,
    limit: 500,
    ascending: false,
  });

  const weightByDate = new Map<string, { recorded_at: string; weight_kg: number }>();
  for (const sample of weightSamples.samples) {
    const date = isoDate(sample.startDate);
    if (!weightByDate.has(date)) {
      weightByDate.set(date, {
        recorded_at: date,
        weight_kg: Math.round(sample.value * 100) / 100,
      });
    }
  }

  return {
    steps,
    sleep: [...sleepByDate.values()],
    heart_rate,
    weight: [...weightByDate.values()],
  };
}

export async function syncHealthConnect(options?: {
  silent?: boolean;
}): Promise<HealthConnectSyncResult & { error?: string }> {
  const avail = await checkHealthConnectAvailable();
  if (!avail.ok) {
    return {
      applied: { steps: 0, sleep: 0, heart_rate: 0, weight: 0 },
      error: avail.reason === "web" ? undefined : avail.reason,
    };
  }

  const granted = await ensureHealthConnectPermissions();
  if (!granted) {
    return {
      applied: { steps: 0, sleep: 0, heart_rate: 0, weight: 0 },
      error: "Permisos de Health Connect denegados",
    };
  }

  const payload = await readHealthConnectPayload();
  const res = await fetch("/api/health/connect/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as HealthConnectSyncResult & { error?: string };
  if (!res.ok) {
    return {
      applied: data.applied ?? { steps: 0, sleep: 0, heart_rate: 0, weight: 0 },
      error: data.error ?? "Error al sincronizar",
      errors: data.errors,
    };
  }

  setLastHealthConnectSync(new Date().toISOString());
  markAutoHealthSyncRan();
  if (!options?.silent && data.errors?.length) {
    return { ...data, error: data.errors[0] };
  }
  return data;
}