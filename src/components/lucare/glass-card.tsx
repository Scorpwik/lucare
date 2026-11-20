"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  raised?: boolean;
  tilt?: boolean;
};

export function GlassCard({
  className,
  raised,
  tilt = true,
  children,
  ...props
}: GlassCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [finePointer] = React.useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: fine)").matches,
  );
  const [reducedMotion] = React.useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const onMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!tilt || !finePointer || reducedMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const lx = ((e.clientX - rect.left) / rect.width) * 100;
      const ly = ((e.clientY - rect.top) / rect.height) * 100;
      ref.current.style.setProperty("--lx", `${lx}%`);
      ref.current.style.setProperty("--ly", `${ly}%`);
      const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
      const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
      ref.current.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    },
    [tilt, finePointer, reducedMotion],
  );

  const onLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "";
    ref.current.style.setProperty("--lx", "50%");
    ref.current.style.setProperty("--ly", "0%");
  };

  return (
    <div
      ref={ref}
      className={cn(
        "glass-panel glass-shine",
        raised && "glass-panel-raised",
        tilt && finePointer && !reducedMotion && "transition-transform duration-150",
        className,
      )}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...props}
    >
      {children}
    </div>
  );
}