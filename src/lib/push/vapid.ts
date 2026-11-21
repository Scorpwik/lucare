import { setVapidDetails } from "web-push";
import { env } from "@/lib/env";

export function vapidConfigured(): boolean {
  return Boolean(env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() && env.VAPID_PRIVATE_KEY?.trim());
}

export function vapidPublicKey(): string | null {
  const key = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  return key || null;
}

/** Asunto del par VAPID (mailto: o https:). Solo servidor. */
export function vapidSubject(): string {
  const custom = process.env.VAPID_SUBJECT?.trim();
  if (custom) return custom;
  return "mailto:notificaciones@lucare.local";
}

export function ensureWebPushConfigured(): void {
  if (!vapidConfigured()) {
    throw new Error("VAPID no configurado");
  }
  setVapidDetails(
    vapidSubject(),
    env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    env.VAPID_PRIVATE_KEY!,
  );
}