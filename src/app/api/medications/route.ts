import { NextResponse } from "next/server";
import { upsertMedication } from "@/lib/data/medications";
import type { MedicationInput } from "@/lib/data/form-types";

type Body = MedicationInput & { id?: string | null };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    const { id, ...input } = body;
    const med = await upsertMedication(id ?? null, input);
    return NextResponse.json(med);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}