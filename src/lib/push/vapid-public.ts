/** Clave pública VAPID legible en cliente (sin secretos). */
export function vapidPublicKey(): string | null {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  return key || null;
}

export function vapidConfiguredClient(): boolean {
  return Boolean(vapidPublicKey());
}