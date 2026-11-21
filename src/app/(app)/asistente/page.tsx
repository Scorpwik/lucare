import { AsistenteChat } from "@/components/asistente/asistente-chat";
import { PageHeading } from "@/components/layout/page-heading";
import { GlassCard } from "@/components/lucare/glass-card";

export const metadata = { title: "Asistente" };

const promptHints = [
  "¿Cómo dormí esta semana?",
  "Resumen de mi entrenamiento",
  "¿Qué tengo en la agenda hoy?",
  "Sugerencias para mi rutina de mañana",
];

export default function AsistentePage() {
  return (
    <div className="flex flex-col min-h-[calc(100dvh-8rem)] lg:min-h-[calc(100dvh-6rem)]">
      <PageHeading
        module="módulo · ia"
        title="Asistente"
        description="Responde con base en tus registros de LuCare. No sustituye el consejo médico."
      />
      <div className="flex-1 min-h-0 flex flex-col xl:grid xl:grid-cols-12 xl:gap-5 xl:items-stretch">
        <div className="flex-1 min-h-0 flex flex-col xl:col-span-8 max-w-[52rem] xl:max-w-none">
          <AsistenteChat className="flex-1 min-h-0" />
        </div>
        <aside className="hidden xl:flex xl:col-span-4 flex-col gap-4 min-h-0">
          <GlassCard className="p-4">
            <p className="silk mb-2">sugerencias</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {promptHints.map((p) => (
                <li key={p} className="border border-border rounded-[var(--pill)] px-3 py-2 bg-surface/60">
                  {p}
                </li>
              ))}
            </ul>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="silk mb-2">contexto de hoy</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              El asistente usa tus datos de sueño, hábitos, gimnasio, cuerpo y agenda cuando estás conectado.
            </p>
          </GlassCard>
        </aside>
      </div>
    </div>
  );
}