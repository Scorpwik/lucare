import Link from "next/link";
import { connection } from "next/server";
import { fetchSleepLogs } from "@/lib/data/sleep-habits";
import { GlassCard } from "@/components/lucare/glass-card";
import { dateInGuayaquil } from "@/lib/reminders";

function SleepBars({ logs }: { logs: { sleep_date: string; hours_slept: number | null }[] }) {
  const max = Math.max(...logs.map((l) => l.hours_slept ?? 0), 1);
  return (
    <div className="flex items-end gap-1 h-10 mt-3 hidden @md:flex" aria-hidden>
      {logs
        .slice(0, 7)
        .reverse()
        .map((l) => {
          const h = l.hours_slept ?? 0;
          const pct = Math.round((h / max) * 100);
          return (
            <SmallBar
              key={l.sleep_date}
              pct={pct}
              title={`${l.sleep_date}: ${h}h`}
            />
          );
        })}
    </div>
  );
}

function SmallBar({ pct, title }: { pct: number; title: string }) {
  return (
    <div
      className="flex-1 min-w-0 rounded-sm bg-[color-mix(in_srgb,var(--sleep)_85%,transparent)]"
      style={{ height: `${Math.max(12, pct)}%` }}
      title={title}
    />
  );
}

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
      <Link href="/sueno-habitos" className="block h-full">
        <GlassCard className="p-4 sm:p-5 h-full" interactive domain="sleep">
          <p className="silk mb-1">sueño</p>
          <p className="text-sm text-muted-foreground">
            Registra anoche para ver horas y tendencia.
          </p>
        </GlassCard>
      </Link>
    );
  }

  const isToday = entry.sleep_date === today;

  return (
    <Link href="/sueno-habitos" className="block h-full">
      <GlassCard className="p-4 sm:p-5 h-full" interactive domain="sleep">
        <p className="silk mb-1">sueño</p>
        <p className="font-dot font-black lc-display tabular-nums text-sleep">
          {entry.hours_slept ?? "—"}
          <span className="text-base font-sans text-muted-foreground"> h</span>
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
        <SleepBars logs={logs} />
      </GlassCard>
    </Link>
  );
}