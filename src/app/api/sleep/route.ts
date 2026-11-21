import { NextResponse } from "next/server";
import { fetchSleepLogs, upsertSleepLog } from "@/lib/data/sleep-habits";
import type { SleepLogInput } from "@/lib/data/sleep-habits";

export async function GET(request: Request) {
  const limit = Number(new URL(request.url).searchParams.get("limit") ?? "14");
  try {
    const rows = await fetchSleepLogs(Number.isFinite(limit) ? limit : 14);
    return NextResponse.json(rows);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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