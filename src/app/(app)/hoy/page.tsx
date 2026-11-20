import { CitasWidget } from "@/components/hoy/widgets/citas-widget";
import { AgendaWidget } from "@/components/hoy/widgets/agenda-widget";
import { TareasWidget } from "@/components/hoy/widgets/tareas-widget";
import { GimnasioWidget } from "@/components/hoy/widgets/gimnasio-widget";
import { CuerpoResumenWidget } from "@/components/hoy/widgets/cuerpo-resumen-widget";
import { SuenoWidget } from "@/components/hoy/widgets/sueno-widget";
import { HabitosRachaWidget } from "@/components/hoy/widgets/habitos-racha-widget";
import { AnimoWidget } from "@/components/hoy/widgets/animo-widget";
import { CuidadoPersonalWidget } from "@/components/hoy/widgets/cuidado-personal-widget";
import { fetchDashboardWidgets } from "@/lib/data/dashboard";
import type { WidgetKey } from "@/lib/types";
export const metadata = { title: "Hoy" };

export default async function HoyPage() {
  const initialWidgets = await fetchDashboardWidgets();

  const childrenMap: Record<WidgetKey, React.ReactNode> = {
    saludo: <SaludoWidget />,
    bloqueador: <BloqueadorWidget />,
        <CitasWidget />
      </Suspense>
    ),
    gimnasio: (
      <Suspense fallback={<LoadingState />}>
        <GimnasioWidget />
      </Suspense>
    ),
    cuerpo_resumen: (
      <Suspense fallback={<LoadingState />}>
        <CuerpoResumenWidget />
      </Suspense>
    ),
    sueno: (
      <Suspense fallback={<LoadingState />}>
        <SuenoWidget />
      </Suspense>
    ),
    habitos_racha: (
      <Suspense fallback={<LoadingState />}>
        <HabitosRachaWidget />
      </Suspense>
    ),
    animo: (
      <Suspense fallback={<LoadingState />}>
        <AnimoWidget />
      </Suspense>
    ),
    cuidado_personal: (
      <Suspense fallback={<LoadingState />}>
        <CuidadoPersonalWidget />
      </Suspense>
    ),
    agenda: <AgendaWidget />,
    tareas: <TareasWidget />,
  };
        <p className="silk">módulo · hoy</p>
        <h1 className="font-dot font-black text-5xl leading-[0.88] mt-1">Panel</h1>
      </header>
      <WidgetGrid childrenMap={childrenMap} initialWidgets={initialWidgets} />
    </div>
  );
}
