import { NextResponse } from "next/server";
import { fetchBodyGoal, upsertBodyGoal } from "@/lib/data/body";
import type { BodyGoalInput } from "@/lib/data/body";

export async function GET() {
  try {
    const row = await fetchBodyGoal();
    return NextResponse.json(row);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as BodyGoalInput;
  try {
    const row = await upsertBodyGoal(body);
    return NextResponse.json(row);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}