import { CuidadoTabs } from "@/components/cuidado/cuidado-tabs";
import {
  fetchAppointments,
  fetchMedications,
} from "@/lib/data/medications";
import { fetchSkincareRoutines, fetchSkincareSteps } from "@/lib/data/skincare";

export async function CuidadoPageContent() {
  const [routines, steps, medications, appointments] = await Promise.all([
    fetchSkincareRoutines(),
    fetchSkincareSteps(),
    fetchMedications(),
    fetchAppointments(),
  ]);

  return (
    <CuidadoTabs
      routines={routines}
      steps={steps}
      medications={medications}
      appointments={appointments}
    />
  );
}