"use client";

import * as React from "react";
import {
  LUCAS_CELL,
  LUCAS_COLS,
  LUCAS_DOT_COLORS,
  type LucasDotKey,
} from "@/components/lucas/lucas-palette";
import {
  inEyeBox,
  isTailCell,
  LUCAS_BODY_ROW_MIN,
  LUCAS_HEAD_ROW_MAX,
  parseLucasDots,
  type LucasFrame,
} from "@/components/lucas/lucas-sprite";

type Dot = { col: number; row: number; key: LucasDotKey };

type Props = {
  frame: LucasFrame;
  pupilShift?: { x: number; y: number };
  headTiltDeg?: number;
  tailWagDeg?: number;
  scale?: number;
  className?: string;
  breathe?: number;
  extraDots?: Dot[];
  eyesVisible?: boolean;
};

const DOT_R = LUCAS_CELL * 0.42;
const NECK_COL = 22;
const NECK_ROW = 27;
const TAIL_PIVOT_COL = 7;
const TAIL_PIVOT_ROW = 37;

function dotCenter(col: number, row: number) {
  return { cx: col * LUCAS_CELL + LUCAS_CELL / 2, cy: row * LUCAS_CELL + LUCAS_CELL / 2 };
}

function dotCircle(d: Dot, i: number, extra?: { cx: number; cy: number }) {
  const { cx, cy } = extra ?? dotCenter(d.col, d.row);
  const color = LUCAS_DOT_COLORS[d.key as Exclude<LucasDotKey, ".">] ?? "#E3B66E";
  return (
    <circle
      key={`${d.col}-${d.row}-${i}`}
      cx={cx}
      cy={cy}
      r={DOT_R}
      fill={color}
    />
  );
}

export function LucasDotGrid({
  frame,
  pupilShift = { x: 0, y: 0 },
  headTiltDeg = 0,
  tailWagDeg = 0,
  scale = 1,
  className,
  breathe = 1,
  extraDots = [],
  eyesVisible = true,
}: Props) {
  const classified = React.useMemo(() => {
    const dots = parseLucasDots(frame);
    const head: Dot[] = [];
    const body: Dot[] = [];
    const tail: Dot[] = [];
    const eyes: Dot[] = [];

    for (const d of dots) {
      if (eyesVisible && inEyeBox(d.row, d.col) && (d.key === "K" || d.key === "W")) {
        eyes.push(d);
        continue;
      }
      if (isTailCell(d.row, d.col)) {
        tail.push(d);
      } else if (d.row <= LUCAS_HEAD_ROW_MAX) {
        head.push(d);
      } else if (d.row >= LUCAS_BODY_ROW_MIN) {
        body.push(d);
      } else {
        body.push(d);
      }
    }
    return { head, body, tail, eyes };
  }, [frame, eyesVisible]);

  const w = LUCAS_COLS * LUCAS_CELL;
  const h = frame.length * LUCAS_CELL;
  const neckX = NECK_COL * LUCAS_CELL;
  const neckY = NECK_ROW * LUCAS_CELL;
  const tailPx = TAIL_PIVOT_COL * LUCAS_CELL;
  const tailPy = TAIL_PIVOT_ROW * LUCAS_CELL;

  const headTransform = headTiltDeg
    ? `translate(${neckX} ${neckY}) rotate(${headTiltDeg}) translate(${-neckX} ${-neckY})`
    : undefined;
  const bodyTransform =
    breathe !== 1
      ? `translate(${neckX} ${neckY}) scale(1 ${breathe}) translate(${-neckX} ${-neckY})`
      : undefined;
  const tailTransform = tailWagDeg
    ? `translate(${tailPx} ${tailPy}) rotate(${tailWagDeg}) translate(${-tailPx} ${-tailPy})`
    : undefined;

  return (
    <svg
      data-lucas-svg
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      role="img"
      aria-label="Lucas, mascota LuCare"
    >
      <g transform={bodyTransform}>
        {classified.body.map((d, i) => dotCircle(d, i))}
        <g transform={tailTransform}>
          {classified.tail.map((d, i) => dotCircle(d, i))}
        </g>
      </g>
      <g transform={headTransform}>
        {classified.head.map((d, i) => dotCircle(d, i))}
        {eyesVisible &&
          classified.eyes.map((d, i) => {
            const base = dotCenter(d.col, d.row);
            return dotCircle(d, i, {
              cx: base.cx + pupilShift.x * LUCAS_CELL,
              cy: base.cy + pupilShift.y * LUCAS_CELL,
            });
          })}
      </g>
      {extraDots.map((d, i) => dotCircle(d, i))}
    </svg>
  );
}