import { NextResponse } from "next/server";
import {
  deleteTemplate,
  fetchWorkoutTemplates,
  upsertTemplate,
} from "@/lib/data/gym";
import type { TemplateInput } from "@/lib/data/gym";

export async function GET() {
  try {
    const rows = await fetchWorkoutTemplates();
    return NextResponse.json(rows);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Falta id" }, { status: 400 });
  }
  try {
    await deleteTemplate(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as TemplateInput & { id?: string | null };
  try {
    const { id, ...input } = body;
    const row = await upsertTemplate(id ?? null, input);
    return NextResponse.json(row);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}