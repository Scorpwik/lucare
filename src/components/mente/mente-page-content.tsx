import { MentePanel } from "@/components/mente/mente-panel";
import { fetchJournalEntries, fetchMoodLogs } from "@/lib/data/mind";

export async function MentePageContent() {
  const [moods, journal] = await Promise.all([
    fetchMoodLogs(),
    fetchJournalEntries(),
  ]);

  return <MentePanel initialMoods={moods} initialJournal={journal} />;
}