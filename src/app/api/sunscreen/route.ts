import { NextResponse } from "next/server";
import { fetchSunscreenSettings, upsertSunscreenSettings } from "@/lib/data/sunscreen";

export async function GET() {
  try {
    const settings = await fetchSunscreenSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type PatchBody = {
  apply_now?: boolean;
  reapply_interval_minutes?: number;
};

export async function PATCH(request: Request) {
  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    const patch: Parameters<typeof upsertSunscreenSettings>[0] = {};
    if (body.apply_now) {
      patch.last_applied_at = new Date().toISOString();
    }
    if (body.reapply_interval_minutes !== undefined) {
      patch.reapply_interval_minutes = body.reapply_interval_minutes;
    }
    const settings = await upsertSunscreenSettings(patch);
    return NextResponse.json({ settings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}