import { Suspense } from "react";
import { HoyDashboard } from "@/components/hoy/hoy-dashboard";
import { SaludoWidget } from "@/components/hoy/widgets/saludo-widget";
import { BloqueadorWidget } from "@/components/hoy/widgets/bloqueador-widget";
import { LoadingState } from "@/components/lucare/loading-state";
import { RutinaAmWidget } from "@/components/hoy/widgets/rutina-am-widget";
import { PastillasWidget } from "@/components/hoy/widgets/pastillas-widget";
import { CitasWidget } from "@/components/hoy/widgets/citas-widget";
import { AgendaWidget } from "@/components/hoy/widgets/agenda-widget";
import { TareasWidget } from "@/components/hoy/widgets/tareas-widget";
import { GimnasioWidget } from "@/components/hoy/widgets/gimnasio-widget";
import { CuerpoResumenWidget } from "@/components/hoy/widgets/cuerpo-resumen-widget";
import { SuenoWidget } from "@/components/hoy/widgets/sueno-widget";
import { HabitosRachaWidget } from "@/components/hoy/widgets/habitos-racha-widget";
import { AnimoWidget } from "@/components/hoy/widgets/animo-widget";
import { CuidadoPersonalWidget } from "@/components/hoy/widgets/cuidado-personal-widget";
import { IaInsightWidget } from "@/components/hoy/widgets/ia-insight-widget";
import { fetchDashboardWidgets } from "@/lib/data/dashboard";
import type { WidgetKey } from "@/lib/types";

export async function HoyPageContent() {
  const initialWidgets = await fetchDashboardWidgets();

  const childrenMap: Record<WidgetKey, React.ReactNode> = {
    saludo: (
      <Suspense fallback={<LoadingState />}>
        <SaludoWidget />
      </Suspense>
    ),
    ia_insight: (
      <Suspense fallback={<LoadingState />}>
        <IaInsightWidget />
      </Suspense>
    ),
    bloqueador: <BloqueadorWidget />,
    rutina_am: (
      <Suspense fallback={<LoadingState />}>
        <RutinaAmWidget />
      </Suspense>
    ),
    pastillas: (
      <Suspense fallback={<LoadingState />}>
        <PastillasWidget />
      </Suspense>
    ),
    citas: (
      <Suspense fallback={<LoadingState />}>
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
    agenda: (
      <Suspense fallback={<LoadingState />}>
        <AgendaWidget />
      </Suspense>
    ),
    tareas: <TareasWidget />,
  };

  return <HoyDashboard childrenMap={childrenMap} initialWidgets={initialWidgets} />;
}