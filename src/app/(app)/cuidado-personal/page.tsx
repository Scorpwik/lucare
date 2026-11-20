import { CuidadoPersonalPanel } from "@/components/cuidado-personal/cuidado-personal-panel";
import {
  fetchPersonalCareRoutines,
  fetchPersonalCareSteps,
} from "@/lib/data/personal-care";

export const metadata = { title: "Cuidado personal" };

export default async function CuidadoPersonalPage() {
  const [routines, steps] = await Promise.all([
    fetchPersonalCareRoutines(),
    fetchPersonalCareSteps(),
  ]);

  return (
    <div>
      <header className="mb-4">
        <p className="silk">módulo · cuidado personal</p>
        <h1 className="font-dot font-black text-4xl">Cuidado personal</h1>
      </header>
      <CuidadoPersonalPanel routines={routines} steps={steps} />
    </div>
  );
}
