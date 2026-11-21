"use client";

let scheduledFor: string | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

export function scheduleSunscreenClientReminder(nextDueAt: string | null) {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (!nextDueAt || scheduledFor === nextDueAt) return;
  scheduledFor = nextDueAt;
  const ms = new Date(nextDueAt).getTime() - Date.now();
  if (ms <= 0) {
    void showLocalSunscreenNotification();
    return;
  }
  if (ms > 24 * 60 * 60_000) return;
  timer = setTimeout(() => {
    void showLocalSunscreenNotification();
  }, ms);
}

async function showLocalSunscreenNotification() {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  try {
    if (Notification.permission === "granted") {
      new Notification("LuCare · Bloqueador", {
        body: "Toca reaplicar tu SPF.",
        icon: "/icons/icon-192.png",
        tag: "lucare-sunscreen-due",
      });
      return;
    }
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification("LuCare · Bloqueador", {
        body: "Toca reaplicar tu SPF.",
        icon: "/icons/icon-192.png",
        tag: "lucare-sunscreen-due",
      });
    }
  } catch {
    /* ignore */
  }
}