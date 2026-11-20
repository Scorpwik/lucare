import { NextResponse } from "next/server";
import { upsertPersonalRoutine } from "@/lib/data/personal-care";
import type { PersonalRoutineInput } from "@/lib/data/personal-care";

export async function POST(request: Request) {
  const body = (await request.json()) as PersonalRoutineInput & {
    id?: string | null;
  };
  try {
    const { id, ...input } = body;
    const row = await upsertPersonalRoutine(id ?? null, input);
    return NextResponse.json(row);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
