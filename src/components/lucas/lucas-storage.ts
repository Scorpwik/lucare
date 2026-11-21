const VISIBLE_KEY = "lucare-lucas-visible";
const POS_KEY = "lucare-lucas-pos";
const COLLAPSED_KEY = "lucare-lucas-collapsed";

export function readLucasVisible(): boolean {
  if (typeof window === "undefined") return true;
  const v = localStorage.getItem(VISIBLE_KEY);
  return v !== "0";
}

export function writeLucasVisible(visible: boolean) {
  localStorage.setItem(VISIBLE_KEY, visible ? "1" : "0");
}

/** Drag offset from default bottom-right anchor (negative dx = left, negative dy = up). */
export type LucasPosition = { dx: number; dy: number };

function isDragOffset(raw: unknown): raw is LucasPosition {
  if (!raw || typeof raw !== "object") return false;
  const o = raw as Record<string, unknown>;
  return typeof o.dx === "number" && typeof o.dy === "number";
}

export function readLucasPosition(): LucasPosition | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (isDragOffset(parsed)) return parsed;
    // Legacy left/top storage — discard
    localStorage.removeItem(POS_KEY);
    return null;
  } catch {
    return null;
  }
}

export function writeLucasPosition(pos: LucasPosition) {
  localStorage.setItem(POS_KEY, JSON.stringify(pos));
}

export function readLucasCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COLLAPSED_KEY) === "1";
}

export function writeLucasCollapsed(collapsed: boolean) {
  localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
}