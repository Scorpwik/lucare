import { fetchAppointments } from "@/lib/data/medications";
import { formatTimeEc } from "@/lib/greetings";
import { GlassCard } from "@/components/lucare/glass-card";

export async function CitasWidget() {
  const appts = await fetchAppointments();
  const upcoming = appts;

  return (
    <GlassCard className="p-4">
      <p className="silk mb-1">citas médicas</p>
      <p className="font-dot font-black text-4xl tabular-nums">{upcoming.length}</p>
      {upcoming[0] ? (
        <div className="mt-2 text-sm">
          <p className="font-medium">{upcoming[0].title}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {formatTimeEc(upcoming[0].starts_at, {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mt-2">Sin citas próximas</p>
      )}
    </GlassCard>
  );
}