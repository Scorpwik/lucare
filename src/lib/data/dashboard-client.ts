"use client";

import { getDemoState, setDemoState } from "@/lib/demo-store";
import { isDemoModeClient } from "@/lib/env";
import type { DashboardWidget, WidgetKey } from "@/lib/types";

export function clientGetWidgets(): DashboardWidget[] {
  return getDemoState().widgets.sort((a, b) => a.sort_order - b.sort_order);
}

export function clientToggleWidget(key: WidgetKey, visible: boolean): void {
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
  void fetch("/api/dashboard/widgets", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visibility: { key, visible } }),
  });
}

export function clientReorderWidgets(orderedKeys: WidgetKey[]): void {
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
  void fetch("/api/dashboard/widgets", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reorder: orderedKeys }),
  });
}