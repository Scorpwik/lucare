import { NextResponse } from "next/server";
import {
  fetchDashboardWidgets,
  reorderWidgets,
  updateWidgetVisibility,
} from "@/lib/data/dashboard";
import type { WidgetKey } from "@/lib/types";

export async function GET() {
  try {
    const widgets = await fetchDashboardWidgets();
    return NextResponse.json({ widgets });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type PatchBody = {
  reorder?: WidgetKey[];
  visibility?: { key: WidgetKey; visible: boolean };
};

export async function PATCH(request: Request) {
  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    if (body.reorder?.length) {
      await reorderWidgets(body.reorder);
    }
    if (body.visibility) {
      await updateWidgetVisibility(body.visibility.key, body.visibility.visible);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
