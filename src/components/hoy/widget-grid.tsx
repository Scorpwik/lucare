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
