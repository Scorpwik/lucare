"use client";

import * as React from "react";
import { GlassCard } from "@/components/lucare/glass-card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  readLucasVisible,
  writeLucasVisible,
} from "@/components/lucas/lucas-storage";
import { notifyLucasVisibilityChanged } from "@/components/lucas/lucas-companion";

export function LucasSettingsPanel() {
  const [show, setShow] = React.useState(() =>
    typeof window === "undefined" ? true : readLucasVisible(),
  );

  return (
    <GlassCard className="p-4 flex items-center justify-between gap-3 h-fit">
      <div>
        <p className="silk mb-1">mascota · Lucas</p>
        <Label htmlFor="lucas-visible" className="text-xs text-muted-foreground font-normal">
          Compañero flotante con tips contextuales por sección.
        </Label>
      </div>
      <Switch
        id="lucas-visible"
        checked={show}
        onCheckedChange={(v) => {
          setShow(v);
          writeLucasVisible(v);
          notifyLucasVisibilityChanged();
        }}
      />
    </GlassCard>
  );
}