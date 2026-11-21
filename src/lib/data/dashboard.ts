import { getServerDemoState } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import type { DashboardWidget, WidgetKey } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export async function fetchDashboardWidgets(): Promise<DashboardWidget[]> {
  if (isDemoMode()) {
    return getServerDemoState().widgets.sort(
      (a, b) => a.sort_order - b.sort_order,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("dashboard_widgets")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as DashboardWidget[];
}

export async function updateWidgetVisibility(
  widgetKey: WidgetKey,
  visible: boolean,
): Promise<void> {
  if (isDemoMode()) {
    const state = getServerDemoState();
    state.widgets = state.widgets.map((w) =>
      w.widget_key === widgetKey ? { ...w, visible, updated_at: new Date().toISOString() } : w,
    );
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("dashboard_widgets")
    .update({ visible })
    .eq("user_id", user.id)
    .eq("widget_key", widgetKey);
  if (error) throw error;
}

export async function reorderWidgets(
  orderedKeys: WidgetKey[],
): Promise<void> {
  if (isDemoMode()) {
    const state = getServerDemoState();
    state.widgets = state.widgets.map((w) => {
      const order = orderedKeys.indexOf(w.widget_key);
      return {
        ...w,
        sort_order: order >= 0 ? order : w.sort_order,
        updated_at: new Date().toISOString(),
      };
    });
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const results = await Promise.all(
    orderedKeys.map((key, sort_order) =>
      supabase
        .from("dashboard_widgets")
        .update({ sort_order })
        .eq("user_id", user.id)
        .eq("widget_key", key),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}
