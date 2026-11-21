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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import type { DashboardWidget, WidgetKey } from "@/lib/types";
import {
  clientGetWidgets,
  clientReorderWidgets,
  clientToggleWidget,
} from "@/lib/data/dashboard-client";
import { LcButton } from "@/components/lucare/lc-button";
import { isDemoModeClient } from "@/lib/env";

type WidgetGridProps = {
  childrenMap: Record<WidgetKey, React.ReactNode>;
  initialWidgets?: DashboardWidget[];
};

function SortableItem({
  id,
  visible,
  children,
  onToggle,
}: {
  id: WidgetKey;
  visible: boolean;
  children: React.ReactNode;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: !visible });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: visible ? (isDragging ? 0.85 : 1) : 0.45,
  };

  if (!visible) {
    return (
      <div ref={setNodeRef} style={style} className="relative min-h-[48px]">
        <div className="glass-panel p-3 flex items-center justify-between gap-2">
          <span className="silk">oculto · {id}</span>
          <LcButton variant="ghost" size="sm" type="button" onClick={onToggle}>
            <Eye className="size-4" />
          </LcButton>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <WidgetChrome listeners={listeners} attributes={attributes} onToggle={onToggle} />
      {children}
    </div>
  );
}

function WidgetChrome({
  listeners,
  attributes,
  onToggle,
}: {
  listeners: ReturnType<typeof useSortable>["listeners"];
  attributes: ReturnType<typeof useSortable>["attributes"];
  onToggle: () => void;
}) {
  return (
    <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
      <button
        type="button"
        className="p-1.5 rounded-full bg-surface border border-border shadow-[var(--shadow-1)] cursor-grab active:cursor-grabbing"
        aria-label="Reordenar"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <LcButton variant="ghost" size="sm" type="button" onClick={onToggle}>
        <EyeOff className="size-4" />
      </LcButton>
    </div>
  );
}

export function WidgetGrid({ childrenMap, initialWidgets }: WidgetGridProps) {
  const [widgets, setWidgets] = React.useState<DashboardWidget[]>(() =>
    initialWidgets ?? (isDemoModeClient() ? clientGetWidgets() : []),
  );

  const orderedKeys = widgets
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((w) => w.widget_key);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const applyOrder = (next: WidgetKey[]) => {
    setWidgets((prev) =>
      [...prev]
        .map((w) => ({
          ...w,
          sort_order: next.indexOf(w.widget_key),
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
    clientReorderWidgets(next);
    if (isDemoModeClient()) setWidgets(clientGetWidgets());
    else applyOrder(next);
  };

  const toggle = (key: WidgetKey) => {
    const w = widgets.find((x) => x.widget_key === key);
    const nextVisible = !(w?.visible ?? true);
    clientToggleWidget(key, nextVisible);
    if (isDemoModeClient()) {
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
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={orderedKeys} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-min">
          {orderedKeys.map((key) => {
            const w = widgets.find((x) => x.widget_key === key);
            return (
              <SortableItem
                key={key}
                id={key}
                visible={w?.visible ?? true}
                onToggle={() => toggle(key)}
              >
                {childrenMap[key]}
              </SortableItem>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}