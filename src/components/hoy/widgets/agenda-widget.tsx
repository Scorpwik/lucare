import { fetchAgendaEntries } from "@/lib/data/agenda";
import { fetchIntegrationStatuses } from "@/lib/data/integrations";
import { AgendaList } from "@/components/agenda/agenda-list";
import { AgendaTimeline } from "@/components/agenda/agenda-timeline";
import { GlassCard } from "@/components/lucare/glass-card";

export async function AgendaWidget() {
  const [entries, statuses] = await Promise.all([
    fetchAgendaEntries({ limit: 24 }),
    fetchIntegrationStatuses(),
  ]);

  const anyConnected = statuses.some((s) => s.connected);
  const subtitle =
    anyConnected || entries.length > 0 ? "sincronizada" : "demo / sin conectar";

  return (
    <GlassCard
      className="p-4 sm:p-5 flex flex-col h-full min-h-0 @container"
      domain="sleep"
    >
      <p className="silk mb-3 shrink-0">agenda · {subtitle}</p>
      <div className="hidden @lg:flex flex-1 min-h-0 flex-col overflow-y-auto pr-0.5 -mr-0.5">
        <AgendaTimeline entries={entries} daysAhead={6} />
      </div>
      <div className="@lg:hidden flex-1 min-h-0">
        <AgendaList entries={entries.slice(0, 4)} compact />
      </div>
    </GlassCard>
  );
}