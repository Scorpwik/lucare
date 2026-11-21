import type { WidgetKey } from "@/lib/types";

/** Destino de navegación al pulsar la tarjeta del widget (saludo permanece en Hoy). */
export const WIDGET_SECTION_HREF: Partial<Record<WidgetKey, string>> = {
  ia_insight: "/asistente",
  bloqueador: "/cuidado-personal",
  rutina_am: "/cuidado-personal",
  cuidado_personal: "/cuidado-personal",
  pastillas: "/cuidado",
  citas: "/cuidado",
  gimnasio: "/gimnasio",
  cuerpo_resumen: "/cuerpo",
  sueno: "/sueno-habitos",
  habitos_racha: "/sueno-habitos",
  animo: "/mente",
  agenda: "/agenda",
  tareas: "/agenda",
};

export function widgetSectionHref(key: WidgetKey): string | undefined {
  return WIDGET_SECTION_HREF[key];
}

export const WIDGET_LINK_LABEL: Record<WidgetKey, string> = {
  saludo: "Panel Hoy",
  ia_insight: "Ir al asistente",
  bloqueador: "Ir a cuidado personal",
  rutina_am: "Ir a cuidado personal",
  pastillas: "Ir a cuidado médico",
  citas: "Ir a cuidado médico",
  gimnasio: "Ir al gimnasio",
  cuerpo_resumen: "Ir a cuerpo",
  sueno: "Ir a sueño y hábitos",
  habitos_racha: "Ir a sueño y hábitos",
  animo: "Ir a mente",
  cuidado_personal: "Ir a cuidado personal",
  agenda: "Ir a agenda",
  tareas: "Ir a agenda",
};