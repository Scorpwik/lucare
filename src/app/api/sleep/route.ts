import { NextResponse } from "next/server";
import { upsertSleepLog } from "@/lib/data/sleep-habits";
import type { SleepLogInput } from "@/lib/data/sleep-habits";

export async function POST(request: Request) {
  const body = (await request.json()) as SleepLogInput;
  try {
    const row = await upsertSleepLog(body);
    return NextResponse.json(row);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}