import { NextResponse } from "next/server";
import {
  deleteProgressPhoto,
  fetchProgressPhotos,
  registerProgressPhoto,
} from "@/lib/data/body";

export async function GET() {
  try {
    const rows = await fetchProgressPhotos();
    return NextResponse.json(rows);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    storage_path?: string;
    caption?: string | null;
  };
  if (!body.storage_path) {
    return NextResponse.json({ error: "Falta storage_path" }, { status: 400 });
  }
  try {
    const row = await registerProgressPhoto(body.storage_path, body.caption);
    return NextResponse.json(row);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Falta id" }, { status: 400 });
  }
  try {
    await deleteProgressPhoto(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}