import { TIMEZONE } from "@/lib/env";

export function spanishMorningGreeting(date = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat("es-EC", {
      timeZone: TIMEZONE,
      hour: "numeric",
      hour12: false,
    }).format(date),
  );

  let saludo: string;
  if (hour < 12) saludo = "Buenos días";
  else if (hour < 19) saludo = "Buenas tardes";
  else saludo = "Buenas noches";

  const fecha = new Intl.DateTimeFormat("es-EC", {
    timeZone: TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  const capitalized = fecha.charAt(0).toUpperCase() + fecha.slice(1);
  return `${saludo}. Hoy es ${capitalized}`;
}

export function formatTimeEc(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-EC", {
    timeZone: TIMEZONE,
    ...options,
  }).format(d);
}