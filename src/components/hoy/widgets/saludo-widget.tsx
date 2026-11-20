"use client";

import * as React from "react";
import { spanishMorningGreeting } from "@/lib/greetings";
import { GlassCard } from "@/components/lucare/glass-card";
import { getDemoState } from "@/lib/demo-store";
import { useClientNow } from "@/lib/use-client-time";

export function SaludoWidget() {
  const now = useClientNow();
  const greeting = now ? spanishMorningGreeting(now) : "Buenos días.";
  const name = getDemoState().displayName;

  return (
    <GlassCard className="p-4 col-span-full">
      <p className="silk mb-1">saludo · hoy</p>
      <h2 className="font-dot font-black text-3xl sm:text-4xl leading-[0.9] max-w-[14ch]">
        Hola, {name}
      </h2>
      <p className="text-sm text-muted-foreground mt-3 max-w-md">
        {greeting || "…"}
      </p>
    </GlassCard>
  );
}