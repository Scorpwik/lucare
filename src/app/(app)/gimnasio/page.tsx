import { GimnasioTabs } from "@/components/gimnasio/gimnasio-tabs";
import {
  fetchAllRecentSets,
  fetchWorkoutExercises,
  fetchWorkoutSessions,
  fetchWorkoutTemplates,
} from "@/lib/data/gym";

export const metadata = { title: "Gimnasio" };

export default async function GimnasioPage() {
  const [templates, exercises, sessions, sets] = await Promise.all([
    fetchWorkoutTemplates(),
    fetchWorkoutExercises(),
    fetchWorkoutSessions(),
    fetchAllRecentSets(),
  ]);

  return (
    <div>
      <header className="mb-4">
        <p className="silk">módulo · gimnasio</p>
        <h1 className="font-dot font-black text-4xl">Gimnasio</h1>
      </header>
      <GimnasioTabs
        templates={templates}
        exercises={exercises}
        sessions={sessions}
        sets={sets}
      />
    </div>
  );
}
