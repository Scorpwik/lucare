import { NextResponse } from "next/server";
import { upsertMoodLog } from "@/lib/data/mind";
import type { MoodInput } from "@/lib/data/mind";

export async function POST(request: Request) {
  const body = (await request.json()) as MoodInput;
  try {
    const row = await upsertMoodLog(body);
    return NextResponse.json(row);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}