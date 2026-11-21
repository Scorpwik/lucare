"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/use-media-query";

type DomainTint = "gym" | "skin" | "sleep" | "pill" | "default";

const domainVar: Record<DomainTint, string> = {
  gym: "var(--gym)",
  skin: "var(--skin)",
  sleep: "var(--sleep)",
  pill: "var(--pillc)",
  default: "var(--primary)",
};

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  raised?: boolean;
  tilt?: boolean;
  interactive?: boolean;
  gradientBorder?: boolean;
  domain?: DomainTint;
};

export function GlassCard({
  className,
  raised,
  tilt = false,
  interactive = false,
  gradientBorder,
  domain,
  children,
  style,
  ...props
}: GlassCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const finePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const onMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!tilt || !finePointer || reducedMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const lx = ((e.clientX - rect.left) / rect.width) * 100;
      const ly = ((e.clientY - rect.top) / rect.height) * 100;
      ref.current.style.setProperty("--lx", `${lx}%`);
      ref.current.style.setProperty("--ly", `${ly}%`);
    },
    [tilt, finePointer, reducedMotion],
  );

  const onLeave = () => {
    if (!ref.current) return;
    ref.current.style.setProperty("--lx", "50%");
    ref.current.style.setProperty("--ly", "0%");
  };

  const domainStyle = domain
    ? ({ "--domain-glow": domainVar[domain] } as React.CSSProperties)
    : undefined;

  return (
    <div
      ref={ref}
      className={cn(
        "glass-panel glass-shine h-full",
        raised && "glass-panel-raised",
        gradientBorder && "lc-gradient-border",
        interactive && "lc-card-interactive",
        className,
      )}
      style={{ ...domainStyle, ...style }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...props}
    >
      {children}
    </div>
  );
}