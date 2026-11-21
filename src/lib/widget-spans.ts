import type { WidgetKey } from "@/lib/types";

/**
 * Grid spans per breakpoint: sm 2 cols, lg 4, xl 6, 3xl (1880px) 12.
 * Default order packs into full rows at every breakpoint; grid-flow-dense fills gaps after reordering.
 */
export const WIDGET_GRID_SPAN: Record<WidgetKey, string> = {
  saludo: "sm:col-span-2 lg:col-span-4 xl:col-span-4 3xl:col-span-8",
  ia_insight: "sm:col-span-2 lg:col-span-4 xl:col-span-2 3xl:col-span-4",
  bloqueador: "lg:col-span-2 xl:col-span-2 3xl:col-span-4",
  rutina_am: "lg:col-span-2 xl:col-span-2 3xl:col-span-4",
  pastillas: "lg:col-span-2 xl:col-span-2 3xl:col-span-4",
  citas: "lg:col-span-2 xl:col-span-2 3xl:col-span-3",
  gimnasio: "lg:col-span-2 xl:col-span-2 3xl:col-span-3",
  cuerpo_resumen: "lg:col-span-2 xl:col-span-2 3xl:col-span-3",
  sueno: "lg:col-span-2 xl:col-span-2 3xl:col-span-3",
  habitos_racha: "sm:col-span-2 lg:col-span-2 xl:col-span-4 3xl:col-span-4",
  animo: "lg:col-span-2 xl:col-span-2 3xl:col-span-4",
  cuidado_personal: "sm:col-span-2 lg:col-span-4 xl:col-span-4 3xl:col-span-4",
  agenda:
    "sm:col-span-2 lg:col-span-4 xl:col-span-4 3xl:col-span-7 xl:row-span-2",
  tareas:
    "sm:col-span-2 lg:col-span-4 xl:col-span-2 3xl:col-span-5 xl:row-span-2",
};

export function widgetSpanClasses(key: WidgetKey): string {
  return `min-w-0 h-full ${WIDGET_GRID_SPAN[key] ?? ""}`;
}