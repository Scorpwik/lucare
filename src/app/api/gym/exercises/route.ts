import { NextResponse } from "next/server";
import { upsertExercise } from "@/lib/data/gym";
import type { ExerciseInput } from "@/lib/data/gym";

export async function POST(request: Request) {
  const body = (await request.json()) as ExerciseInput & { id?: string | null };
  try {
    const { id, ...input } = body;
    const row = await upsertExercise(id ?? null, input);
    return NextResponse.json(row);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}