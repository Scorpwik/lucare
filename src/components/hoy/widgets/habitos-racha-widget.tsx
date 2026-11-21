import { computeStreak, fetchHabitLogs, fetchHabits } from "@/lib/data/sleep-habits";
import { DomainChip } from "@/components/lucare/domain-chip";
import { GlassCard } from "@/components/lucare/glass-card";

export async function HabitosRachaWidget() {
  const [habits, logs] = await Promise.all([fetchHabits(), fetchHabitLogs()]);
  const top = habits
    .map((h) => ({ habit: h, streak: computeStreak(h.id, logs) }))
    .sort((a, b) => b.streak - a.streak)[0];

  return (
    <GlassCard className="p-4">
      <p className="silk mb-2">hábitos</p>
      <p className="text-sm font-medium">{top?.habit.title ?? "Sin hábitos"}</p>
      {top && (
        <div className="mt-2">
          <DomainChip label={`Racha ${top.streak} días`} fun />
        </div>
      )}
    </GlassCard>
  );
}