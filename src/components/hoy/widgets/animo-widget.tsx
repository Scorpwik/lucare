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
  const recent = moods.slice(0, 7).reverse();

  return (
    <Link href="/mente" className="block h-full">
      <GlassCard className="p-4 sm:p-5 h-full" interactive domain="sleep">
        <p className="silk mb-1">ánimo</p>
        {mood ? (
          <>
            <p className="font-dot font-black lc-display leading-tight">
              {LABELS[mood.mood - 1]}
            </p>
            <p className="text-xs font-mono text-muted-foreground">
              Estrés {mood.stress ?? "—"}/5 · check-in de hoy
            </p>
          </>
        ) : (
          <>
            <p className="font-dot font-black lc-display">—</p>
            <p className="text-xs text-muted-foreground">
              Sin check-in hoy. Toca para registrar ánimo y journal.
            </p>
          </>
        )}
        {recent.length > 0 ? (
          <div className="flex gap-1.5 mt-3 flex-wrap" aria-label="Ánimo últimos días">
            {recent.map((m) => (
              <span
                key={m.id}
                title={LABELS[m.mood - 1]}
                className="size-3 rounded-full border border-border"
                style={{
                  background: `color-mix(in srgb, var(--sleep) ${15 + m.mood * 16}%, var(--surface))`,
                }}
              />
            ))}
          </div>
        ) : null}
      </GlassCard>
    </Link>
  );
}