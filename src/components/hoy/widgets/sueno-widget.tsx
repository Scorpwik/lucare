import Link from "next/link";
import { connection } from "next/server";
import { fetchSleepLogs } from "@/lib/data/sleep-habits";
import { GlassCard } from "@/components/lucare/glass-card";
import { dateInGuayaquil } from "@/lib/reminders";

export async function SuenoWidget() {
  await connection();
  const today = dateInGuayaquil();
  const logs = await fetchSleepLogs(7);
  const todayLog = logs.find((s) => s.sleep_date === today);
  const entry = todayLog ?? logs[0];

  const trend =
    logs.length >= 2 && logs[0]?.hours_slept != null && logs[1]?.hours_slept != null
      ? logs[0].hours_slept! - logs[1].hours_slept!
      : null;

  if (!entry) {
    return (
      <Link href="/sueno-habitos" className="block">
        <GlassCard className="p-4 hover:shadow-[var(--shadow-2)] transition-shadow">
          <p className="silk mb-1">sueño</p>
          <p className="text-sm text-muted-foreground">Registra anoche para ver horas y tendencia.</p>
        </GlassCard>
      </Link>
    );
  }

  const isToday = entry.sleep_date === today;

  return (
    <Link href="/sueno-habitos" className="block">
      <GlassCard className="p-4 hover:shadow-[var(--shadow-2)] transition-shadow">
        <p className="silk mb-1">sueño</p>
        <p className="font-dot font-black text-4xl tabular-nums text-sleep">
          {entry.hours_slept ?? "—"} h
        </p>
        <p className="text-xs font-mono text-muted-foreground">
          {isToday ? "Hoy" : entry.sleep_date} · calidad {entry.quality_score ?? "—"}
        </p>
        {trend != null && Math.abs(trend) >= 0.01 && (
          <p className="text-xs font-mono text-muted-foreground mt-1">
            vs. noche anterior: {trend > 0 ? "+" : ""}
            {trend.toFixed(1)} h
          </p>
        )}
      </GlassCard>
    </Link>
  );
}