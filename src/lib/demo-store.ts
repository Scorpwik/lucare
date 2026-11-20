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

