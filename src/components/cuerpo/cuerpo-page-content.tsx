import { CuerpoPanel } from "@/components/cuerpo/cuerpo-panel";
import {
  fetchBodyGoal,
  fetchBodyMetrics,
  fetchProgressPhotos,
} from "@/lib/data/body";

export async function CuerpoPageContent() {
  const [metrics, photos, goal] = await Promise.all([
    fetchBodyMetrics(),
    fetchProgressPhotos(),
    fetchBodyGoal(),
  ]);

  return (
    <CuerpoPanel
      initialMetrics={metrics}
      initialPhotos={photos}
      initialGoal={goal}
    />
  );
}