import { NextResponse } from "next/server";
import { upsertBodyMetric } from "@/lib/data/body";
import type { BodyMetricInput } from "@/lib/data/body";

export async function POST(request: Request) {
  const body = (await request.json()) as BodyMetricInput & { id?: string | null };
  try {
    const { id, ...input } = body;
    const row = await upsertBodyMetric(id ?? null, input);
    return NextResponse.json(row);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}