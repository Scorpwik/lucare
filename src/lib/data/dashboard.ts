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

export async function addDashboardWidget(widgetKey: WidgetKey): Promise<void> {
  if (isDemoMode()) {
    const state = getServerDemoState();
    const exists = state.widgets.some((w) => w.widget_key === widgetKey);
    if (exists) {
      state.widgets = state.widgets.map((w) =>
        w.widget_key === widgetKey
          ? { ...w, visible: true, updated_at: new Date().toISOString() }
          : w,
      );
    } else {
      const maxOrder = state.widgets.reduce((m, w) => Math.max(m, w.sort_order), -1);
      state.widgets.push({
        id: crypto.randomUUID(),
        user_id: state.userId,
        widget_key: widgetKey,
        visible: true,
        sort_order: maxOrder + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: rows } = await supabase
    .from("dashboard_widgets")
    .select("sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = (rows?.[0]?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("dashboard_widgets").upsert(
    {
      user_id: user.id,
      widget_key: widgetKey,
      visible: true,
      sort_order: nextOrder,
    },
    { onConflict: "user_id,widget_key" },
  );
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
