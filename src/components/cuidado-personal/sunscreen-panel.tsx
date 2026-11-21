"use client";

import * as React from "react";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { Label } from "@/components/ui/label";
import {
  MAX_SUNSCREEN_INTERVAL_MIN,
  MIN_SUNSCREEN_INTERVAL_MIN,
  SUNSCREEN_INTERVAL_STEP_MIN,
} from "@/lib/sunscreen";
import {
  clientMarkSunscreenApplied,
  clientSetSunscreenInterval,
} from "@/lib/data/sunscreen-client";
import { useSunscreenCountdown } from "@/lib/use-sunscreen-countdown";
import { SunscreenProgressRing } from "@/components/cuidado-personal/sunscreen-progress-ring";

export function SunscreenPanel() {
  const { settings, due, progress, countdownLabel, refresh, setSettings } =
    useSunscreenCountdown();
  const [busy, setBusy] = React.useState(false);

  if (!settings) return null;

  const apply = () => {
    setBusy(true);
    void clientMarkSunscreenApplied()
      .then((s) => setSettings(s))
      .finally(() => {
        setBusy(false);
        void refresh();
      });
  };

  const onInterval = (v: number) => {
    setBusy(true);
    void clientSetSunscreenInterval(v)
      .then((s) => setSettings(s))
      .finally(() => setBusy(false));
  };

  return (
    <GlassCard className="p-4 space-y-4 lg:col-span-2" domain="skin">
      <p className="silk">bloqueador solar</p>
      <div className="flex flex-wrap items-center gap-4">
        <SunscreenProgressRing progress={progress} due={due} label={countdownLabel} />
        <div className="flex-1 min-w-[12rem] space-y-2">
          {due ? (
            <p className="font-dot font-black text-xl text-accent">Toca reaplicar</p>
          ) : countdownLabel ? (
            <p className="font-dot font-black text-xl tabular-nums">{countdownLabel}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Pulsa cuando te pongas SPF.</p>
          )}
          <p className="text-xs font-mono text-muted-foreground">
            Intervalo cada {settings.reapply_interval_minutes} min
          </p>
          <LcButton type="button" variant="pri" size="sm" disabled={busy} onClick={apply}>
            Me lo puse
          </LcButton>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="spf-interval">
          Reaplicar cada ({MIN_SUNSCREEN_INTERVAL_MIN / 60}–{MAX_SUNSCREEN_INTERVAL_MIN / 60} h)
        </Label>
        <input
          id="spf-interval"
          type="range"
          min={MIN_SUNSCREEN_INTERVAL_MIN}
          max={MAX_SUNSCREEN_INTERVAL_MIN}
          step={SUNSCREEN_INTERVAL_STEP_MIN}
          value={settings.reapply_interval_minutes}
          disabled={busy}
          onChange={(e) => onInterval(Number(e.target.value))}
          className="w-full accent-[var(--skin)]"
        />
        <p className="text-xs font-mono text-muted-foreground">
          {settings.reapply_interval_minutes} minutos ({(settings.reapply_interval_minutes / 60).toFixed(1).replace(".0", "")} h)
        </p>
      </div>
    </GlassCard>
  );
}