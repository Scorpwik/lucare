import Link from "next/link";
import { connection } from "next/server";
import { computeStreakToDate } from "@/lib/habit-streak";
import { fetchHabitLogs, fetchHabits } from "@/lib/data/sleep-habits";
import { DomainChip } from "@/components/lucare/domain-chip";
import { GlassCard } from "@/components/lucare/glass-card";
import { dateInGuayaquil } from "@/lib/reminders";

function dotMatrix(n: number) {
  const s = String(Math.min(999, Math.max(0, n))).padStart(3, "0");
  return s;
}

export async function HabitosRachaWidget() {
  await connection();
  const today = dateInGuayaquil();
  const [habits, logs] = await Promise.all([fetchHabits(), fetchHabitLogs()]);

  if (habits.length === 0) {
    return (
      <Link href="/sueno-habitos" className="block h-full">
        <GlassCard className="p-4 sm:p-5 h-full" interactive domain="sleep">
          <p className="silk mb-2">hábitos</p>
          <p className="text-sm text-muted-foreground">
            Aún no tienes hábitos. Crea uno y construye tu racha.
          </p>
        </GlassCard>
      </Link>
    );
  }

  const ranked = habits
    .map((h) => ({
      habit: h,
      streak: computeStreakToDate(h.id, logs, today),
      doneToday: logs.some(
        (l) => l.habit_id === h.id && l.log_date === today && l.completed,
      ),
    }))
    .sort((a, b) => b.streak - a.streak);

  const top = ranked[0];
  const doneCount = ranked.filter((r) => r.doneToday).length;

  const last7: boolean[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(`${today}T12:00:00`);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const any = logs.some(
      (l) => l.log_date === key && l.completed && l.habit_id === top?.habit.id,
    );
    last7.push(any);
  }

  return (
    <Link href="/sueno-habitos" className="block h-full">
      <GlassCard className="p-4 sm:p-5 h-full" interactive domain="sleep">
        <p className="silk mb-2">hábitos</p>
        <div className="flex flex-wrap items-end gap-3 @md:justify-between">
          <div>
            <p className="text-sm font-medium">{top?.habit.title}</p>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              Hoy {doneCount}/{habits.length} completados
            </p>
          </div>
          {top && top.streak > 0 ? (
            <p className="font-dot font-black text-4xl tabular-nums tracking-widest hidden @md:block">
              {dotMatrix(top.streak)}
            </p>
          ) : null}
        </div>
        {top && top.streak > 0 && (
          <div className="mt-2">
            <DomainChip label={`Racha ${top.streak} días`} fun />
          </div>
        )}
        <div className="flex gap-1 mt-3 hidden @sm:flex" aria-label="Últimos 7 días">
          {last7.map((ok, i) => (
            <span
              key={i}
              className={`size-2.5 rounded-sm ${
                ok
                  ? "bg-[var(--amber)]"
                  : "bg-muted border border-border"
              }`}
            />
          ))}
        </div>
        {top && top.streak === 0 && (
          <p className="text-xs text-muted-foreground mt-2">Marca un hábito para empezar la racha.</p>
        )}
      </GlassCard>
    </Link>
  );
}