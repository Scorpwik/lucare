import { SuenoHabitosPanel } from "@/components/sueno-habitos/sueno-habitos-panel";
import { fetchHabits, fetchSleepLogs } from "@/lib/data/sleep-habits";

export async function SuenoHabitosPageContent() {
  const [sleep, habits] = await Promise.all([fetchSleepLogs(), fetchHabits()]);

  return <SuenoHabitosPanel initialSleep={sleep} initialHabits={habits} />;
}