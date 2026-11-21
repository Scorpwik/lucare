import type { LucasPosition } from "@/components/lucas/lucas-storage";

const VIEWPORT_MARGIN = 8;

/** Clamp translate offset so `el` (with transform already applied) stays inside the viewport. */
export function clampLucasOffset(el: HTMLElement, dx: number, dy: number): LucasPosition {
  el.style.transform = `translate(${dx}px, ${dy}px)`;
  const rect = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let fixX = 0;
  let fixY = 0;
  if (rect.left < VIEWPORT_MARGIN) fixX = VIEWPORT_MARGIN - rect.left;
  if (rect.right > vw - VIEWPORT_MARGIN) fixX = vw - VIEWPORT_MARGIN - rect.right;
  if (rect.top < VIEWPORT_MARGIN) fixY = VIEWPORT_MARGIN - rect.top;
  if (rect.bottom > vh - VIEWPORT_MARGIN) fixY = vh - VIEWPORT_MARGIN - rect.bottom;

  return { dx: dx + fixX, dy: dy + fixY };
}

export function isOffsetInViewport(el: HTMLElement, pos: LucasPosition): boolean {
  el.style.transform = `translate(${pos.dx}px, ${pos.dy}px)`;
  const rect = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const m = VIEWPORT_MARGIN;
  return (
    rect.left >= m &&
    rect.top >= m &&
    rect.right <= vw - m &&
    rect.bottom <= vh - m
  );
}