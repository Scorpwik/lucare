import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { isDemoMode, googleOAuthConfigured } from "@/lib/env";
import { encryptionConfigured } from "@/lib/integrations/crypto";
import { buildGoogleAuthorizeUrl } from "@/lib/integrations/google-oauth";
import { createClient } from "@/lib/supabase/server";

const STATE_COOKIE = "lucare-google-oauth-state";

export async function GET(request: Request) {
  if (isDemoMode()) {
    return NextResponse.redirect(new URL("/ajustes?integration=demo", request.url));
  }

  if (!googleOAuthConfigured() || !encryptionConfigured()) {
    return NextResponse.redirect(new URL("/ajustes?integration=missing-env", request.url));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const origin = new URL(request.url).origin;
  const state = `${user.id}.${randomBytes(16).toString("hex")}`;
  const url = buildGoogleAuthorizeUrl(origin, state);

  const res = NextResponse.redirect(url);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}