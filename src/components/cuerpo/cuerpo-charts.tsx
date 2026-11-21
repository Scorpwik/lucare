"use client";

import * as React from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BodyMetric } from "@/lib/types";
import { GlassCard } from "@/components/lucare/glass-card";

type Props = { metrics: BodyMetric[] };

export function CuerpoCharts({ metrics }: Props) {
  const chartData = React.useMemo(
    () =>
      [...metrics]
        .sort(
          (a, b) =>
            new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
        )
        .map((m) => ({
          day: m.recorded_at.slice(5).replace("-", "/"),
          weight: m.weight_kg ?? undefined,
          waist: m.waist_cm ?? undefined,
          fat: m.body_fat_pct ?? undefined,
        })),
    [metrics],
  );

  const hasWeight = chartData.some((d) => d.weight != null);
  const hasWaist = chartData.some((d) => d.waist != null);
  const hasFat = chartData.some((d) => d.fat != null);

  if (chartData.length === 0) {
    return (
      <GlassCard className="p-4">
        <p className="silk mb-2">tendencias</p>
        <p className="text-sm text-muted-foreground">
          Registra al menos una medición para ver cómo evolucionas.
        </p>
      </GlassCard>
    );
  }

  return (
    <ChartGrid>
      {hasWeight && (
        <ChartCard title="peso (kg)" data={chartData} lines={[{ key: "weight", stroke: "var(--sleep)" }]} single={chartData.length === 1} />
      )}
      {hasWaist && (
        <ChartCard title="cintura (cm)" data={chartData} lines={[{ key: "waist", stroke: "var(--skin)" }]} single={chartData.length === 1} />
      )}
      {hasFat && (
        <ChartCard title="grasa corporal (%)" data={chartData} lines={[{ key: "fat", stroke: "var(--bezel)" }]} single={chartData.length === 1} />
      )}
      {!hasWeight && !hasWaist && !hasFat && (
        <GlassCard className="p-4 col-span-full">
          <p className="silk mb-2">tendencias</p>
          <p className="text-sm text-muted-foreground">
            Añade peso, cintura o % de grasa en tus registros para graficar.
          </p>
        </GlassCard>
      )}
    </ChartGrid>
  );
}

function ChartGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

function ChartCard({
  title,
  data,
  lines,
  single,
}: {
  title: string;
  data: { day: string; weight?: number; waist?: number; fat?: number }[];
  lines: { key: keyof (typeof data)[0]; stroke: string }[];
  single: boolean;
}) {
  return (
    <GlassCard className="p-4 h-56">
      <p className="silk mb-2">{title}</p>
      {single ? (
        <p className="text-xs font-mono text-muted-foreground mb-2">
          Un punto — sigue registrando para ver la línea.
        </p>
      ) : null}
      <ResponsiveContainer width="100%" height={single ? "72%" : "78%"}>
        <LineChart data={data}>
          <XAxis dataKey="day" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} width={36} domain={["auto", "auto"]} />
          <Tooltip />
          {lines.map((line) => (
            <Line
              key={String(line.key)}
              type="monotone"
              dataKey={line.key as string}
              stroke={line.stroke}
              strokeWidth={2}
              dot={{ r: single ? 5 : 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}