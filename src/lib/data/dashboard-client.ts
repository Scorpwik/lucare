"use client";

import { getDemoState, setDemoState } from "@/lib/demo-store";
import { isDemoModeClient } from "@/lib/env";
import type { DashboardWidget, WidgetKey } from "@/lib/types";
import { friendlyError } from "@/lib/feedback";
import { toast } from "sonner";

export function clientGetWidgets(): DashboardWidget[] {
  return getDemoState().widgets.sort((a, b) => a.sort_order - b.sort_order);
}

export async function clientFetchWidgets(): Promise<DashboardWidget[]> {
  if (isDemoModeClient()) {
    return clientGetWidgets();
  }
  const res = await fetch("/api/dashboard/widgets");
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "No se pudieron cargar los widgets");
  }
  const data = (await res.json()) as { widgets: DashboardWidget[] };
  return data.widgets ?? [];
}

export async function clientToggleWidget(key: WidgetKey, visible: boolean): Promise<void> {
  if (isDemoModeClient()) {
    setDemoState((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) =>
        w.widget_key === key
          ? { ...w, visible, updated_at: new Date().toISOString() }
          : w,
      ),
    }));
    return;
  }
  const res = await fetch("/api/dashboard/widgets", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visibility: { key, visible } }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    toast.error(friendlyError(data?.error, "No se pudo actualizar el widget"));
    throw new Error(data?.error ?? "patch visibility");
  }
}

export async function clientReorderWidgets(orderedKeys: WidgetKey[]): Promise<void> {
  if (isDemoModeClient()) {
    setDemoState((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) => {
        const order = orderedKeys.indexOf(w.widget_key);
        return {
          ...w,
          sort_order: order >= 0 ? order : w.sort_order,
          updated_at: new Date().toISOString(),
        };
      }),
    }));
    return;
  }
  const res = await fetch("/api/dashboard/widgets", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reorder: orderedKeys }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    toast.error(friendlyError(data?.error, "No se pudo reordenar"));
    throw new Error(data?.error ?? "patch reorder");
  }
}
