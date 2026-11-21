import Link from "next/link";
import { fetchWorkoutSessions, fetchWorkoutTemplates } from "@/lib/data/gym";
import { GlassCard } from "@/components/lucare/glass-card";

export async function GimnasioWidget() {
  const [templates, sessions] = await Promise.all([
    fetchWorkoutTemplates(),
    fetchWorkoutSessions(1),
  ]);
  const tpl = templates[0];
  const active = sessions.find((s) => !s.ended_at);

  return (
    <GlassCard className="p-4">
      <p className="silk mb-1">gimnasio</p>
      <p className="font-dot font-black text-3xl text-gym">
        {active ? "En sesión" : tpl?.name ?? "Sin rutina"}
      </p>
      <Link href="/gimnasio" className="text-xs font-mono text-muted-foreground mt-2 inline-block">
        Abrir módulo →
      </Link>
    </GlassCard>
  );
}