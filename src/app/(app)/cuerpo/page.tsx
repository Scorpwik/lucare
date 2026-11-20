import { CuerpoPanel } from "@/components/cuerpo/cuerpo-panel";
import { fetchBodyMetrics, fetchProgressPhotos } from "@/lib/data/body";

export const metadata = { title: "Cuerpo" };

export default async function CuerpoPage() {
  const [metrics, photos] = await Promise.all([
    fetchBodyMetrics(),
    fetchProgressPhotos(),
  ]);

  return (
    <div>
      <header className="mb-4">
        <p className="silk">módulo · cuerpo</p>
        <h1 className="font-dot font-black text-4xl">Cuerpo</h1>
      </header>
      <CuerpoPanel initialMetrics={metrics} initialPhotos={photos} />
    </div>
  );
}
