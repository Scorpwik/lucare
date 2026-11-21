import { NextResponse } from "next/server";
import { addJournalEntry } from "@/lib/data/mind";

export async function POST(request: Request) {
  const body = (await request.json()) as { body: string };
  try {
    const row = await addJournalEntry(body.body);
    return NextResponse.json(row);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}