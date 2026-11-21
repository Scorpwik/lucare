"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { clampLucasOffset } from "@/components/lucas/lucas-bounds";
import { LucasMascot } from "@/components/lucas/lucas-mascot";
import {
  readLucasCollapsed,
  readLucasPosition,
  readLucasVisible,
  writeLucasCollapsed,
  writeLucasPosition,
  type LucasPosition,
} from "@/components/lucas/lucas-storage";
import { tipsForPath } from "@/components/lucas/lucas-tips";
import { LcButton } from "@/components/lucare/lc-button";
import { ChevronRight, Minimize2, X } from "lucide-react";
import { useMediaQuery } from "@/lib/use-media-query";

const COMPANION_EVENT = "lucare-lucas-visibility";
const ZERO_OFFSET: LucasPosition = { dx: 0, dy: 0 };

const ANCHOR_CLASS =
  "fixed z-[35] right-3 bottom-[calc(env(safe-area-inset-bottom,0px)+150px)] lg:right-6 lg:bottom-6";

export function LucasCompanion() {
  const pathname = usePathname() ?? "/hoy";
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [hydrated, setHydrated] = React.useState(false);
  const [visible, setVisible] = React.useState(true);
  const [collapsed, setCollapsed] = React.useState(false);
  const [offset, setOffset] = React.useState<LucasPosition>(ZERO_OFFSET);
  const dragRef = React.useRef<{ startX: number; startY: number; odx: number; ody: number } | null>(
    null,
  );
  const boxRef = React.useRef<HTMLDivElement>(null);

  const reclamp = React.useCallback((next: LucasPosition): LucasPosition => {
    const el = boxRef.current;
    if (!el) return next;
    return clampLucasOffset(el, next.dx, next.dy);
  }, []);

  React.useLayoutEffect(() => {
    if (!hydrated || !visible || collapsed) return;
    const el = boxRef.current;
    if (!el) return;
    const clamped = reclamp(offset);
    if (clamped.dx !== offset.dx || clamped.dy !== offset.dy) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- keep companion inside viewport after layout
      setOffset(clamped);
      writeLucasPosition(clamped);
    }
  }, [hydrated, visible, collapsed, offset, reclamp, isMobile]);

  React.useEffect(() => {
    if (!hydrated) return;
    const onResize = () => {
      setOffset((prev) => {
        const clamped = reclamp(prev);
        if (clamped.dx !== prev.dx || clamped.dy !== prev.dy) {
          writeLucasPosition(clamped);
        }
        return clamped;
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [hydrated, reclamp]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate prefs from localStorage after mount
    setVisible(readLucasVisible());
    setCollapsed(readLucasCollapsed());
    const stored = readLucasPosition() ?? ZERO_OFFSET;
    setOffset(stored);
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    const onVis = () => setVisible(readLucasVisible());
    window.addEventListener(COMPANION_EVENT, onVis);
    return () => window.removeEventListener(COMPANION_EVENT, onVis);
  }, []);

  const transformStyle = { transform: `translate(${offset.dx}px, ${offset.dy}px)` };

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (!boxRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      odx: offset.dx,
      ody: offset.dy,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !boxRef.current) return;
    const dx = dragRef.current.odx + (e.clientX - dragRef.current.startX);
    const dy = dragRef.current.ody + (e.clientY - dragRef.current.startY);
    setOffset(clampLucasOffset(boxRef.current, dx, dy));
  };

  const onPointerUp = () => {
    if (dragRef.current) {
      const clamped = boxRef.current ? reclamp(offset) : offset;
      setOffset(clamped);
      writeLucasPosition(clamped);
    }
    dragRef.current = null;
  };

  if (!hydrated || !visible) return null;

  if (collapsed) {
    return (
      <button
        type="button"
        className={`${ANCHOR_CLASS} size-11 rounded-full border border-border bg-glass shadow-[var(--shadow-3)] flex items-center justify-center`}
        style={transformStyle}
        aria-label="Mostrar a Lucas"
        onClick={() => {
          setCollapsed(false);
          writeLucasCollapsed(false);
        }}
      >
        <span className="font-dot text-lg">🐾</span>
      </button>
    );
  }

  return (
    <div
      ref={boxRef}
      data-lucas-companion
      className={`${ANCHOR_CLASS} flex flex-col items-end gap-2 pointer-events-auto w-[min(280px,calc(100vw-32px))]`}
      style={transformStyle}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <LucasTipRotator key={pathname} pathname={pathname} />
      <div
        className="relative cursor-grab active:cursor-grabbing drop-shadow-[0_8px_20px_rgba(0,0,0,0.22)]"
        onPointerDown={onPointerDown}
      >
        <LucasMascot size={isMobile ? "sm" : "md"} />
        <LcButton
          type="button"
          variant="ghost"
          size="sm"
          className="absolute -top-1 -left-1 h-7 w-7 p-0 rounded-full bg-surface/90 border border-border shadow-sm"
          aria-label="Minimizar Lucas"
          onClick={() => {
            setCollapsed(true);
            writeLucasCollapsed(true);
          }}
        >
          <Minimize2 className="size-3.5" />
        </LcButton>
      </div>
    </div>
  );
}

function LucasTipRotator({ pathname }: { pathname: string }) {
  const [dismissed, setDismissed] = React.useState(false);
  const [tipIndex, setTipIndex] = React.useState(0);
  const tips = React.useMemo(() => tipsForPath(pathname), [pathname]);
  const tip = tips[tipIndex % tips.length];

  React.useEffect(() => {
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setTipIndex((i) => i + 1);
    }, 20_000);
    return () => window.clearInterval(id);
  }, []);

  if (dismissed) return null;

  return (
    <LucasTipBubble
      tip={tip.text}
      onNext={() => setTipIndex((i) => i + 1)}
      onClose={() => setDismissed(true)}
    />
  );
}

function LucasTipBubble({
  tip,
  onNext,
  onClose,
}: {
  tip: string;
  onNext: () => void;
  onClose: () => void;
}) {
  return (
    <div
      data-lucas-bubble
      className="relative mr-0 w-full max-w-full self-end rounded-[18px] border border-border/80 bg-glass/90 backdrop-blur-[var(--blur-strong)] px-3.5 py-2.5 shadow-[var(--shadow-3)] text-[13px] leading-snug lg:text-sm"
    >
      <p className="pr-6 text-foreground/95">{tip}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
          onClick={onNext}
        >
          <ChevronRight className="size-3.5" aria-hidden />
          Otro tip
        </button>
      </div>
      <button
        type="button"
        className="absolute top-2 right-2 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-surface/80"
        aria-label="Cerrar tip"
        onClick={onClose}
      >
        <X className="size-3.5" />
      </button>
      <span
        className="pointer-events-none absolute -bottom-2 right-10 size-3 rotate-45 border-b border-r border-border/80 bg-glass/90"
        aria-hidden
      />
    </div>
  );
}

export function notifyLucasVisibilityChanged() {
  window.dispatchEvent(new Event(COMPANION_EVENT));
}