import { fetchUserDisplayName } from "@/lib/data/profile";
import { SaludoWidgetView } from "./saludo-widget-view";

export async function SaludoWidget() {
  const displayName = await fetchUserDisplayName();
  return <SaludoWidgetView displayName={displayName} />;
}