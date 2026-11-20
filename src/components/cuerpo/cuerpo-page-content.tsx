import { CuerpoPanel } from "@/components/cuerpo/cuerpo-panel";
import { fetchBodyMetrics, fetchProgressPhotos } from "@/lib/data/body";

export async function CuerpoPageContent() {
  const [metrics, photos] = await Promise.all([
    fetchBodyMetrics(),
    fetchProgressPhotos(),
  ]);

  return <CuerpoPanel initialMetrics={metrics} initialPhotos={photos} />;
}