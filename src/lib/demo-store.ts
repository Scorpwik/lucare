import type {
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

const DEFAULT_WIDGET_KEYS: WidgetKey[] = [
  "saludo",
  "bloqueador",
  "rutina_am",
  "pastillas",
  "citas",
  "agenda",
  "tareas",
  "gimnasio",
  "cuerpo_resumen",
  "sueno",
  "habitos_racha",
  "animo",
  "cuidado_personal",
];

function seedWidgets(): DashboardWidget[] {
  const t = nowIso();
  return DEFAULT_WIDGET_KEYS.map((widget_key, sort_order) => ({
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
  const rid = uid();
  const routines: SkincareRoutine[] = [
    {
      id: rid,
      user_id: DEMO_USER_ID,
      name: "Rutina AM",
      period: "am",
      sort_order: 0,
      reminder_enabled: true,
      reminder_start_time: "07:00",
      reminder_end_time: "09:00",
      reminder_interval_minutes: 30,
      created_at: t,
      updated_at: t,
    },
  ];
  const steps: SkincareStep[] = [
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      routine_id: rid,
      title: "Limpiador suave",
      product_name: "CeraVe",
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
      routine_id: rid,
      title: "Protector solar",
      product_name: "ISDIN",
      scheduled_time: "08:00",
      sort_order: 1,
      reminder_enabled: false,
      reminder_start_time: null,
      reminder_end_time: null,
      reminder_interval_minutes: null,
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
      name: "Vitamina D",
      dosage: "2000 UI",
      notes: null,
      reminder_enabled: true,
      reminder_start_time: "08:00",
      reminder_end_time: "22:00",
      reminder_interval_minutes: 720,
      reminder_times: ["08:00", "20:00"],
      is_active: true,
      created_at: t,
      updated_at: t,
    },
  ];
}

function seedAppointments(): MedicalAppointment[] {
  const t = nowIso();
  const next = new Date();
  next.setDate(next.getDate() + 3);
  next.setHours(10, 0, 0, 0);
  return [
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      title: "Control dermatológico",
      provider: "Dra. Méndez",
      location: "Centro médico",
      starts_at: next.toISOString(),
      ends_at: null,
      notes: null,
      reminder_enabled: true,
      reminder_minutes_before: 60,
      created_at: t,
      updated_at: t,
    },
  ];
}

function seedTasks(): Task[] {
  const t = nowIso();
  const due = new Date();
  due.setHours(18, 0, 0, 0);
  return [
    {
      id: uid(),
      user_id: DEMO_USER_ID,
      title: "Revisar agenda semanal",
      due_at: due.toISOString(),
      completed: false,
      module_source: "manual",
      created_at: t,
      updated_at: t,
    },
  ];
}

function seedEvents(): ExternalCalendarEvent[] {
  const t = nowIso();
  const items: ExternalCalendarEvent[] = [];
  const base = new Date();
  base.setMinutes(0, 0, 0);

  const gym = new Date(base);
  gym.setHours(17, 0, 0, 0);
  items.push({
    id: uid(),
    user_id: DEMO_USER_ID,
    provider: "google_calendar",
    external_id: "demo-gym",
    title: "Gimnasio · pecho",
    starts_at: gym.toISOString(),
    ends_at: new Date(gym.getTime() + 90 * 60_000).toISOString(),
    source_label: "Google",
    synced_at: t,
  });

  const study = new Date(base);
  study.setHours(20, 0, 0, 0);
  items.push({
    id: uid(),
    user_id: DEMO_USER_ID,
    provider: "notion_deberes",
    external_id: "demo-hw",
    title: "Entregar informe de cálculo",
    starts_at: study.toISOString(),
    ends_at: null,
    source_label: "Notion",
    synced_at: t,
  });

  const meet = new Date(base);
  meet.setDate(meet.getDate() + 1);
  meet.setHours(9, 30, 0, 0);
  items.push({
    id: uid(),
    user_id: DEMO_USER_ID,
    provider: "google_calendar",
    external_id: "demo-meet",
    title: "Reunión proyecto LuCare",
    starts_at: meet.toISOString(),
    ends_at: new Date(meet.getTime() + 45 * 60_000).toISOString(),
    source_label: "Google",
    synced_at: t,
  });

  return items.sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  );
}

function seedGym(): {
  templates: WorkoutTemplate[];
  exercises: WorkoutExercise[];
  sessions: WorkoutSession[];
  sets: WorkoutSet[];
} {
  const t = nowIso();
  const templateId = uid();
  const templates: WorkoutTemplate[] = [
    {
      id: templateId,
      user_id: DEMO_USER_ID,
      name: "Pecho y tríceps",
      weekday: new Date().getDay(),
      notes: "Máquinas sala principal",
      sort_order: 0,
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
  ];
  const sessionId = uid();
  const started = new Date();
  started.setHours(started.getHours() - 1);
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
  ];
  return { templates, exercises, sessions, sets };
}

function seedBody(): { metrics: BodyMetric[]; photos: ProgressPhoto[] } {
  const t = nowIso();
  const d = new Date().toISOString().slice(0, 10);
  return {
    metrics: [
      {
        id: uid(),
        user_id: DEMO_USER_ID,
        recorded_at: d,
        weight_kg: 78.4,
        waist_cm: 84,
        chest_cm: 102,
        hips_cm: 96,
        notes: null,
        created_at: t,
        updated_at: t,
      },
    ],
    photos: [],
  };
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
    widgets: seedWidgets(),
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

let serverState: DemoState | null = null;

export function getServerDemoState(): DemoState {
  if (!serverState) serverState = createDefaultDemoState();
  return serverState;
}

export function getDemoState(): DemoState {
  if (typeof window === "undefined") return getServerDemoState();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as DemoState;
    } catch {
      /* regenerar */
    }
  }
  const fresh = createDefaultDemoState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

export function setDemoState(updater: (prev: DemoState) => DemoState): void {
  const next = updater(getDemoState());
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } else {
    serverState = next;
  }
}