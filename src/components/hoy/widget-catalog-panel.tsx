"use client";

import type { DashboardWidget, WidgetKey } from "@/lib/types";
import { ALL_WIDGET_KEYS, catalogEntry } from "@/lib/widget-catalog";
import { clientAddWidget } from "@/lib/data/dashboard-client";
import { LcButton } from "@/components/lucare/lc-button";
import { Plus } from "lucide-react";

type Props = {
  widgets: DashboardWidget[];
  onAdded: () => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
};

export function WidgetCatalogPanel({ widgets, onAdded, saving, setSaving }: Props) {
  const registered = new Set(widgets.map((w) => w.widget_key));
  const missing = ALL_WIDGET_KEYS.filter((k) => !registered.has(k));
  const hidden = widgets.filter((w) => !w.visible);

  const add = (key: WidgetKey) => {
    setSaving(true);
    void clientAddWidget(key)
      .then(onAdded)
      .finally(() => setSaving(false));
  };

  return (
    <div className="border border-dashed border-border rounded-[var(--r)] p-4 space-y-4" aria-busy={saving}>
      <div>
        <p className="silk text-xs mb-2">catálogo de widgets</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {ALL_WIDGET_KEYS.map((key) => {
            const meta = catalogEntry(key);
            if (!meta) return null;
            const Icon = meta.icon;
            const row = widgets.find((w) => w.widget_key === key);
            const isVisible = row?.visible ?? false;
            return (
              <article
                key={key}
                className="flex gap-2 items-start border border-border rounded-[var(--pill)] px-3 py-2 bg-surface/60 text-sm"
              >
                <Icon className="size-4 shrink-0 mt-0.5 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-tight">{meta.name}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{meta.description}</p>
                  {!row ? (
                    <LcButton
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 mt-1 px-2 text-xs"
                      onClick={() => add(key)}
                    >
                      <Plus className="size-3.5 mr-1" />
                      Añadir
                    </LcButton>
                  ) : isVisible ? (
                    <p className="text-[10px] font-mono text-muted-foreground mt-1">en el panel</p>
                  ) : (
                    <LcButton
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 mt-1 px-2 text-xs"
                      onClick={() => add(key)}
                    >
                      Mostrar
                    </LcButton>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {(missing.length > 0 || hidden.length > 0) && (
        <p className="text-xs text-muted-foreground">
          {missing.length > 0
            ? `${missing.length} widget(s) aún no están en tu cuenta — usa Añadir. `
            : ""}
          {hidden.length > 0 ? `${hidden.length} oculto(s) — restáuralos desde Mostrar o el icono en cada tarjeta.` : ""}
        </p>
      )}
    </div>
  );
}