import { encryptSecret, decryptSecret, encryptionConfigured } from "@/lib/integrations/crypto";
import { getAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { refreshGoogleAccessToken } from "@/lib/integrations/google-oauth";

export async function storeGoogleTokens(
  userId: string,
  tokens: {
    access_token: string;
    refresh_token?: string | null;
    expires_in?: number;
    scope?: string;
  },
): Promise<void> {
  if (!adminConfigured() || !encryptionConfigured()) {
    throw new Error("Almacenamiento de tokens no configurado");
  }
  const admin = getAdminClient();
  const expires_at = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null;

  const { data: existing } = await admin
    .from("integration_oauth_tokens")
    .select("refresh_token_encrypted")
    .eq("user_id", userId)
    .eq("provider", "google_calendar")
    .maybeSingle();

  const refreshPlain =
    tokens.refresh_token ??
    (existing?.refresh_token_encrypted
      ? decryptSecret(existing.refresh_token_encrypted)
      : null);

  await admin.from("integration_oauth_tokens").upsert(
    {
      user_id: userId,
      provider: "google_calendar",
      access_token_encrypted: encryptSecret(tokens.access_token),
      refresh_token_encrypted: refreshPlain ? encryptSecret(refreshPlain) : null,
      expires_at,
      scope: tokens.scope ?? null,
    },
    { onConflict: "user_id,provider" },
  );
}

export async function deleteGoogleTokens(userId: string): Promise<void> {
  if (!adminConfigured()) return;
  const admin = getAdminClient();
  await admin
    .from("integration_oauth_tokens")
    .delete()
    .eq("user_id", userId)
    .eq("provider", "google_calendar");
}

export async function getValidGoogleAccessToken(userId: string): Promise<string | null> {
  if (!adminConfigured() || !encryptionConfigured()) return null;
  const admin = getAdminClient();
  const { data, error } = await admin
    .from("integration_oauth_tokens")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", "google_calendar")
    .maybeSingle();
  if (error || !data) return null;

  let access = decryptSecret(data.access_token_encrypted);
  const expiresAt = data.expires_at ? new Date(data.expires_at).getTime() : 0;
  const needsRefresh = expiresAt > 0 && expiresAt < Date.now() + 60_000;

  if (needsRefresh && data.refresh_token_encrypted) {
    const refresh = decryptSecret(data.refresh_token_encrypted);
    const refreshed = await refreshGoogleAccessToken(refresh);
    access = refreshed.access_token;
    await storeGoogleTokens(userId, {
      access_token: refreshed.access_token,
      refresh_token: refresh,
      expires_in: refreshed.expires_in,
      scope: refreshed.scope,
    });
  }

  return access;
}