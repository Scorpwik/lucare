"use client";

type Props = {
  progress: number;
  due: boolean;
  label: string | null;
  size?: number;
};

export function SunscreenProgressRing({ progress, due, label, size = 72 }: Props) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={
        due ? "Reaplicar bloqueador" : label ? `Próxima reaplicación en ${label}` : "Sin temporizador"
      }
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="color-mix(in srgb, var(--skin) 25%, transparent)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={due ? "var(--accent)" : "var(--skin)"}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={due ? 0 : offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-1000"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-muted-foreground">
        {due ? "!" : Math.round(progress * 100)}%
      </span>
    </div>
  );
}