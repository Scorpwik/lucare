"use client";

import { getDemoState } from "@/lib/demo-store";
import { clientGetSunscreenSettings } from "@/lib/data/sunscreen-client";
import { isDemoModeClient } from "@/lib/env";
import {
  formatCountdownMs,
  sunscreenDueNow,
} from "@/lib/sunscreen";

export type LucasTip = { text: string; source: "data" | "static" };

const STATIC_BY_PREFIX: Record<string, string[]> = {
  "/hoy": [
    "Tu panel resume el día — toca una tarjeta para ir a esa sección.",
    "Personalizar te deja ordenar widgets a tu gusto.",
  ],
  "/asistente": [
    "Pregunta por sueño, gym o agenda; uso tus datos locales.",
    "Las sugerencias de la derecha son buenos primeros mensajes.",
  ],
  "/cuidado-personal": [
    "El bloqueador cuenta desde «Me lo puse».",
    "Ajusta el intervalo entre 1 h y 4 h.",
  ],
  "/cuidado": [
    "Aquí van pastillas y citas médicas.",
    "Los recordatorios respetan tu ventana activa.",
  ],
  "/gimnasio": [
    "Empieza una sesión y registra series al vuelo.",
    "El widget de Hoy muestra volumen semanal.",
  ],
  "/cuerpo": [
    "Registra peso y composición cuando puedas.",
    "Las fotos de progreso quedan en la línea de tiempo.",
  ],
  "/sueno-habitos": [
    "El sueño y los hábitos comparten racha.",
    "Un log breve cada noche ayuda al asistente.",
  ],
  "/mente": [
    "Anotar el ánimo toma menos de un minuto.",
    "Revisa patrones en la misma vista.",
  ],
  "/agenda": [
    "Conecta Google o Notion para deberes.",
    "Las tareas pendientes aparecen en Hoy.",
  ],
  "/ajustes": [
    "Activa notificaciones push para recordatorios.",
    "Puedes ocultarme aquí si prefieres concentrarte.",
  ],
};

function matchPrefix(pathname: string): string {
  const keys = Object.keys(STATIC_BY_PREFIX).sort((a, b) => b.length - a.length);
  return keys.find((k) => pathname === k || pathname.startsWith(`${k}/`)) ?? "/hoy";
}

function dataTipForPath(pathname: string, now: Date): LucasTip | null {
  const prefix = matchPrefix(pathname);
  if (prefix === "/hoy" || prefix === "/agenda") {
    const s = getDemoState();
    const pendingTasks = s.tasks.filter((t) => !t.completed).length;
    const nextEvent = [...s.externalEvents].sort((a, b) =>
      a.starts_at.localeCompare(b.starts_at),
    )[0];
    if (nextEvent) {
      const when = new Intl.DateTimeFormat("es-EC", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(nextEvent.starts_at));
      return {
        text: `Próximo en agenda: ${nextEvent.title} (${when}). Tienes ${pendingTasks} pendiente(s).`,
        source: "data",
      };
    }
    if (pendingTasks > 0) {
      return { text: `${pendingTasks} deber(es) pendiente(s) en demo.`, source: "data" };
    }
  }
  if (prefix === "/gimnasio") {
    const s = getDemoState();
    if (s.activeWorkoutSessionId) {
      return { text: "Tienes una sesión de gym activa. ¡Sigue con las series!", source: "data" };
    }
  }
  if (prefix === "/cuidado-personal" || prefix === "/hoy") {
    try {
      const spf = isDemoModeClient() ? clientGetSunscreenSettings() : clientGetSunscreenSettings();
      if (spf.next_due_at) {
        if (sunscreenDueNow(spf.next_due_at, now)) {
          return { text: "Toca reaplicar bloqueador solar.", source: "data" };
        }
        const ms = new Date(spf.next_due_at).getTime() - now.getTime();
        return {
          text: `Reaplica SPF en ${formatCountdownMs(ms)}.`,
          source: "data",
        };
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

export function tipsForPath(pathname: string, now = new Date()): LucasTip[] {
  const prefix = matchPrefix(pathname);
  const staticList = STATIC_BY_PREFIX[prefix] ?? STATIC_BY_PREFIX["/hoy"];
  const data = isDemoModeClient() ? dataTipForPath(pathname, now) : null;
  const tips: LucasTip[] = data ? [data] : [];
  for (const t of staticList) tips.push({ text: t, source: "static" });
  return tips.length ? tips : [{ text: "¡Hola! Soy Lucas, tu compañero en LuCare.", source: "static" }];
}