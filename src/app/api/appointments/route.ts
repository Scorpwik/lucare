import { NextResponse } from "next/server";
import {
  deleteAppointment,
  fetchAppointments,
  upsertAppointment,
} from "@/lib/data/medications";
import type { AppointmentInput } from "@/lib/data/form-types";

type Body = AppointmentInput & { id?: string | null };

export async function GET() {
  try {
    const appts = await fetchAppointments();
    return NextResponse.json(appts);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  let id = url.searchParams.get("id");
  if (!id) {
    try {
      const body = (await request.json()) as { id?: string };
      id = body.id ?? null;
    } catch {
      /* sin body */
    }
  }

  if (!id) {
    return NextResponse.json({ error: "Falta id" }, { status: 400 });
  }

  try {
    await deleteAppointment(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}