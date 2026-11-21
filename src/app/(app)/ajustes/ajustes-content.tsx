import { IntegrationPanel } from "@/components/agenda/integration-panel";
import { fetchIntegrationStatuses } from "@/lib/data/integrations";
import { GlassCard } from "@/components/lucare/glass-card";
import type { WidgetKey } from "@/lib/types";

const widgetLabels: Record<WidgetKey, string> = {
  saludo: "Saludo",
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

      <IntegrationPanel initial={statuses} />

      <GlassCard className="p-4 mt-4">
        <p className="silk mb-2">widgets · referencia</p>
        <p className="text-xs text-muted-foreground mb-3">
          Reordena y oculta widgets desde el panel Hoy (arrastrar / ojo).
        </p>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-muted-foreground">
          {(Object.keys(widgetLabels) as WidgetKey[]).map((key) => (
            <li key={key} className="border border-border rounded-[var(--pill)] px-2 py-1">
              {widgetLabels[key]}
            </li>
          ))}
        </ul>
      </GlassCard>
    </>
  );
}