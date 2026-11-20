import { CuidadoPersonalPanel } from "@/components/cuidado-personal/cuidado-personal-panel";
import {
  fetchPersonalCareRoutines,
  fetchPersonalCareSteps,
} from "@/lib/data/personal-care";

export async function CuidadoPersonalPageContent() {
  const [routines, steps] = await Promise.all([
    fetchPersonalCareRoutines(),
    fetchPersonalCareSteps(),
  ]);

  return <CuidadoPersonalPanel routines={routines} steps={steps} />;
}