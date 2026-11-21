import Link from "next/link";
import { connection } from "next/server";
import { fetchBodyGoal, fetchBodyMetrics } from "@/lib/data/body";
import { GlassCard } from "@/components/lucare/glass-card";

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg
      className="mt-2 hidden @md:block"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden
    >
      <polyline
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="1.5"
        strokeLinecap="round"
        points={pts}
        opacity={0.65}
      />
    </svg>
  );
}

export async function CuerpoResumenWidget() {
  await connection();
  const [metrics, goal] = await Promise.all([
    fetchBodyMetrics(),
    fetchBodyGoal(),
  ]);
  const latest = metrics[0];
  const previous = metrics[1];
  const weights = metrics
    .map((m) => m.weight_kg)
    .filter((w): w is number => w != null)
    .slice(0, 8)
    .reverse();

  if (!latest) {
    return (
      <GlassCard className="p-4 sm:p-5 h-full" domain="skin">
        <p className="silk mb-1">cuerpo</p>
        <p className="text-sm text-muted-foreground">
          Sin medidas aún.{" "}
          <Link href="/cuerpo" className="underline text-foreground">
            Registrar peso
          </Link>
        </p>
      </GlassCard>
    );
  }

  let trend: string | null = null;
  if (
    latest.weight_kg != null &&
    previous?.weight_kg != null &&
    latest.weight_kg !== previous.weight_kg
  ) {
    const delta = latest.weight_kg - previous.weight_kg;
    trend =
      delta < 0
        ? `${delta.toFixed(1)} kg vs. el anterior`
        : `+${delta.toFixed(1)} kg vs. el anterior`;
  }

  let goalHint: string | null = null;
  if (goal?.target_weight_kg != null && latest.weight_kg != null) {
    const left = latest.weight_kg - goal.target_weight_kg;
    if (left > 0.05) goalHint = `Meta ${goal.target_weight_kg} kg · faltan ${left.toFixed(1)}`;
    else if (left < -0.05)
      goalHint = `Meta ${goal.target_weight_kg} kg · ${Math.abs(left).toFixed(1)} bajo`;
    else goalHint = `Meta ${goal.target_weight_kg} kg · en objetivo`;
  }

  return (
    <Link href="/cuerpo" className="block h-full">
      <GlassCard className="p-4 sm:p-5 h-full" interactive domain="skin">
        <p className="silk mb-1">cuerpo</p>
        <div className="flex items-end justify-between gap-3">
          <p className="font-dot font-black lc-display tabular-nums">
            {latest.weight_kg ?? "—"}
            <span className="text-sm font-sans text-muted-foreground"> kg</span>
          </p>
          {weights.length >= 2 ? <Sparkline values={weights} /> : null}
        </div>
        <p className="text-xs font-mono text-muted-foreground mt-1">
          Cintura {latest.waist_cm ?? "—"} cm
          {latest.body_fat_pct != null ? ` · grasa ${latest.body_fat_pct}%` : ""}
        </p>
        {trend ? (
          <p className="text-xs font-mono text-muted-foreground mt-1">{trend}</p>
        ) : metrics.length === 1 ? (
          <p className="text-xs text-muted-foreground mt-1">
            Un registro — sigue la tendencia en Cuerpo
          </p>
        ) : null}
        {goalHint ? (
          <p className="text-xs font-mono mt-1 text-[var(--sleep)]">{goalHint}</p>
        ) : null}
      </GlassCard>
    </Link>
  );
}