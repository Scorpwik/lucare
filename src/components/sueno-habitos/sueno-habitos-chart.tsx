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
import type { SleepLog } from "@/lib/types";
import { GlassCard } from "@/components/lucare/glass-card";

type Props = { sleepLogs: SleepLog[] };

export function SuenoHabitosChart({ sleepLogs }: Props) {
  const chartData = React.useMemo(
    () =>
      [...sleepLogs]
        .sort((a, b) => a.sleep_date.localeCompare(b.sleep_date))
        .slice(-14)
        .map((s) => ({
          day: s.sleep_date.slice(5).replace("-", "/"),
          hours: s.hours_slept ?? undefined,
          quality: s.quality_score ?? undefined,
        })),
    [sleepLogs],
  );

  if (chartData.length === 0) {
    return (
      <GlassCard className="p-4 col-span-full">
        <p className="silk mb-2">tendencia de sueño</p>
        <p className="text-sm text-muted-foreground">
          Registra al menos una noche para ver horas y calidad.
        </p>
      </GlassCard>
    );
  }

  const single = chartData.length === 1;

  return (
    <div className="grid gap-4 lg:grid-cols-2 col-span-full">
      <SleepChartCard
        title="horas"
        data={chartData}
        dataKey="hours"
        stroke="var(--sleep)"
        single={single}
      />
      <SleepChartCard
        title="calidad"
        data={chartData}
        dataKey="quality"
        stroke="var(--bezel)"
        single={single}
      />
    </div>
  );
}

function SleepChartCard({
  title,
  data,
  dataKey,
  stroke,
  single,
}: {
  title: string;
  data: { day: string; hours?: number; quality?: number }[];
  dataKey: "hours" | "quality";
  stroke: string;
  single: boolean;
}) {
  const hasValues = data.some((d) => d[dataKey] != null);
  if (!hasValues) {
    return (
      <GlassCard className="p-4 h-56">
        <p className="silk mb-2">{title}</p>
        <p className="text-sm text-muted-foreground">Sin datos para este eje.</p>
      </GlassCard>
    );
  }

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
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            strokeWidth={2}
            dot={{ r: single ? 5 : 3 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}