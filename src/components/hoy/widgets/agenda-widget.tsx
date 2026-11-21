import { fetchAgendaEntries } from "@/lib/data/agenda";
import { fetchIntegrationStatuses } from "@/lib/data/integrations";
import { GlassCard } from "@/components/lucare/glass-card";
import { AgendaList } from "@/components/agenda/agenda-list";

export async function AgendaWidget() {
  const [entries, statuses] = await Promise.all([
    fetchAgendaEntries({ limit: 4 }),
    fetchIntegrationStatuses(),
  ]);

  const anyConnected = statuses.some((s) => s.connected);
  const subtitle =
    anyConnected || entries.length > 0 ? "sincronizada" : "demo / sin conectar";

  return (
    <GlassCard className="p-4 col-span-full lg:col-span-2">
      <p className="silk mb-2">agenda · {subtitle}</p>
      <AgendaList entries={entries} compact />
    </GlassCard>
  );
}