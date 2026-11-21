import type {
  BodyGoal,
  BodyMetric,
  DashboardWidget,
  ExternalCalendarEvent,
  Habit,
  HabitLog,
  JournalEntry,
  MedicalAppointment,
  Medication,
  MoodLog,
  PersonalCareRoutine,
  PersonalCareStep,
  ProgressPhoto,
  SkincareRoutine,
  SkincareStep,
  SleepLog,
  Task,
  WidgetKey,
  WorkoutExercise,
  WorkoutSession,
  WorkoutSet,
  WorkoutTemplate,
} from "@/lib/types";

const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";
const STORAGE_KEY = "lucare-demo-v2";

export interface DemoState {
  userId: string;
  displayName: string;
  widgets: DashboardWidget[];
  routines: SkincareRoutine[];
  steps: SkincareStep[];
  medications: Medication[];
  appointments: MedicalAppointment[];
  tasks: Task[];
  externalEvents: ExternalCalendarEvent[];
  workoutTemplates: WorkoutTemplate[];
  workoutExercises: WorkoutExercise[];
  workoutSessions: WorkoutSession[];
  workoutSets: WorkoutSet[];
  bodyMetrics: BodyMetric[];
  bodyGoal: BodyGoal | null;
  progressPhotos: ProgressPhoto[];
  sleepLogs: SleepLog[];
  habits: Habit[];
  habitLogs: HabitLog[];
  moodLogs: MoodLog[];
  journalEntries: JournalEntry[];
  personalCareRoutines: PersonalCareRoutine[];
  personalCareSteps: PersonalCareStep[];
  activeWorkoutSessionId: string | null;
}

function uid(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

function defaultWidgets(): DashboardWidget[] {
  const keys: WidgetKey[] = [
    "saludo",
    "bloqueador",
    "rutina_am",
    "pastillas",
    "citas",
    "gimnasio",
    "cuerpo_resumen",
    "sueno",
    "habitos_racha",
    "animo",
    "cuidado_personal",
    "agenda",
    "tareas",
  ];
  const t = nowIso();
  return keys.map((widget_key, sort_order) => ({
    id: uid(),
    user_id: DEMO_USER_ID,
    widget_key,
    visible: true,
    sort_order,
    created_at: t,
    updated_at: t,
  }));
}

function seedSkincare(): { routines: SkincareRoutine[]; steps: SkincareStep[] } {
  const t = nowIso();
  const amId = uid();
  const pmId = uid();
  const routines: SkincareRoutine[] = [
    {
      id: amId,
      user_id: DEMO_USER_ID,
      name: "Rutina mañana",
      period: "am",
      sort_order: 0,
      reminder_enabled: true,
      reminder_start_time: "07:00",
      reminder_end_time: "09:00",
      reminder_interval_minutes: 30,
      created_at: t,
      updated_at: t,
    },
    {
      id: pmId,
      user_id: DEMO_USER_ID,
      name: "Rutina noche",
      period: "pm",
      sort_order: 1,
      reminder_enabled: true,
      reminder_start_time: "20:00",
      reminder_end_time: "22:00",
      reminder_interval_minutes: 60,
      created_at: t,
      updated_at: t,
    },
  ];
  const steps: SkincareStep[] = [
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      routine_id: amId,
      title: "Limpiador",
      product_name: "CeraVe gel",
      scheduled_time: "07:30",
      sort_order: 0,
      reminder_enabled: false,
      reminder_start_time: null,
      reminder_end_time: null,
      reminder_interval_minutes: null,
      created_at: t,
      updated_at: t,
    },
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      routine_id: amId,
      title: "Protector solar SPF 50",
      product_name: "Eucerin",
      scheduled_time: "07:45",
      sort_order: 1,
      reminder_enabled: true,
      reminder_start_time: "07:00",
      reminder_end_time: "10:00",
      reminder_interval_minutes: 120,
      created_at: t,
      updated_at: t,
    },
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      routine_id: pmId,
      title: "Retinol",
      product_name: "La Roche-Posay",
      scheduled_time: "21:00",
      sort_order: 0,
      reminder_enabled: true,
      reminder_start_time: "20:00",
      reminder_end_time: "22:00",
      reminder_interval_minutes: 60,
      created_at: t,
      updated_at: t,
    },
  ];
  return { routines, steps };
}

function seedMedications(): Medication[] {
  const t = nowIso();
  return [
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      name: "Omeprazol",
      dosage: "20 mg",
      notes: "Antes del desayuno",
      reminder_enabled: true,
      reminder_start_time: "07:00",
      reminder_end_time: "08:00",
      reminder_interval_minutes: 30,
      reminder_times: ["07:30"],
      is_active: true,
      created_at: t,
      updated_at: t,
    },
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      name: "Vitamina D",
      dosage: "1000 UI",
      notes: null,
      reminder_enabled: true,
      reminder_start_time: "12:00",
      reminder_end_time: "14:00",
      reminder_interval_minutes: 60,
      reminder_times: ["13:00"],
      is_active: true,
      created_at: t,
      updated_at: t,
    },
  ];
}

function seedAppointments(): MedicalAppointment[] {
  const t = nowIso();
  const inDays = (n: number, hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };
  return [
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      title: "Dermatología — control",
      provider: "Dra. Mendoza",
      location: "Hospital del Río",
      starts_at: inDays(3, 10),
      ends_at: inDays(3, 11),
      notes: "Llevar historial",
      reminder_enabled: true,
      reminder_minutes_before: 60,
      created_at: t,
      updated_at: t,
    },
  ];
}

function seedTasks(): Task[] {
  const t = nowIso();
  return [
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      title: "Renovar receta de Omeprazol",
      due_at: null,
      completed: false,
      module_source: "medications",
      created_at: t,
      updated_at: t,
    },
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      title: "Comprar repuesto de SPF",
      due_at: null,
      completed: false,
      module_source: "skincare",
      created_at: t,
      updated_at: t,
    },
  ];
}

function seedEvents(): ExternalCalendarEvent[] {
  const t = nowIso();
  const start = new Date();
  start.setHours(15, 30, 0, 0);
  const end = new Date();
  end.setHours(16, 30, 0, 0);
  return [
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      provider: "google_calendar",
      external_id: "demo-gcal-1",
      title: "Reunión equipo salud",
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      source_label: "Google",
      raw: {},
      synced_at: t,
    },
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      provider: "notion_deberes",
      external_id: "demo-notion-1",
      title: "Entregar informe mensual",
      starts_at: new Date(Date.now() + 86_400_000).toISOString(),
      ends_at: null,
      source_label: "Notion",
      raw: {},
      synced_at: t,
    },
  ];
}

function seedGym(): {
  templates: WorkoutTemplate[];
  exercises: WorkoutExercise[];
  sessions: WorkoutSession[];
  sets: WorkoutSet[];
} {
  const t = nowIso();
  const templateId = uid();
  const templateLegsId = uid();
  const today = new Date().getDay();
  const templates: WorkoutTemplate[] = [
    {
      id: templateId,
      user_id: DEMO_USER_ID,
      name: "Pecho y tríceps",
      weekday: today,
      notes: "Máquinas sala principal",
      sort_order: 0,
      created_at: t,
      updated_at: t,
    },
    {
      id: templateLegsId,
      user_id: DEMO_USER_ID,
      name: "Piernas",
      weekday: (today + 2) % 7,
      notes: "Prensa y extensiones",
      sort_order: 1,
      created_at: t,
      updated_at: t,
    },
  ];
  const ex1 = uid();
  const ex2 = uid();
  const exercises: WorkoutExercise[] = [
    {
      id: ex1,
      user_id: DEMO_USER_ID,
      template_id: templateId,
      name: "Press inclinado",
      machine: "Hammer Strength",
      default_rest_seconds: 90,
      sort_order: 0,
      created_at: t,
      updated_at: t,
    },
    {
      id: ex2,
      user_id: DEMO_USER_ID,
      template_id: templateId,
      name: "Fondos en paralelas",
      machine: null,
      default_rest_seconds: 75,
      sort_order: 1,
      created_at: t,
      updated_at: t,
    },
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      template_id: templateLegsId,
      name: "Prensa inclinada",
      machine: "Life Fitness",
      default_rest_seconds: 120,
      sort_order: 0,
      created_at: t,
      updated_at: t,
    },
  ];
  const sessionId = uid();
  const started = new Date();
  started.setHours(started.getHours() - 1);
  const pastSessionId = uid();
  const pastStart = new Date();
  pastStart.setDate(pastStart.getDate() - 3);
  pastStart.setHours(18, 0, 0, 0);
  const pastEnd = new Date(pastStart);
  pastEnd.setHours(19, 15, 0, 0);
  const sessions: WorkoutSession[] = [
    {
      id: sessionId,
      user_id: DEMO_USER_ID,
      template_id: templateId,
      started_at: started.toISOString(),
      ended_at: null,
      notes: null,
      created_at: t,
      updated_at: t,
    },
    {
      id: pastSessionId,
      user_id: DEMO_USER_ID,
      template_id: templateId,
      started_at: pastStart.toISOString(),
      ended_at: pastEnd.toISOString(),
      notes: "Buena energía",
      created_at: pastStart.toISOString(),
      updated_at: pastEnd.toISOString(),
    },
  ];
  const sets: WorkoutSet[] = [
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      session_id: sessionId,
      exercise_id: ex1,
      set_number: 1,
      reps: 10,
      weight_kg: 40,
      rest_seconds: 90,
      completed_at: t,
      created_at: t,
    },
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      session_id: sessionId,
      exercise_id: ex1,
      set_number: 2,
      reps: 8,
      weight_kg: 42.5,
      rest_seconds: 90,
      completed_at: t,
      created_at: t,
    },
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      session_id: pastSessionId,
      exercise_id: ex1,
      set_number: 1,
      reps: 12,
      weight_kg: 38,
      rest_seconds: 90,
      completed_at: pastStart.toISOString(),
      created_at: pastStart.toISOString(),
    },
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      session_id: pastSessionId,
      exercise_id: ex2,
      set_number: 1,
      reps: 10,
      weight_kg: null,
      rest_seconds: 75,
      completed_at: pastStart.toISOString(),
      created_at: pastStart.toISOString(),
    },
  ];
  return { templates, exercises, sessions, sets };
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function seedBody(): {
  metrics: BodyMetric[];
  goal: BodyGoal;
  photos: ProgressPhoto[];
} {
  const t = nowIso();
  const metrics: BodyMetric[] = [
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      recorded_at: daysAgoIso(21),
      weight_kg: 79.8,
      waist_cm: 86,
      chest_cm: 101,
      hips_cm: 97,
      body_fat_pct: 19.2,
      muscle_mass_kg: 36.5,
      arm_cm: 34,
      thigh_cm: 58,
      notes: null,
      created_at: t,
      updated_at: t,
    },
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      recorded_at: daysAgoIso(14),
      weight_kg: 79.1,
      waist_cm: 85,
      chest_cm: 101.5,
      hips_cm: 96.5,
      body_fat_pct: 18.8,
      muscle_mass_kg: 36.8,
      arm_cm: 34.2,
      thigh_cm: 57.5,
      notes: null,
      created_at: t,
      updated_at: t,
    },
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      recorded_at: daysAgoIso(7),
      weight_kg: 78.9,
      waist_cm: 84.5,
      chest_cm: 102,
      hips_cm: 96,
      body_fat_pct: 18.5,
      muscle_mass_kg: 37,
      arm_cm: 34.5,
      thigh_cm: 57,
      notes: null,
      created_at: t,
      updated_at: t,
    },
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      recorded_at: new Date().toISOString().slice(0, 10),
      weight_kg: 78.4,
      waist_cm: 84,
      chest_cm: 102,
      hips_cm: 96,
      body_fat_pct: 18.1,
      muscle_mass_kg: 37.2,
      arm_cm: 34.5,
      thigh_cm: 56.8,
      notes: null,
      created_at: t,
      updated_at: t,
    },
  ];
  const goal: BodyGoal = {
    id: uid(),
    user_id: DEMO_USER_ID,
    target_weight_kg: 75,
    target_waist_cm: 80,
    target_body_fat_pct: 16,
    reminder_time: "07:30",
    reminder_enabled: true,
    notes: null,
    created_at: t,
    updated_at: t,
  };
  return { metrics, goal, photos: [] };
}

function seedSleepHabits(): {
  sleep: SleepLog[];
  habits: Habit[];
  logs: HabitLog[];
} {
  const t = nowIso();
  const today = new Date().toISOString().slice(0, 10);
  const h1 = uid();
  const h2 = uid();
  const habits: Habit[] = [
    {
      id: h1,
      user_id: DEMO_USER_ID,
      title: "Agua 2 L",
      icon: "💧",
      sort_order: 0,
      is_active: true,
      created_at: t,
      updated_at: t,
    },
    {
      id: h2,
      user_id: DEMO_USER_ID,
      title: "Lectura 15 min",
      icon: "📖",
      sort_order: 1,
      is_active: true,
      created_at: t,
      updated_at: t,
    },
  ];
  const streakDates = [0, 1, 2].map((n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  });
  const logs: HabitLog[] = streakDates.flatMap((log_date) =>
    habits.map((h) => ({
      id: uid(),
      user_id: DEMO_USER_ID,
      habit_id: h.id,
      log_date,
      completed: true,
      created_at: t,
    })),
  );
  return {
    sleep: [
      {
        id: uid(),
        user_id: DEMO_USER_ID,
        sleep_date: today,
        bedtime: "22:30",
        wake_time: "06:15",
        hours_slept: 7.25,
        quality_score: 78,
        notes: null,
        created_at: t,
        updated_at: t,
      },
    ],
    habits,
    logs,
  };
}

function seedMind(): { moods: MoodLog[]; journal: JournalEntry[] } {
  const t = nowIso();
  const today = new Date().toISOString().slice(0, 10);
  return {
    moods: [
      {
        id: uid(),
        user_id: DEMO_USER_ID,
        log_date: today,
        mood: 4,
        stress: 2,
        note: "Buen día de trabajo",
        created_at: t,
      },
    ],
    journal: [
      {
        id: uid(),
        user_id: DEMO_USER_ID,
        body: "Hoy me enfoqué en rutinas y descanso. Mañana gimnasio temprano.",
        created_at: t,
        updated_at: t,
      },
    ],
  };
}

function seedPersonalCare(): {
  routines: PersonalCareRoutine[];
  steps: PersonalCareStep[];
} {
  const t = nowIso();
  const rid = uid();
  return {
    routines: [
      {
        id: rid,
        user_id: DEMO_USER_ID,
        name: "Aseo nocturno",
        category: "higiene",
        sort_order: 0,
        reminder_enabled: true,
        reminder_start_time: "21:00",
        reminder_end_time: "22:30",
        reminder_interval_minutes: 45,
        created_at: t,
        updated_at: t,
      },
    ],
    steps: [
      {
        id: uid(),
        user_id: DEMO_USER_ID,
        routine_id: rid,
        title: "Cepillado + hilo dental",
        sort_order: 0,
        created_at: t,
        updated_at: t,
      },
      {
        id: uid(),
        user_id: DEMO_USER_ID,
        routine_id: rid,
        title: "Hidratación manos",
        sort_order: 1,
        created_at: t,
        updated_at: t,
      },
    ],
  };
}

export function createDefaultDemoState(): DemoState {
  const { routines, steps } = seedSkincare();
  const gym = seedGym();
  const body = seedBody();
  const sleepHabits = seedSleepHabits();
  const mind = seedMind();
  const personal = seedPersonalCare();
  return {
    userId: DEMO_USER_ID,
    displayName: "Joshua",
    widgets: defaultWidgets(),
    routines,
    steps,
    medications: seedMedications(),
    appointments: seedAppointments(),
    tasks: seedTasks(),
    externalEvents: seedEvents(),
    workoutTemplates: gym.templates,
    workoutExercises: gym.exercises,
    workoutSessions: gym.sessions,
    workoutSets: gym.sets,
    bodyMetrics: body.metrics,
    bodyGoal: body.goal,
    progressPhotos: body.photos,
    sleepLogs: sleepHabits.sleep,
    habits: sleepHabits.habits,
    habitLogs: sleepHabits.logs,
    moodLogs: mind.moods,
    journalEntries: mind.journal,
    personalCareRoutines: personal.routines,
    personalCareSteps: personal.steps,
    activeWorkoutSessionId: gym.sessions[0]?.id ?? null,
  };
}

let memoryState: DemoState | null = null;

function loadFromStorage(): DemoState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoState;
  } catch {
    return null;
  }
}

function saveToStorage(state: DemoState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* cuota llena */
  }
}

export function getDemoState(): DemoState {
  if (typeof window !== "undefined") {
    const stored = loadFromStorage();
    if (stored) {
      memoryState = stored;
      return stored;
    }
  }
  if (!memoryState) {
    memoryState = createDefaultDemoState();
    saveToStorage(memoryState);
  }
  return memoryState;
}

export function setDemoState(updater: (prev: DemoState) => DemoState): DemoState {
  const next = updater(getDemoState());
  memoryState = next;
  saveToStorage(next);
  return next;
}

export function resetDemoState(): DemoState {
  memoryState = createDefaultDemoState();
  saveToStorage(memoryState);
  return memoryState;
}

/** Versión servidor — sin localStorage */
let serverDemoState: DemoState = createDefaultDemoState();

export function getServerDemoState(): DemoState {
  return serverDemoState;
}

export function setServerDemoState(state: DemoState): void {
  serverDemoState = state;
}

export const DEMO_USER = DEMO_USER_ID;