import { NextResponse } from "next/server";
import { toggleHabitLog } from "@/lib/data/sleep-habits";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    habitId: string;
    logDate: string;
    completed: boolean;
  };
  try {
    await toggleHabitLog(body.habitId, body.logDate, body.completed);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
