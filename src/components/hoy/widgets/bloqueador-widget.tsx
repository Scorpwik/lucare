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
  const timeParts = next
    ? new Intl.DateTimeFormat("es-EC", {
        timeZone: "America/Guayaquil",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).formatToParts(next)
    : null;
  const hour = timeParts?.find((p) => p.type === "hour")?.value;
  const minute = timeParts?.find((p) => p.type === "minute")?.value;
  const dayPeriod = timeParts?.find((p) => p.type === "dayPeriod")?.value;

  return (
    <GlassCard className="p-4 sm:p-5 h-full" domain="skin">
      <p className="silk mb-1">bloqueador · SPF</p>
      {hour && minute ? (
        <p className="font-dot font-black lc-display-cqi text-accent tabular-nums flex items-baseline gap-1 min-w-0">
          <span>
            {hour}:{minute}
          </span>
          {dayPeriod ? (
            <span className="text-[0.42em] font-sans font-medium tracking-wide lowercase opacity-80">
              {dayPeriod.replace(/\s+/g, "\u00a0")}
            </span>
          ) : null}
        </p>
      ) : (
        <p className="font-dot font-black lc-display-cqi text-accent tabular-nums">—</p>
      )}
      <p className="text-xs font-mono text-muted-foreground mt-2">
        Próxima aplicación · UV cada 3 h
      </p>
      <GlyphStrip active={4} total={8} className="mt-3" />
    </GlassCard>
  );
}