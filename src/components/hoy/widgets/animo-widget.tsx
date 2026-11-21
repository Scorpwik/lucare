import { fetchMoodLogs } from "@/lib/data/mind";
import { GlassCard } from "@/components/lucare/glass-card";

const LABELS = ["Muy bajo", "Bajo", "Neutral", "Bien", "Excelente"];

export async function AnimoWidget() {
  const moods = await fetchMoodLogs();
  const mood = moods[0];

  return (
    <GlassCard className="p-4">
      <p className="silk mb-1">ánimo</p>
      <p className="font-dot font-black text-3xl">
        {mood ? LABELS[mood.mood - 1] : "—"}
      </p>
      <p className="text-xs font-mono text-muted-foreground">
        Estrés {mood?.stress ?? "—"}/5
      </p>
    </GlassCard>
  );
}