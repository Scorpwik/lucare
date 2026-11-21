import Link from "next/link";
import { connection } from "next/server";
import {
  fetchWorkoutExercises,
  fetchWorkoutSessions,
  fetchWorkoutTemplates,
} from "@/lib/data/gym";
import { GlassCard } from "@/components/lucare/glass-card";
import { TIMEZONE } from "@/lib/env";

const WEEKDAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

function weekdayInGuayaquil(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
  }).formatToParts(new Date());
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[wd] ?? new Date().getDay();
}

export async function GimnasioWidget() {
  await connection();
  const [templates, sessions, exercises] = await Promise.all([
    fetchWorkoutTemplates(),
    fetchWorkoutSessions(5),
    fetchWorkoutExercises(),
  ]);
  const weekday = weekdayInGuayaquil();
  const todayTpl = templates.find((t) => t.weekday === weekday);
  const active = sessions.find((s) => !s.ended_at);
  const todayExerciseCount = todayTpl
    ? exercises.filter((e) => e.template_id === todayTpl.id).length
    : 0;

  let headline = "Sin rutina hoy";
  let sub = "Crea una plantilla por día de la semana";

  if (active) {
    const tpl = templates.find((t) => t.id === active.template_id);
    headline = "En sesión";
    sub = tpl?.name ?? "Sesión libre";
  } else if (todayTpl) {
    headline = todayTpl.name;
    sub =
      todayExerciseCount > 0
        ? `${todayExerciseCount} ejercicios · ${WEEKDAYS[weekday]}`
        : `Plantilla vacía · ${WEEKDAYS[weekday]}`;
  } else if (templates[0]) {
    sub = `Próxima: ${templates[0].name}`;
  }

  return (
    <GlassCard className="p-4">
      <p className="silk mb-1">gimnasio</p>
      <p className="font-dot font-black text-3xl text-gym leading-tight">{headline}</p>
      <p className="text-xs font-mono text-muted-foreground mt-1">{sub}</p>
      <Link
        href="/gimnasio"
        className="text-xs font-mono text-muted-foreground mt-2 inline-block"
      >
        {active ? "Continuar sesión →" : "Abrir módulo →"}
      </Link>
    </GlassCard>
  );
}