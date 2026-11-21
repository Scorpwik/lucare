import type { LucasDotKey } from "@/components/lucas/lucas-palette";

export type LucasFrame = readonly string[];

/**
 * Lucas — dot-matrix sprite from the approved concept (idle pose).
 * One char per dot. "." = transparent.
 * Eyes: rows 12-17; left eye cols 15-20, right eye cols 27-33 (K = pupil, W = highlight).
 * Tail: rows 37-48, cols 0-7. Bandana: rows 27-42 (R/r, W = bone).
 */
export const LUCAS_PALETTE: Record<string, string> = {
  G: "#E3B66E",
  L: "#F0CC8C",
  C: "#FBE7BE",
  D: "#A9773F",
  K: "#15110F",
  W: "#FFFFFF",
  R: "#D7302F",
  r: "#9C2020",
};

export const LUCAS_SPRITE: LucasFrame = [
  ".............GLG................GG..........",
  "............GGGGG...............GGGG........",
  "..........GGGGG.GG....LLL.L....GGGGGGG......",
  "........GGGGGG..GGG..GGLGLG...GG..GGGGGG....",
  "......GGGGGGGG.D..GLLLLLLLLLLLD...GGGGGGG...",
  "......GGGGGGG....GLLLLLLLLLLLLLL...GGGGGGG..",
  "......GGGGGGG.D.GLLLLLLLLLLLLLGLL..GGGGGGG..",
  "......GGGGGGG.DGGLCLGLLLLLLGLCGGG..GGGGGGG..",
  ".......DDDDD..CCCCCCCLLLLLLGCCCCCC..DDDDD...",
  "........DDD..CCCCCCCCGLLLLGCCCCCCCC.DDDD....",
  "........DDD..CCCLGGGCLLLLLCCGGGLCCC..DDD....",
  ".........DD..CLGGGGGLCLLLLCGGGGGGLC..DD.....",
  "............CLGGGKKGGLLLLLLGGKKKGGGC........",
  "...........LGGGGKWWKGLLLLLLGKWWKGGGG........",
  "............GGGKKWWKGLLLLLLDKWWKKGGG........",
  "............GGGWWKKKGLLLLLLDKKKWWGGG........",
  ".............GGCWKKKGLLLLLLGDKKWGGGG........",
  "............GGGGCWKGLLLLLLLLGKKCGGGG........",
  "...........GGGGGGGGLLLLLLLLLCGGGGGGG........",
  "............GGGGGLCCCLLLLLLLCCLGGGGG........",
  ".............GGGCCCCCCLLLLLLCCCCGGG.........",
  ".............CGCCCCCCKWWWCKCCCCCCCL.........",
  "............CLCCCCCCCKKKKKKCCCCCCCLC........",
  ".............LCCCCCCCKKKKKKCCCCCCCC.........",
  ".............CCCCCCCCCKKKKCCCCCCCCC.........",
  ".............LGCCCCCCCCKCCCCCCCCCGL.........",
  "...............CCCCCCCCKKCCCCCCCCC..........",
  "..............RCLCCCCCLLLLCCCCCCC...........",
  ".............RRRDCCCLCCCCCCCLCCKrrR.........",
  ".............RRRrrKKCCCCCCCCKCKrRRR.........",
  ".............RRKRrrrRCCCCCCKRRrrRRR.........",
  ".............RRRKRRRRRrrrRRRRRKKKRR.........",
  "..............rRrrRCRRRrRRRRRRRKRR..........",
  ".............GKRRRWWWRRRRRRRKRRRRKG.........",
  ".............GGKRrWWWWWWRRRrKRRRRGGG........",
  ".............GGGKRWRrWWWRRrKRKRRGGGG........",
  "............GGGGGRRRRRWrRRRRRRrKGGGG........",
  "....CC......GGGGLGRRRRRRRRRRRRKLLGGL........",
  "...LC........GGLCLLRRRRRKKRRrKLCLGGG........",
  "..CLC........GGLCCCLRRRRrRRrKCCLLLLL........",
  "..LLC......G.GLLLCLLLRRRRRRKCCCLLLLL........",
  "..LLC......G.GLLLLCCLLRRrKCCCCLGLLLG........",
  "..LLL.....GGGGLLLGGCCCLRKCCCCLGGLLLGG.......",
  "..LGGG...GGGDGGLLLGGLCCCCCCLLGGLLLGGGG......",
  "..GGGGD.GGGGDKGLLLLGGCLCCCCCGDGLLLLDGG......",
  "..GGGGD.GGGGDGGLLLLGDLLCLCLGDGGLLLLDGGL.....",
  "...GGDD.GGGGDKGLLLLLGGLLLLLDDGLLLLLGGGG.....",
  "...GDGGGGGGGDKGLLLLLLDLLLGGDGGLLLLLDGGG.....",
  "....DGGGGGGGDKGLLLLLKDDDDGGKGGLLLLLDGGG.....",
  ".....DGGGGGGDKGLLLLLLDDDDDDKGLLLLLLGGGG.....",
  ".......GGGGGDKLLLLLLLKDDDDDKGLLLLLLGGG......",
  "........GGGGDDGLLLLLLKDDDDDDGLLLLLLDGG......",
  "........GGGGDKGLLLLLLKDDDDDDGLLLLLLKGL......",
  ".......GLLGGDKLLLLLLLKDDDDDKLLLLLLLKGGLL....",
  ".......GLLLGDGLLLLLLLL.DDD.LLLLLLLLLGGGLL...",
  ".......GLLGG.LLLLLLLLL.....LLLLCLLLL.GLL....",
  "........GGG..LLLGCLLLL.....LLLGCLLLL.G......",
  ".............LLLGLDLLL.....LLLDLLGLG........",
  "..............LL.LLLL.......LL.LLGL.........",
];

export const LUCAS_IDLE = LUCAS_SPRITE;

export const LUCAS_EYE = {
  rowMin: 12,
  rowMax: 17,
  left: { colMin: 15, colMax: 20 },
  right: { colMin: 27, colMax: 33 },
  closedRow: 15,
  closedLeft: { colMin: 16, colMax: 19 },
  closedRight: { colMin: 28, colMax: 32 },
} as const;

export const LUCAS_HEAD_ROW_MAX = 26;
export const LUCAS_BODY_ROW_MIN = 27;
export const LUCAS_TAIL = { rowMin: 37, rowMax: 48, colMin: 0, colMax: 7 } as const;

export function inEyeBox(row: number, col: number): boolean {
  if (row < LUCAS_EYE.rowMin || row > LUCAS_EYE.rowMax) return false;
  return (
    (col >= LUCAS_EYE.left.colMin && col <= LUCAS_EYE.left.colMax) ||
    (col >= LUCAS_EYE.right.colMin && col <= LUCAS_EYE.right.colMax)
  );
}

export function isTailCell(row: number, col: number): boolean {
  return (
    row >= LUCAS_TAIL.rowMin &&
    row <= LUCAS_TAIL.rowMax &&
    col >= LUCAS_TAIL.colMin &&
    col <= LUCAS_TAIL.colMax
  );
}

export function parseLucasDots(frame: LucasFrame): { col: number; row: number; key: LucasDotKey }[] {
  const dots: { col: number; row: number; key: LucasDotKey }[] = [];
  frame.forEach((line, row) => {
    [...line].forEach((ch, col) => {
      if (ch !== ".") dots.push({ col, row, key: ch as LucasDotKey });
    });
  });
  return dots;
}

export function frameWithBlink(frame: LucasFrame): LucasFrame {
  return frame.map((line, row) => {
    if (row < LUCAS_EYE.rowMin || row > LUCAS_EYE.rowMax) return line;
    const chars = [...line];
    for (let col = 0; col < chars.length; col++) {
      if (inEyeBox(row, col)) chars[col] = ".";
    }
    if (row === LUCAS_EYE.closedRow) {
      for (let c = LUCAS_EYE.closedLeft.colMin; c <= LUCAS_EYE.closedLeft.colMax; c++) {
        chars[c] = "K";
      }
      for (let c = LUCAS_EYE.closedRight.colMin; c <= LUCAS_EYE.closedRight.colMax; c++) {
        chars[c] = "K";
      }
    }
    return chars.join("");
  });
}