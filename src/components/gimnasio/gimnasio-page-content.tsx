import { GimnasioTabs } from "@/components/gimnasio/gimnasio-tabs";
import {
  fetchAllRecentSets,
  fetchWorkoutExercises,
  fetchWorkoutSessions,
  fetchWorkoutTemplates,
} from "@/lib/data/gym";

export async function GimnasioPageContent() {
  const [templates, exercises, sessions, sets] = await Promise.all([
    fetchWorkoutTemplates(),
    fetchWorkoutExercises(),
    fetchWorkoutSessions(),
    fetchAllRecentSets(),
  ]);

  return (
    <GimnasioTabs
      templates={templates}
      exercises={exercises}
      sessions={sessions}
      sets={sets}
    />
  );
}