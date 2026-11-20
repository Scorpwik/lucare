"use client";

import * as React from "react";
import { GlassCard } from "@/components/lucare/glass-card";
import { GlyphStrip } from "@/components/lucare/glyph-strip";
import { computeNextFireTime } from "@/lib/reminders";
import { useClientNow } from "@/lib/use-client-time";

export function BloqueadorWidget() {
  const now = useClientNow();
  const next = now
    ? computeNextFireTime({
        startTime: "07:00",
        endTime: "18:00",
        intervalMinutes: 180,
        referenceDate: now,
      })
    : null;
  const label = next
    ? new Intl.DateTimeFormat("es-EC", {
        timeZone: "America/Guayaquil",
        hour: "2-digit",
        minute: "2-digit",
      }).format(next)
    : "—";

  return (
    <GlassCard className="p-4">
      <p className="silk mb-1">bloqueador · SPF</p>
      <p className="font-dot font-black text-5xl leading-none text-accent tabular-nums">
        {label}
      </p>
      <p className="text-xs font-mono text-muted-foreground mt-2">
        Próxima aplicación
      </p>
      <GlyphStrip active={4} total={8} className="mt-3" />
    </GlassCard>
  );
}