import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";

function safeNext(next: string | null): string {
  const raw = next ?? "/hoy";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/hoy";
  return raw;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeNext(searchParams.get("next"));

  if (!supabaseConfigured()) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as EmailOtpType,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    const err =
      next === "/restablecer" ? "recovery" : "auth";
    return NextResponse.redirect(`${origin}/login?error=${err}`);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const err = next === "/restablecer" ? "recovery" : "auth";
  return NextResponse.redirect(`${origin}/login?error=${err}`);
}