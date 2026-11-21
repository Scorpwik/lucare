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
    <div>
      <PageHeading
        module="módulo · ia"
        title="Asistente"
        description="Responde con base en tus registros de LuCare. No sustituye el consejo médico."
      />
      <div className="xl:grid xl:grid-cols-12 xl:gap-5 items-start">
        <div className="xl:col-span-8 max-w-[52rem] xl:max-w-none">
          <AsistenteChat />
        </div>
        <aside className="hidden xl:block xl:col-span-4 space-y-4">
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