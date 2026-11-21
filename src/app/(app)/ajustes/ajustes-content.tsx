import { HealthConnectSyncPanel } from "@/components/ajustes/health-connect-sync-panel";
import { HealthImportPanel } from "@/components/ajustes/health-import-panel";
import { LucasSettingsPanel } from "@/components/ajustes/lucas-settings-panel";
import { PasswordSettingsPanel } from "@/components/ajustes/password-settings-panel";
import { PushSettingsPanel } from "@/components/ajustes/push-settings-panel";
import { IntegrationPanel } from "@/components/agenda/integration-panel";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { fetchIntegrationStatuses } from "@/lib/data/integrations";
import { GlassCard } from "@/components/lucare/glass-card";
import type { WidgetKey } from "@/lib/types";

const widgetLabels: Record<WidgetKey, string> = {
  saludo: "Saludo",
  ia_insight: "Insight IA",
  bloqueador: "Bloqueador",
  rutina_am: "Rutina mañana",
  pastillas: "Pastillas",
  citas: "Citas",
  gimnasio: "Gimnasio",
  cuerpo_resumen: "Cuerpo",
  sueno: "Sueño",
  habitos_racha: "Hábitos (racha)",
  animo: "Ánimo",
  cuidado_personal: "Cuidado personal",
  agenda: "Agenda",
  tareas: "Tareas",
};

export async function AjustesContent({
  searchParams,
}: {
  searchParams: Promise<{ integration?: string; reason?: string }>;
}) {
  const { integration, reason } = await searchParams;
  const statuses = await fetchIntegrationStatuses();

  const banner =
    integration === "google-ok"
      ? "Google Calendar conectado correctamente."
      : integration === "google-error"
        ? `Error al conectar Google${reason ? `: ${reason}` : ""}`
        : integration === "missing-env"
          ? "Faltan variables de entorno para Google OAuth."
          : null;

  return (
    <>
      {banner && (
        <GlassCard className="p-3 mb-4 text-sm border border-border">{banner}</GlassCard>
      )}

      <div className="lg:grid lg:grid-cols-2 lg:gap-4 space-y-4 lg:space-y-0">
        <LucasSettingsPanel />
        <GlassCard className="p-4 flex items-center justify-between gap-3 h-fit">
          <div>
            <p className="silk mb-1">tema</p>
            <p className="text-xs text-muted-foreground">Claro, oscuro o según el sistema.</p>
          </div>
          <ThemeToggle />
        </GlassCard>

        <div className="lg:col-span-2">
          <PushSettingsPanel />
        </div>
        <div className="lg:col-span-2">
          <PasswordSettingsPanel />
        </div>
        <div className="lg:col-span-2">
          <IntegrationPanel initial={statuses} />
        </div>
        <div className="lg:col-span-2">
          <HealthConnectSyncPanel />
          <HealthImportPanel />
        </div>

        <GlassCard className="p-4 lg:col-span-2">
          <p className="silk mb-2">widgets · referencia</p>
          <p className="text-xs text-muted-foreground mb-3">
            Reordena y oculta widgets desde el panel Hoy (arrastrar / ojo).
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 text-xs font-mono text-muted-foreground">
            {(Object.keys(widgetLabels) as WidgetKey[]).map((key) => (
              <li key={key} className="border border-border rounded-[var(--pill)] px-2 py-1 bg-surface/50">
                {widgetLabels[key]}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </>
  );
}