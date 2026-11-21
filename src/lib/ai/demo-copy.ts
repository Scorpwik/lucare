import type { WellnessSnapshot } from "@/lib/ai/snapshot";

export function demoDailyInsight(snapshot: WellnessSnapshot): string {
  const sleep = snapshot.sleep[0];
  const steps = snapshot.steps[0];
  const habitsDone = snapshot.habits.filter((h) => h.completedToday).length;
  const habitTotal = snapshot.habits.length;
  const mood = snapshot.mood.find((m) => m.date === snapshot.today);
  const gymRecent = snapshot.gym[0];

  const parts: string[] = [];
  if (sleep?.hours != null) {
    parts.push(
      `Anoche registraste ${sleep.hours} h de sueño${sleep.quality != null ? ` (calidad ${sleep.quality})` : ""}.`,
    );
  } else {
    parts.push("Aún no hay sueño registrado para la noche más reciente.");
  }

  if (habitTotal > 0) {
    parts.push(
      `Hoy llevas ${habitsDone}/${habitTotal} hábitos marcados; las rachas te están sosteniendo el ritmo.`,
    );
  }

  if (steps) {
    parts.push(`Tus pasos más recientes: ${steps.steps.toLocaleString("es-EC")} (${steps.date}).`);
  }

  if (mood) {
    parts.push(`Ánimo de hoy: ${mood.mood}/5${mood.stress != null ? `, estrés ${mood.stress}/5` : ""}.`);
  }

  if (gymRecent && !gymRecent.endedAt) {
    parts.push("Tienes una sesión de gym abierta: ciérrala cuando termines para ver el progreso.");
  } else if (gymRecent?.endedAt) {
    parts.push("Buen trabajo con el entrenamiento reciente; prioriza hidratación y estiramiento suave.");
  }

  parts.push(
    "Modo demo: configura Gemini (GOOGLE_GENERATIVE_AI_API_KEY) o una clave de IA en el servidor para insights personalizados en vivo.",
  );

  return parts.join(" ");
}

export function demoChatReply(question: string, snapshot: WellnessSnapshot): string {
  const q = question.toLowerCase();
  if (q.includes("sueño") || q.includes("dorm")) {
    const s = snapshot.sleep[0];
    if (s?.hours != null) {
      return `Según tus registros, la noche más reciente (${s.date}) fue de ${s.hours} h. Si quieres mejorar el descanso, intenta una rutina de apagado 30 min antes de acostarte. (Demo — no es consejo médico.)`;
    }
    return "No veo sueño reciente en tu historial. Puedes registrarlo en Sueño y hábitos. (Demo)";
  }
  if (q.includes("paso") || q.includes("camin")) {
    const st = snapshot.steps[0];
    if (st) {
      return `Último registro de pasos: ${st.steps.toLocaleString("es-EC")} el ${st.date}. Importa datos de Samsung/Health Connect en Ajustes para más detalle. (Demo)`;
    }
    return "Aún no hay pasos importados. En Ajustes puedes subir un CSV/ZIP de Samsung Health o Health Connect. (Demo)";
  }
  if (q.includes("hábito") || q.includes("habito")) {
    const done = snapshot.habits.filter((h) => h.completedToday);
  return `Hoy completaste ${done.length} hábitos activos. ${done.map((h) => h.title).join(", ") || "Ninguno aún — un pequeño paso cuenta."} (Demo)`;
  }
  return `Puedo ayudarte a leer tus datos de LuCare (sueño, hábitos, gym, cuerpo, ánimo, agenda). Pregunta algo concreto, por ejemplo "¿cómo dormí?" Modo demo activo.`;
}