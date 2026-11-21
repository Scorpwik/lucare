"use client";

import * as React from "react";
import { LucasDotGrid } from "@/components/lucas/lucas-dot-grid";
import { frameWithBlink, LUCAS_IDLE } from "@/components/lucas/lucas-sprite";
import type { LucasDotKey } from "@/components/lucas/lucas-palette";
import { useMediaQuery } from "@/lib/use-media-query";

type Props = {
  size?: "sm" | "md";
  onInteract?: () => void;
};

export function LucasMascot({ size = "md", onInteract }: Props) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [blink, setBlink] = React.useState(false);
  const [happy, setHappy] = React.useState(false);
  const [pupil, setPupil] = React.useState({ x: 0, y: 0 });
  const [tilt, setTilt] = React.useState(0);
  const [breathe, setBreathe] = React.useState(1);
  const [tailWag, setTailWag] = React.useState(0);
  const [hearts, setHearts] = React.useState<{ col: number; row: number; key: LucasDotKey }[]>([]);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const scale = size === "sm" ? 88 / 150 : 1;

  React.useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = rootRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        setPupil({
          x: Math.max(-1, Math.min(1, Math.round(nx * 2))),
          y: Math.max(-1, Math.min(1, Math.round(ny * 2))),
        });
        setTilt(Math.max(-4, Math.min(4, nx * 5)));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  React.useEffect(() => {
    if (reducedMotion) return;
    let timeoutId = 0;
    let cancelled = false;
    const blinkOnce = () => {
      if (cancelled) return;
      if (!document.hidden) {
        setBlink(true);
        window.setTimeout(() => setBlink(false), 120);
      }
      timeoutId = window.setTimeout(blinkOnce, 3000 + Math.random() * 3000);
    };
    timeoutId = window.setTimeout(blinkOnce, 2500);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [reducedMotion]);

  React.useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setBreathe((b) => (b > 1.025 ? 1 : 1.025));
    }, 2200);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  React.useEffect(() => {
    if (reducedMotion) return;
    let flip = 1;
    const id = window.setInterval(() => {
      if (document.hidden || happy) return;
      if (Math.random() < 0.4) {
        flip *= -1;
        setTailWag(flip * 14);
        window.setTimeout(() => setTailWag(0), 380);
      }
    }, 2600);
    return () => window.clearInterval(id);
  }, [reducedMotion, happy]);

  const triggerHappy = () => {
    onInteract?.();
    if (reducedMotion) return;
    setHappy(true);
    let flip = 1;
    const wagId = window.setInterval(() => {
      flip *= -1;
      setTailWag(flip * 22);
    }, 80);
    setHearts([
      { col: 18, row: 4, key: "O" },
      { col: 26, row: 3, key: "R" },
      { col: 22, row: 2, key: "O" },
      { col: 30, row: 5, key: "R" },
    ]);
    window.setTimeout(() => {
      setHappy(false);
      setHearts([]);
      setTailWag(0);
      window.clearInterval(wagId);
    }, 900);
  };

  const frame = blink ? frameWithBlink(LUCAS_IDLE) : LUCAS_IDLE;

  return (
    <div
      ref={rootRef}
      className={`select-none touch-none ${happy ? "animate-[lucas-hop_0.35s_ease-out]" : ""}`}
      onPointerDown={triggerHappy}
      role="presentation"
    >
      <LucasDotGrid
        frame={frame}
        pupilShift={reducedMotion ? { x: 0, y: 0 } : pupil}
        headTiltDeg={reducedMotion ? 0 : tilt}
        tailWagDeg={reducedMotion ? 0 : tailWag}
        breathe={reducedMotion ? 1 : breathe}
        extraDots={hearts}
        scale={scale}
        eyesVisible={!blink}
      />
    </div>
  );
}