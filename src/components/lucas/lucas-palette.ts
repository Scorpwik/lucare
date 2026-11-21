/** Colours for the approved concept sprite (see lucas-sprite.ts). */
export type LucasDotKey =
  | "."
  | "G"
  | "L"
  | "C"
  | "D"
  | "K"
  | "W"
  | "R"
  | "r"
  | "O";

export const LUCAS_DOT_COLORS: Record<Exclude<LucasDotKey, ".">, string> = {
  G: "#E3B66E",
  L: "#F0CC8C",
  C: "#FBE7BE",
  D: "#A9773F",
  K: "#15110F",
  W: "#FFFFFF",
  R: "#D7302F",
  r: "#9C2020",
  O: "#FF8A4C",
};

export const LUCAS_COLS = 44;
export const LUCAS_ROWS = 59;
/** Cell size so desktop render height ≈ 150px at scale 1. */
export const LUCAS_CELL = 150 / LUCAS_ROWS;