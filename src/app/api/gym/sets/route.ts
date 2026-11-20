import { NextResponse } from "next/server";
import { logSet } from "@/lib/data/gym";
import type { SetInput } from "@/lib/data/gym";

export async function POST(request: Request) {
  const body = (await request.json()) as SetInput;
  try {
    const row = await logSet(body);
    return NextResponse.json(row);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
