import { MentePanel } from "@/components/mente/mente-panel";
import { fetchJournalEntries, fetchMoodLogs } from "@/lib/data/mind";

export const metadata = { title: "Mente" };

export default async function MentePage() {
  const [moods, journal] = await Promise.all([
    fetchMoodLogs(),
    fetchJournalEntries(),
  ]);

  return (
    <div>
      <header className="mb-4">
        <p className="silk">módulo · mente</p>
        <h1 className="font-dot font-black text-4xl">Mente</h1>
      </header>
      <MentePanel initialMoods={moods} initialJournal={journal} />
    </div>
  );
}
