import { NextResponse } from "next/server";
import { z } from "zod";
import { applyHealthConnectRows } from "@/lib/health-connect/apply-sync";

const MAX_ITEMS_PER_KIND = 500;
const MAX_BODY_BYTES = 512 * 1024;

const rowSchemas = {
  steps: z.object({
    activity_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    steps: z.number().int().min(0).max(500_000),
  }),
  sleep: z.object({
    sleep_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    hours_slept: z.number().min(0).max(24).nullable(),
    bedtime: z.string().max(32).nullable().optional(),
    wake_time: z.string().max(32).nullable().optional(),
  }),
  heart_rate: z.object({
    recorded_at: z.string().datetime(),
    bpm: z.number().int().min(30).max(220),
  }),
  weight: z.object({
    recorded_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    weight_kg: z.number().min(20).max(400),
  }),
};

const bodySchema = z.object({
  steps: z.array(rowSchemas.steps).max(MAX_ITEMS_PER_KIND).default([]),
  sleep: z.array(rowSchemas.sleep).max(MAX_ITEMS_PER_KIND).default([]),
  heart_rate: z.array(rowSchemas.heart_rate).max(MAX_ITEMS_PER_KIND).default([]),
  weight: z.array(rowSchemas.weight).max(MAX_ITEMS_PER_KIND).default([]),
});

export async function POST(request: Request) {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Carga demasiado grande" }, { status: 413 });
  }

  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Carga demasiado grande" }, { status: 413 });
    }
    raw = JSON.parse(text) as unknown;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }

  try {
    const result = await applyHealthConnectRows(parsed.data);
    if (result.errors.includes("No autenticado")) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    return NextResponse.json({
      applied: result.applied,
      errors: result.errors.length ? result.errors : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}