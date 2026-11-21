"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DashboardWidget, WidgetKey } from "@/lib/types";
import {
  clientFetchWidgets,
  clientGetWidgets,
  clientReorderWidgets,
  clientToggleWidget,
} from "@/lib/data/dashboard-client";
import { isDemoModeClient } from "@/lib/env";
import { friendlyError } from "@/lib/feedback";
import { EmptyState } from "@/components/lucare/empty-state";
import { ErrorState } from "@/components/lucare/error-state";
import { LoadingState } from "@/components/lucare/loading-state";
import { LcButton } from "@/components/lucare/lc-button";
import { EyeOff, GripVertical, X } from "lucide-react";
import { widgetSpanClasses } from "@/lib/widget-spans";
import { useDndReady } from "@/lib/use-client-time";
import { WidgetTileShell } from "@/components/hoy/widget-tile-shell";
import { WidgetCatalogPanel } from "@/components/hoy/widget-catalog-panel";

type Props = {
  childrenMap: Record<WidgetKey, React.ReactNode>;
  initialWidgets: DashboardWidget[];
  personalize: boolean;
};

function SortableTile({
  id,
  visible,
  onToggle,
  personalize,
  children,
}: {
  id: WidgetKey;
  visible: boolean;
  onToggle: () => void;
  personalize: boolean;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: !personalize });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: visible ? 1 : 0.45,
  };

  const toolbar = (
    <>
      <LcButton
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 bg-surface/90"
        aria-label="Ocultar widget"
        onClick={onToggle}
      >
        {personalize ? <X className="size-3.5" /> : <EyeOff className="size-3.5" />}
      </LcButton>
      <LcButton
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 cursor-grab active:cursor-grabbing bg-surface/90"
        aria-label="Reordenar"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" />
      </LcButton>
    </>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${widgetSpanClasses(id)} ${isDragging ? "z-10" : ""}`}
    >
      <WidgetTileShell widgetKey={id} personalize={personalize} toolbar={toolbar}>
        {children}
      </WidgetTileShell>
    </div>
  );
}

function StaticTile({
  id,
  visible,
  onToggle,
  personalize,
  children,
}: {
  id: WidgetKey;
  visible: boolean;
  onToggle: () => void;
  personalize: boolean;
  children: React.ReactNode;
}) {
  const toolbar = personalize ? (
    <LcButton
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 px-2 bg-surface/90"
      aria-label="Ocultar widget"
      onClick={onToggle}
    >
      <X className="size-3.5" />
    </LcButton>
  ) : null;

  return (
    <div className={widgetSpanClasses(id)} style={{ opacity: visible ? 1 : 0.45 }}>
      <WidgetTileShell widgetKey={id} personalize={personalize} toolbar={toolbar}>
        {children}
      </WidgetTileShell>
    </div>
  );
}

function WidgetGridBody({
  dndReady,
  personalize,
  visibleWidgets,
  orderedKeys,
  childrenMap,
  sensors,
  onDragEnd,
  onToggle,
}: {
  dndReady: boolean;
  personalize: boolean;
  visibleWidgets: DashboardWidget[];
  orderedKeys: WidgetKey[];
  childrenMap: Record<WidgetKey, React.ReactNode>;
  sensors: ReturnType<typeof useSensors>;
  onDragEnd: (event: DragEndEvent) => void;
  onToggle: (key: WidgetKey) => void;
}) {
  const grid = (
    <div className="lc-hoy-widget-grid grid grid-flow-row-dense items-stretch grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6 xl:gap-5 3xl:grid-cols-12 3xl:gap-6 auto-rows-min lg:auto-rows-[minmax(10.5rem,auto)] xl:auto-rows-[minmax(11rem,auto)]">
      {visibleWidgets.map((w) =>
        dndReady && personalize ? (
          <SortableTile
            key={w.widget_key}
            id={w.widget_key}
            visible={w.visible}
            personalize={personalize}
            onToggle={() => onToggle(w.widget_key)}
          >
            {childrenMap[w.widget_key]}
          </SortableTile>
        ) : (
          <StaticTile
            key={w.widget_key}
            id={w.widget_key}
            visible={w.visible}
            personalize={personalize}
            onToggle={() => onToggle(w.widget_key)}
          >
            {childrenMap[w.widget_key]}
          </StaticTile>
        ),
      )}
    </div>
  );
  if (!dndReady || !personalize) return grid;
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={orderedKeys} strategy={rectSortingStrategy}>
        {grid}
      </SortableContext>
    </DndContext>
  );
}

export function WidgetGrid({ childrenMap, initialWidgets, personalize }: Props) {
  const dndReady = useDndReady();
  const demo = isDemoModeClient();
  const [widgets, setWidgets] = React.useState(() =>
    demo ? clientGetWidgets() : initialWidgets,
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const reload = React.useCallback(async () => {
    if (demo) {
      setWidgets(clientGetWidgets());
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const next = await clientFetchWidgets();
      setWidgets(next);
    } catch (e) {
      setError(friendlyError(e, "Error al cargar widgets"));
    } finally {
      setLoading(false);
    }
  }, [demo]);

  const visibleWidgets = React.useMemo(
    () =>
      [...widgets]
        .filter((w) => w.visible)
        .sort((a, b) => a.sort_order - b.sort_order),
    [widgets],
  );

  const orderedKeys = visibleWidgets.map((w) => w.widget_key);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const applyOrder = (next: WidgetKey[]) => {
    setWidgets((prev) =>
      [...prev]
        .map((w) => ({
          ...w,
          sort_order: next.indexOf(w.widget_key) >= 0 ? next.indexOf(w.widget_key) : w.sort_order,
        }))
        .sort((a, b) => a.sort_order - b.sort_order),
    );
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedKeys.indexOf(active.id as WidgetKey);
    const newIndex = orderedKeys.indexOf(over.id as WidgetKey);
    const next = arrayMove(orderedKeys, oldIndex, newIndex);
    setSaving(true);
    void clientReorderWidgets(next)
      .then(() => {
        if (demo) setWidgets(clientGetWidgets());
        else applyOrder(next);
      })
      .finally(() => setSaving(false));
  };

  const toggle = (key: WidgetKey) => {
    const w = widgets.find((x) => x.widget_key === key);
    const nextVisible = !(w?.visible ?? true);
    setSaving(true);
    void clientToggleWidget(key, nextVisible)
      .then(() => {
        if (demo) {
          setWidgets(clientGetWidgets());
        } else {
          setWidgets((prev) =>
            prev.map((x) =>
              x.widget_key === key
                ? { ...x, visible: nextVisible, updated_at: new Date().toISOString() }
                : x,
            ),
          );
        }
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} retry={() => void reload()} />;
  }

  if (widgets.length === 0) {
    return (
      <EmptyState
        title="Sin widgets"
        description="No hay widgets en tu panel. Usa Personalizar para añadir widgets."
      />
    );
  }

  return (
    <div className="space-y-4" aria-busy={saving}>
      {personalize && (
        <WidgetCatalogPanel
          widgets={widgets}
          onAdded={() => void reload()}
          saving={saving}
          setSaving={setSaving}
        />
      )}

      {visibleWidgets.length === 0 ? (
        <EmptyState
          title="Panel vacío"
          description="Activa Personalizar y elige widgets del catálogo."
        />
      ) : (
        <WidgetGridBody
          dndReady={dndReady}
          personalize={personalize}
          visibleWidgets={visibleWidgets}
          orderedKeys={orderedKeys}
          childrenMap={childrenMap}
          sensors={sensors}
          onDragEnd={onDragEnd}
          onToggle={toggle}
        />
      )}
    </div>
  );
}