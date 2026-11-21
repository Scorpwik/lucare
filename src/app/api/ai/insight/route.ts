import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { getDailyInsight } from "@/lib/data/ai-insights";
import { createClient } from "@/lib/supabase/server";
import { getServerDemoState } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";

async function rateLimitKey(): Promise<string> {
  if (isDemoMode()) return `insight:demo:${getServerDemoState().userId}`;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return `insight:${user?.id ?? "anon"}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "1";
    if (force) {
      const key = await rateLimitKey();
      const limited = checkRateLimit(`${key}:force`, 2, 24 * 60 * 60 * 1000);
      if (!limited.ok) {
        return NextResponse.json(
          { error: "Límite diario de regeneración alcanzado", retryAfterSec: limited.retryAfterSec },
          { status: 429 },
        );
      }
    }
    const result = await getDailyInsight({ force });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}