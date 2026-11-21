"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { WidgetKey } from "@/lib/types";
import { WIDGET_LINK_LABEL, widgetSectionHref } from "@/lib/widget-routes";

type Props = {
  widgetKey: WidgetKey;
  personalize: boolean;
  toolbar: React.ReactNode;
  children: React.ReactNode;
};

export function WidgetTileShell({ widgetKey, personalize, toolbar, children }: Props) {
  const href = widgetSectionHref(widgetKey);

  return (
    <div className="relative group h-full min-h-0">
      {href ? (
        <Link
          href={href}
          className={cn(
            "absolute inset-0 z-0 rounded-[var(--r)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--led)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
          )}
          aria-label={WIDGET_LINK_LABEL[widgetKey]}
          tabIndex={personalize ? -1 : 0}
        />
      ) : null}
      {personalize ? (
        <div className="absolute top-1 right-1 z-20 flex gap-1">{toolbar}</div>
      ) : null}
      <div className="relative z-[1] h-full min-h-0 [&_button]:relative [&_button]:z-[2] [&_a:not([aria-label])]:relative [&_a:not([aria-label])]:z-[2] [&_input]:relative [&_input]:z-[2] [&_label]:relative">
        {children}
      </div>
    </div>
  );
}