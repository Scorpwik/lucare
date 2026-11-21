import { connection } from "next/server";
import { fetchAppointments } from "@/lib/data/medications";
import { formatTimeEc } from "@/lib/greetings";
import { GlassCard } from "@/components/lucare/glass-card";

function countdownLabel(startsAt: string): string {
  const ms = new Date(startsAt).getTime() - Date.now();
  if (ms <= 0) return "En curso o pasada";
  const hours = Math.floor(ms / 3_600_000);
  const days = Math.floor(hours / 24);
  if (days >= 1) return `En ${days} d ${hours % 24} h`;
  if (hours >= 1) return `En ${hours} h`;
  const mins = Math.floor(ms / 60_000);
  return `En ${mins} min`;
}

export async function CitasWidget() {
  await connection();
  const appts = await fetchAppointments();
  const from = new Date();
  const upcoming = appts
    .filter((a) => new Date(a.starts_at) >= from)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  const next = upcoming[0];

  return (
    <GlassCard className="p-4 sm:p-5 h-full" domain="pill">
      <p className="silk mb-1">citas médicas</p>
      <p className="font-dot font-black lc-display tabular-nums">{upcoming.length}</p>
      {next ? (
        <div className="mt-2 text-sm space-y-1">
          <p className="font-medium lc-card-title">{next.title}</p>
          <p className="font-mono text-xs text-primary tabular-nums">
            {countdownLabel(next.starts_at)}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {formatTimeEc(next.starts_at, {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {next.location ? (
            <p className="text-xs text-muted-foreground truncate @md:line-clamp-none">
              📍 {next.location}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mt-2">Sin citas próximas</p>
      )}
    </GlassCard>
  );
}