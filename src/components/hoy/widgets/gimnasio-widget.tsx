import Link from "next/link";
import { connection } from "next/server";
import {
  fetchAllRecentSets,
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

function weeklyVolumeBars(
  sessions: { started_at: string }[],
  sets: { completed_at: string }[],
): number[] {
  const out = [0, 0, 0, 0, 0, 0, 0];
  const now = Date.now();
  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(now - i * 86_400_000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = dayStart.getTime() + 86_400_000;
    const count = sets.filter((s) => {
      const t = new Date(s.completed_at).getTime();
      return t >= dayStart.getTime() && t < dayEnd;
    }).length;
    out[6 - i] = count || sessions.filter((s) => {
      const t = new Date(s.started_at).getTime();
      return t >= dayStart.getTime() && t < dayEnd;
    }).length;
  }
  return out;
}

export async function GimnasioWidget() {
  await connection();
  const [templates, sessions, exercises, sets] = await Promise.all([
    fetchWorkoutTemplates(),
    fetchWorkoutSessions(14),
    fetchWorkoutExercises(),
    fetchAllRecentSets(),
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

  const bars = weeklyVolumeBars(sessions, sets);
  const maxBar = Math.max(...bars, 1);

  return (
    <GlassCard className="p-4 sm:p-5 h-full" domain="gym">
      <p className="silk mb-1">gimnasio</p>
      <p
        className={`font-dot font-black text-gym ${
          active ? "lc-display-cqi" : "lc-display-cqi-multiline"
        }`}
      >
        {headline}
      </p>
      <p className="text-xs font-mono text-muted-foreground mt-1">{sub}</p>
      {bars.some((b) => b > 0) ? (
        <div className="flex items-end gap-0.5 h-8 mt-3 hidden @md:flex" aria-hidden>
          {bars.map((b, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-[color-mix(in_srgb,var(--gym)_75%,transparent)]"
              style={{ height: `${Math.max(15, (b / maxBar) * 100)}%` }}
            />
          ))}
        </div>
      ) : null}
      <Link
        href="/gimnasio"
        className="text-xs font-mono text-muted-foreground mt-2 inline-block"
      >
        {active ? "Continuar sesión →" : "Abrir módulo →"}
      </Link>
    </GlassCard>
  );
}