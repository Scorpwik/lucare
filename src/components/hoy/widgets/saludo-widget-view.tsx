"use client";

import * as React from "react";
import { spanishMorningGreeting } from "@/lib/greetings";
import { GlassCard } from "@/components/lucare/glass-card";
import { useClientNow } from "@/lib/use-client-time";

type Props = {
  displayName: string;
  eventsToday: number;
  pendingTasks: number;
  medsPending: number;
};

export function SaludoWidgetView({
  displayName,
  eventsToday,
  pendingTasks,
  medsPending,
}: Props) {
  const now = useClientNow();
  const greeting = now ? spanishMorningGreeting(now) : "Buenos días.";
  const dateLabel = now
    ? new Intl.DateTimeFormat("es-EC", {
        timeZone: "America/Guayaquil",
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(now)
    : null;

  return (
    <GlassCard className="p-4 sm:p-5 min-h-full" raised domain="default">
      <div className="flex flex-col @md:flex-row @md:items-end @md:justify-between gap-4">
        <div className="min-w-0">
          <p className="silk mb-1">saludo · hoy</p>
          {dateLabel ? (
            <p className="text-xs text-muted-foreground capitalize mb-2 hidden @md:block">
              {dateLabel}
            </p>
          ) : null}
          <h2 className="font-dot font-black lc-display leading-[0.9] max-w-[16ch]">
            Hola, {displayName}
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-prose">{greeting || "…"}</p>
        </div>
        <ul className="flex flex-wrap gap-2 @md:flex-col @md:items-end text-right shrink-0">
          <li className="rounded-[var(--pill)] border border-border px-3 py-1.5 bg-surface/80 text-xs font-mono tabular-nums">
            <span className="text-muted-foreground">eventos · </span>
            <span className="font-dot font-black text-lg">{eventsToday}</span>
          </li>
          <li className="rounded-[var(--pill)] border border-border px-3 py-1.5 bg-surface/80 text-xs font-mono tabular-nums">
            <span className="text-muted-foreground">deberes · </span>
            <span className="font-dot font-black text-lg">{pendingTasks}</span>
          </li>
          <li className="rounded-[var(--pill)] border border-border px-3 py-1.5 bg-surface/80 text-xs font-mono tabular-nums">
            <span className="text-muted-foreground">pastillas · </span>
            <span className="font-dot font-black text-lg text-pillc">{medsPending}</span>
          </li>
        </ul>
      </div>
    </GlassCard>
  );
}