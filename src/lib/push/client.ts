"use client";

import { vapidPublicKey } from "@/lib/push/vapid-public";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export type PushSubscribeResult =
  | { ok: true; mode?: string }
  | { ok: false; reason: "unsupported" | "denied" | "no-vapid" | "error"; message?: string };

export async function subscribeToWebPush(): Promise<PushSubscribeResult> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return { ok: false, reason: "unsupported", message: "Este navegador no admite Web Push." };
  }

  const publicKey = vapidPublicKey();
  if (!publicKey) {
    return {
      ok: false,
      reason: "no-vapid",
      message: "VAPID no configurado en el servidor.",
    };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, reason: "denied", message: "Permiso de notificaciones denegado." };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      }));

    const json = subscription.toJSON();
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: json.keys,
      }),
    });

    const data = (await res.json().catch(() => null)) as {
      error?: string;
      mode?: string;
    } | null;

    if (!res.ok) {
      return {
        ok: false,
        reason: "error",
        message: data?.error ?? "No se pudo guardar la suscripción.",
      };
    }

    return { ok: true, mode: data?.mode };
  } catch (e) {
    return {
      ok: false,
      reason: "error",
      message: e instanceof Error ? e.message : "Error al suscribirse",
    };
  }
}

export async function unsubscribeFromWebPush(): Promise<{ ok: boolean; message?: string }> {
  if (!("serviceWorker" in navigator)) {
    return { ok: false, message: "Service worker no disponible." };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      return { ok: true };
    }

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();

    const res = await fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      return { ok: false, message: data?.error ?? "No se pudo eliminar la suscripción." };
    }

    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Error al cancelar suscripción",
    };
  }
}

/** Prueba local vía service worker (modo demo o sin VAPID en servidor). */
export async function showLocalTestNotification(): Promise<{ ok: boolean; message?: string }> {
  if (!("serviceWorker" in navigator)) {
    return { ok: false, message: "Service worker no disponible." };
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return { ok: false, message: "Permiso de notificaciones denegado." };
      }
    }
    await registration.showNotification("LuCare · prueba", {
      body: "Las notificaciones locales funcionan.",
      icon: "/icons/icon-192.png",
    });
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "No se pudo mostrar la notificación",
    };
  }
}