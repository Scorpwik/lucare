import { NextResponse } from "next/server";
import { upsertTemplate } from "@/lib/data/gym";
import type { TemplateInput } from "@/lib/data/gym";

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
