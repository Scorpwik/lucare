import Link from "next/link";
import { connection } from "next/server";
import { fetchMoodLogs } from "@/lib/data/mind";
import { GlassCard } from "@/components/lucare/glass-card";
import { dateInGuayaquil } from "@/lib/reminders";

const LABELS = ["Muy bajo", "Bajo", "Neutral", "Bien", "Excelente"];

export async function AnimoWidget() {
  await connection();
  const today = dateInGuayaquil();
  const moods = await fetchMoodLogs();
  const mood = moods.find((m) => m.log_date === today);

  return (
    <Link href="/mente" className="block">
      <GlassCard className="p-4 hover:shadow-[var(--shadow-2)] transition-shadow">
        <p className="silk mb-1">ánimo</p>
        {mood ? (
          <>
            <p className="font-dot font-black text-3xl">{LABELS[mood.mood - 1]}</p>
            <p className="text-xs font-mono text-muted-foreground">
              Estrés {mood.stress ?? "—"}/5 · check-in de hoy
            </p>
          </>
        ) : (
          <>
            <p className="font-dot font-black text-3xl">—</p>
            <p className="text-xs text-muted-foreground">
              Sin check-in hoy. Toca para registrar ánimo y journal.
            </p>
          </>
        )}
      </GlassCard>
    </Link>
  );
}