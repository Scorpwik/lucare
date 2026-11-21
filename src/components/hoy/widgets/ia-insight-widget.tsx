import Link from "next/link";
import { connection } from "next/server";
import { AI_MEDICAL_DISCLAIMER } from "@/lib/ai/prompts";
import { getDailyInsight } from "@/lib/data/ai-insights";
import { fetchDailyActivities } from "@/lib/data/health-samples";
import { GlassCard } from "@/components/lucare/glass-card";
import { dateInGuayaquil } from "@/lib/reminders";

function bulletsFromText(text: string, max = 3): string[] {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length >= 2) return parts.slice(0, max);
  return [text];
}

export async function IaInsightWidget() {
  await connection();
  const [insight, steps] = await Promise.all([
    getDailyInsight(),
    fetchDailyActivities(3),
  ]);
  const today = dateInGuayaquil();
  const todaySteps = steps.find((s) => s.activity_date === today);
  const bullets = bulletsFromText(insight.content);

  return (
    <Link href="/asistente" className="block h-full min-h-0">
      <GlassCard
        className="p-4 sm:p-5 min-h-full"
        gradientBorder
        interactive
        raised
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="silk">insight del día · ia</p>
          {insight.isDemo && (
            <span className="font-mono text-[10px] text-muted-foreground border border-border rounded-[var(--pill)] px-2 py-0.5">
              demo
            </span>
          )}
        </div>
        <ul className="space-y-2 text-sm leading-relaxed list-disc pl-4 @md:list-none @md:pl-0 @md:space-y-1.5">
          {bullets.map((b, i) => (
            <li key={i} className="@md:flex @md:gap-2">
              <span className="hidden @md:inline text-primary font-mono text-xs">◆</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
        {todaySteps?.steps != null && (
          <p className="text-xs font-mono text-muted-foreground mt-3">
            Pasos hoy (importados): {todaySteps.steps.toLocaleString("es-EC")}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground mt-3 leading-snug">{AI_MEDICAL_DISCLAIMER}</p>
      </GlassCard>
    </Link>
  );
}