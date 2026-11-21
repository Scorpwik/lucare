import { NextResponse } from "next/server";
import { googleOAuthConfigured } from "@/lib/env";
import { encryptionConfigured } from "@/lib/integrations/crypto";
import {
  exchangeGoogleCode,
  resolveGoogleRedirectUri,
} from "@/lib/integrations/google-oauth";
import { storeGoogleTokens } from "@/lib/integrations/tokens";
import { syncGoogleCalendarForUser } from "@/lib/integrations/sync-user";
import { createClient } from "@/lib/supabase/server";

const STATE_COOKIE = "lucare-google-oauth-state";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  const fail = (reason: string) =>
    NextResponse.redirect(
      `${origin}/ajustes?integration=google-error&reason=${encodeURIComponent(reason)}`,
    );

  if (oauthError) return fail(oauthError);
  if (!code || !state) return fail("missing_code");

  if (!googleOAuthConfigured() || !encryptionConfigured()) {
    return fail("not_configured");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("no_session");

  const cookieHeader = request.headers.get("cookie") ?? "";
  const stateCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${STATE_COOKIE}=`))
    ?.split("=")[1];

  if (!stateCookie || stateCookie !== state || !state.startsWith(user.id)) {
    return fail("invalid_state");
  }

  try {
    const redirectUri = resolveGoogleRedirectUri(origin);
    const tokens = await exchangeGoogleCode(code, redirectUri);
    await storeGoogleTokens(user.id, tokens);

    await supabase.from("calendar_links").upsert(
      {
        user_id: user.id,
        provider: "google_calendar",
        status: "connected",
        last_synced_at: null,
        metadata: {},
      },
      { onConflict: "user_id,provider" },
    );

    await syncGoogleCalendarForUser(user.id);

    const res = NextResponse.redirect(`${origin}/ajustes?integration=google-ok`);
    res.cookies.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "oauth_failed";
    return fail(msg);
  }
}