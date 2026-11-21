import { NextResponse } from "next/server";
import { endSession } from "@/lib/data/gym";

export async function POST(request: Request) {
  const body = (await request.json()) as { sessionId: string };
  try {
    await endSession(body.sessionId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}