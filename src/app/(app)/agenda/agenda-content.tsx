import { AgendaList } from "@/components/agenda/agenda-list";
import { IntegrationBadges, IntegrationPanel } from "@/components/agenda/integration-panel";
import { fetchAgendaEntries } from "@/lib/data/agenda";
import { fetchIntegrationStatuses } from "@/lib/data/integrations";
import { GlassCard } from "@/components/lucare/glass-card";

export async function AgendaContent() {
  const [entries, statuses] = await Promise.all([
    fetchAgendaEntries(),
    fetchIntegrationStatuses(),
  ]);

  return (
    <>
      <IntegrationBadges statuses={statuses} />

      <GlassCard className="p-4 mt-4">
        <p className="silk mb-3">próximos · eventos y deberes</p>
        <AgendaList entries={entries} />
      </GlassCard>

      <div className="mt-4">
        <IntegrationPanel initial={statuses} />
      </div>
    </>
  );
}