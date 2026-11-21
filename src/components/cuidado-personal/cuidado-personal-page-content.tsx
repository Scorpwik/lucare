import { CuidadoPersonalPanel } from "@/components/cuidado-personal/cuidado-personal-panel";
import { SunscreenPanel } from "@/components/cuidado-personal/sunscreen-panel";
import {
  fetchPersonalCareRoutines,
  fetchPersonalCareSteps,
} from "@/lib/data/personal-care";

export async function CuidadoPersonalPageContent() {
  const [routines, steps] = await Promise.all([
    fetchPersonalCareRoutines(),
    fetchPersonalCareSteps(),
  ]);

  return (
    <div className="grid gap-4">
      <SunscreenPanel />
      <CuidadoPersonalPanel routines={routines} steps={steps} />
    </div>
  );
}