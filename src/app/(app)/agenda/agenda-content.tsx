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

  const upcomingTasks = entries.filter((e) => e.kind === "notion_task").slice(0, 8);

  return (
  <>
    <IntegrationBadges statuses={statuses} />

    <div className="mt-4 xl:grid xl:grid-cols-12 xl:gap-5 items-start">
      <GlassCard className="p-4 sm:p-5 xl:col-span-8">
        <p className="silk mb-3">próximos · eventos y deberes</p>
        <AgendaList entries={entries} wide />
      </GlassCard>

      <div className="mt-4 xl:mt-0 space-y-4 xl:col-span-4">
        {upcomingTasks.length > 0 ? (
          <GlassCard className="p-4">
            <p className="silk mb-2">deberes próximos</p>
            <AgendaList entries={upcomingTasks} compact />
          </GlassCard>
        ) : null}
        <IntegrationPanel initial={statuses} />
      </div>
    </div>
  </>
  );
}