import type { WidgetKey } from "@/lib/types";
import {
  Activity,
  Brain,
  CalendarDays,
  Dumbbell,
  HeartPulse,
  ListTodo,
  Moon,
  Pill,
  Sparkles,
  Stethoscope,
  Sun,
  Sunrise,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type WidgetCatalogEntry = {
  key: WidgetKey;
  name: string;
  description: string;
  icon: LucideIcon;
};

export const WIDGET_CATALOG: WidgetCatalogEntry[] = [
  {
    key: "saludo",
    name: "Saludo",
    description: "Resumen del día y bienvenida.",
    icon: UserRound,
  },
  {
    key: "ia_insight",
    name: "Insight IA",
    description: "Sugerencia diaria basada en tus datos.",
    icon: Sparkles,
  },
  {
    key: "bloqueador",
    name: "Bloqueador",
    description: "SPF y tiempo para reaplicar.",
    icon: Sun,
  },
  {
    key: "rutina_am",
    name: "Rutina mañana",
    description: "Pasos de skincare AM.",
    icon: Sunrise,
  },
  {
    key: "pastillas",
    name: "Pastillas",
    description: "Medicación del día.",
    icon: Pill,
  },
  {
    key: "citas",
    name: "Citas",
    description: "Próximas citas médicas.",
    icon: Stethoscope,
  },
  {
    key: "gimnasio",
    name: "Gimnasio",
    description: "Entreno y volumen semanal.",
    icon: Dumbbell,
  },
  {
    key: "cuerpo_resumen",
    name: "Cuerpo",
    description: "Métricas corporales recientes.",
    icon: Activity,
  },
  {
    key: "sueno",
    name: "Sueño",
    description: "Última noche y calidad.",
    icon: Moon,
  },
  {
    key: "habitos_racha",
    name: "Hábitos",
    description: "Racha y hábitos activos.",
    icon: HeartPulse,
  },
  {
    key: "animo",
    name: "Ánimo",
    description: "Estado de ánimo reciente.",
    icon: Brain,
  },
  {
    key: "cuidado_personal",
    name: "Cuidado personal",
    description: "Rutinas de autocuidado.",
    icon: HeartPulse,
  },
  {
    key: "agenda",
    name: "Agenda",
    description: "Eventos y calendario.",
    icon: CalendarDays,
  },
  {
    key: "tareas",
    name: "Tareas",
    description: "Deberes y pendientes.",
    icon: ListTodo,
  },
];

export const ALL_WIDGET_KEYS: WidgetKey[] = WIDGET_CATALOG.map((w) => w.key);

export function catalogEntry(key: WidgetKey): WidgetCatalogEntry | undefined {
  return WIDGET_CATALOG.find((w) => w.key === key);
}