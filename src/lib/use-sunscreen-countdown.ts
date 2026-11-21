"use client";

import * as React from "react";
import type { UserSunscreenSettings } from "@/lib/types";
import {
  clientFetchSunscreenSettings,
  clientGetSunscreenSettings,
  demoSunscreenFallback,
} from "@/lib/data/sunscreen-client";
import { isDemoModeClient } from "@/lib/env";
import {
  formatCountdownMs,
  sunscreenDueNow,
  sunscreenProgress,
} from "@/lib/sunscreen";
import { scheduleSunscreenClientReminder } from "@/lib/sunscreen-notify-client";

export function useSunscreenCountdown() {
  const [settings, setSettings] = React.useState<UserSunscreenSettings | null>(null);
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const s = isDemoModeClient()
          ? clientGetSunscreenSettings()
          : await clientFetchSunscreenSettings();
        if (!cancelled) setSettings(s ?? demoSunscreenFallback());
      } catch {
        if (!cancelled) setSettings(demoSunscreenFallback());
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const due =
    settings && now ? sunscreenDueNow(settings.next_due_at, now) : false;
  const progress =
    settings && now
      ? sunscreenProgress(settings.last_applied_at, settings.next_due_at, now)
      : 0;

  const remainingMs =
    settings?.next_due_at && now
      ? Math.max(0, new Date(settings.next_due_at).getTime() - now.getTime())
      : null;

  const countdownLabel =
    due || remainingMs === null
      ? null
      : formatCountdownMs(remainingMs);

  React.useEffect(() => {
    if (settings?.next_due_at) {
      scheduleSunscreenClientReminder(settings.next_due_at);
    }
  }, [settings?.next_due_at]);

  const refresh = React.useCallback(async () => {
    try {
      const s = isDemoModeClient()
        ? clientGetSunscreenSettings()
        : await clientFetchSunscreenSettings();
      setSettings(s ?? demoSunscreenFallback());
    } catch {
      setSettings(demoSunscreenFallback());
    }
  }, []);

  return {
    settings,
    now,
    due,
    progress,
    countdownLabel,
    refresh,
    setSettings,
  };
}