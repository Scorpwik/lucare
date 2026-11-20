"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TiltCardProps = React.HTMLAttributes<HTMLDivElement>;

export function TiltCard({ className, children, ...props }: TiltCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ref.current) return;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    const rect = ref.current.getBoundingClientRect();
    const lx = ((e.clientX - rect.left) / rect.width) * 100;
    const ly = ((e.clientY - rect.top) / rect.height) * 100;
    ref.current.style.setProperty("--lx", `${lx}%`);
    ref.current.style.setProperty("--ly", `${ly}%`);
  };

  return (
    <div
      ref={ref}
      className={cn("glass-panel glass-shine relative overflow-hidden", className)}
      onPointerMove={onMove}
      {...props}
    >
      {children}
    </div>
  );
}