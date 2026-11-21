"use client";

import * as React from "react";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { clientMarkSunscreenApplied } from "@/lib/data/sunscreen-client";
import { useSunscreenCountdown } from "@/lib/use-sunscreen-countdown";
import { SunscreenProgressRing } from "@/components/cuidado-personal/sunscreen-progress-ring";

export function BloqueadorWidget() {
  const { settings, due, progress, countdownLabel, setSettings } = useSunscreenCountdown();
  const [busy, setBusy] = React.useState(false);

  const apply = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBusy(true);
    void clientMarkSunscreenApplied()
      .then((s) => setSettings(s))
      .finally(() => setBusy(false));
  };

  return (
    <GlassCard className="p-4 sm:p-5 h-full" domain="skin">
      <p className="silk mb-1">bloqueador · SPF</p>
      <div className="flex items-center gap-3 min-w-0">
        <SunscreenProgressRing progress={progress} due={due} label={countdownLabel} size={56} />
        <div className="min-w-0 flex-1">
          {due ? (
            <p className="font-dot font-black lc-display-cqi text-accent tabular-nums text-lg">
              Toca reaplicar
            </p>
          ) : countdownLabel ? (
            <p className="font-dot font-black lc-display-cqi text-accent tabular-nums">{countdownLabel}</p>
          ) : (
            <p className="font-dot font-black lc-display-cqi text-accent tabular-nums">—</p>
          )}
          <p className="text-xs font-mono text-muted-foreground mt-1">
            Cada {settings?.reapply_interval_minutes ?? 120} min
          </p>
        </div>
      </div>
      <LcButton
        type="button"
        variant="ghost"
        size="sm"
        className="mt-3 w-full"
        disabled={busy}
        onClick={apply}
      >
        Me lo puse
      </LcButton>
    </GlassCard>
  );
}