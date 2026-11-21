import { SuenoHabitosPanel } from "@/components/sueno-habitos/sueno-habitos-panel";
import { fetchHabitLogs, fetchHabits, fetchSleepLogs } from "@/lib/data/sleep-habits";

export async function SuenoHabitosPageContent() {
  const [sleep, habits, habitLogs] = await Promise.all([
    fetchSleepLogs(),
    fetchHabits(),
    fetchHabitLogs(),
  ]);

  return (
    <SuenoHabitosPanel
      initialSleep={sleep}
      initialHabits={habits}
      initialHabitLogs={habitLogs}
    />
  );
}