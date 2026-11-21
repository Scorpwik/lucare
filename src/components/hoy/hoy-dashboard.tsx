"use client";

import * as React from "react";
import { PageHeading } from "@/components/layout/page-heading";
import { WidgetGrid } from "@/components/hoy/widget-grid";
import { LcButton } from "@/components/lucare/lc-button";
import type { DashboardWidget, WidgetKey } from "@/lib/types";
import { SlidersHorizontal } from "lucide-react";

type Props = {
  childrenMap: Record<WidgetKey, React.ReactNode>;
  initialWidgets: DashboardWidget[];
};

export function HoyDashboard({ childrenMap, initialWidgets }: Props) {
  const [personalize, setPersonalize] = React.useState(false);

  return (
    <div>
      <HoyHeading personalize={personalize} onToggle={() => setPersonalize((p) => !p)} />
      <WidgetGrid
        childrenMap={childrenMap}
        initialWidgets={initialWidgets}
        personalize={personalize}
      />
    </div>
  );
}

function HoyHeading({
  personalize,
  onToggle,
}: {
  personalize: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <PageHeading module="módulo · hoy" title="Panel" />
      <LcButton
        type="button"
        variant={personalize ? "pri" : "ghost"}
        size="sm"
        className="self-start sm:self-auto shrink-0"
        aria-pressed={personalize}
        onClick={onToggle}
      >
        <SlidersHorizontal className="size-4 mr-1.5" aria-hidden />
        {personalize ? "Listo" : "Personalizar"}
      </LcButton>
    </div>
  );
}