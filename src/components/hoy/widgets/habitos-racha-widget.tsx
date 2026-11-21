import Link from "next/link";
import { connection } from "next/server";
import {
  computeStreakToDate,
} from "@/lib/habit-streak";
import {
  fetchHabitLogs,
  fetchHabits,
} from "@/lib/data/sleep-habits";
import { DomainChip } from "@/components/lucare/domain-chip";
import { GlassCard } from "@/components/lucare/glass-card";
import { dateInGuayaquil } from "@/lib/reminders";

export async function HabitosRachaWidget() {
  await connection();
  const today = dateInGuayaquil();
  const [habits, logs] = await Promise.all([fetchHabits(), fetchHabitLogs()]);

  if (habits.length === 0) {
    return (
      <Link href="/sueno-habitos" className="block">
        <GlassCard className="p-4 hover:shadow-[var(--shadow-2)] transition-shadow">
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

  return (
    <Link href="/sueno-habitos" className="block">
      <GlassCard className="p-4 hover:shadow-[var(--shadow-2)] transition-shadow">
        <p className="silk mb-2">hábitos</p>
        <p className="text-sm font-medium">{top?.habit.title}</p>
        <p className="text-xs font-mono text-muted-foreground mt-1">
          Hoy {doneCount}/{habits.length} completados
        </p>
        {top && top.streak > 0 && (
          <div className="mt-2">
            <DomainChip label={`Racha ${top.streak} días`} fun />
          </div>
        )}
        {top && top.streak === 0 && (
          <p className="text-xs text-muted-foreground mt-2">Marca un hábito para empezar la racha.</p>
        )}
      </GlassCard>
    </Link>
  );
}