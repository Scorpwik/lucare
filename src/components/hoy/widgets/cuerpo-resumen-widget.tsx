import Link from "next/link";
import { connection } from "next/server";
import { fetchBodyGoal, fetchBodyMetrics } from "@/lib/data/body";
import { GlassCard } from "@/components/lucare/glass-card";

export async function CuerpoResumenWidget() {
  await connection();
  const [metrics, goal] = await Promise.all([
    fetchBodyMetrics(),
    fetchBodyGoal(),
  ]);
  const latest = metrics[0];
  const previous = metrics[1];

  if (!latest) {
    return (
      <GlassCard className="p-4">
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
    <Link href="/cuerpo" className="block">
      <GlassCard className="p-4 hover:shadow-[var(--shadow-2)] transition-shadow">
        <p className="silk mb-1">cuerpo</p>
        <p className="font-dot font-black text-4xl tabular-nums">
          {latest.weight_kg ?? "—"}
          <span className="text-sm font-sans text-muted-foreground"> kg</span>
        </p>
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