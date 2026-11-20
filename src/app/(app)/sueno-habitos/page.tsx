import { Suspense } from "react";
import { SuenoHabitosPanel } from "@/components/sueno-habitos/sueno-habitos-panel";
import { LoadingState } from "@/components/lucare/loading-state";
import { fetchHabits, fetchSleepLogs } from "@/lib/data/sleep-habits";

export const metadata = { title: "Sueño y hábitos" };

export default async function SuenoHabitosPage() {
  const [sleep, habits] = await Promise.all([fetchSleepLogs(), fetchHabits()]);

  return (
    <div>
      <header className="mb-4">
        <p className="silk">módulo · sueño y hábitos</p>
        <h1 className="font-dot font-black text-4xl">Sueño y hábitos</h1>
      </header>
      <Suspense fallback={<LoadingState />}>
        <SuenoHabitosPanel initialSleep={sleep} initialHabits={habits} />
      </Suspense>
    </div>
  );
}
