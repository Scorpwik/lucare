import { NextResponse } from "next/server";
import { upsertAppointment } from "@/lib/data/medications";
import type { AppointmentInput } from "@/lib/data/form-types";

type Body = AppointmentInput & { id?: string | null };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    const { id, ...input } = body;
    const appt = await upsertAppointment(id ?? null, input);
    return NextResponse.json(appt);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
