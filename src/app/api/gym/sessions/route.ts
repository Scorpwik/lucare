import { NextResponse } from "next/server";
import { startSession } from "@/lib/data/gym";

export async function POST(request: Request) {
  const body = (await request.json()) as { templateId?: string | null };
  try {
    const row = await startSession(body.templateId ?? null);
    return NextResponse.json(row);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
