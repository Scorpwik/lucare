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
  clientGetWidgets,
  clientReorderWidgets,
  clientToggleWidget,
} from "@/lib/data/dashboard-client";
import { isDemoModeClient } from "@/lib/env";
import { LcButton } from "@/components/lucare/lc-button";
import { Eye, EyeOff, GripVertical } from "lucide-react";

type Props = {
  childrenMap: Record<WidgetKey, React.ReactNode>;
  initialWidgets: DashboardWidget[];
};

function SortableTile({
  id,
  visible,
  onToggle,
  children,
}: {
  id: WidgetKey;
  visible: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: visible ? 1 : 0.45,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "z-10" : undefined}>
      <div className="relative group">
        <div className="absolute -top-1 -right-1 z-10 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <LcButton
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            aria-label={visible ? "Ocultar widget" : "Mostrar widget"}
            onClick={onToggle}
          >
            {visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          </LcButton>
          <LcButton
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 cursor-grab active:cursor-grabbing"
            aria-label="Reordenar"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-3.5" />
          </LcButton>
        </div>
        {children}
      </div>
    </div>
  );
}

export function WidgetGrid({ childrenMap, initialWidgets }: Props) {
  const [widgets, setWidgets] = React.useState(() =>
    isDemoModeClient() ? clientGetWidgets() : initialWidgets,
  );

  const orderedKeys = widgets
    .filter((w) => w.visible)
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {widgets
            .filter((w) => w.visible)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((w) => (
              <SortableTile
                key={w.widget_key}
                id={w.widget_key}
                visible={w.visible}
                onToggle={() => toggle(w.widget_key)}
              >
                {childrenMap[w.widget_key]}
              </SortableTile>
            ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}