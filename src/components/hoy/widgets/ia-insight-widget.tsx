import Link from "next/link";
import { connection } from "next/server";
import { AI_MEDICAL_DISCLAIMER } from "@/lib/ai/prompts";
import { getDailyInsight } from "@/lib/data/ai-insights";
import { fetchDailyActivities } from "@/lib/data/health-samples";
import { GlassCard } from "@/components/lucare/glass-card";
import { dateInGuayaquil } from "@/lib/reminders";

export async function IaInsightWidget() {
  await connection();
  const [insight, steps] = await Promise.all([
    getDailyInsight(),
    fetchDailyActivities(3),
  ]);
  const today = dateInGuayaquil();
  const todaySteps = steps.find((s) => s.activity_date === today);

  return (
    <div className="space-y-2">
      <Link href="/asistente" className="block">
        <GlassCard className="p-4 hover:shadow-[var(--shadow-2)] transition-shadow">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="silk">insight del día</p>
            {insight.isDemo && (
              <span className="font-mono text-[10px] text-muted-foreground border border-border rounded-[var(--pill)] px-2 py-0.5">
                demo
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed">{insight.content}</p>
          {todaySteps?.steps != null && (
            <p className="text-xs font-mono text-muted-foreground mt-2">
              Pasos hoy (importados): {todaySteps.steps.toLocaleString("es-EC")}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground mt-3 leading-snug">{AI_MEDICAL_DISCLAIMER}</p>
        </GlassCard>
      </Link>
    </div>
  );
}