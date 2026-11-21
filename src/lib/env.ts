export const TIMEZONE = "America/Guayaquil";

function flag(name: string): boolean {
  const v = process.env[name];
  return v === "true" || v === "1";
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  LUCARE_DEMO_MODE: flag("LUCARE_DEMO_MODE"),
  NEXT_PUBLIC_LUCARE_DEMO_MODE: process.env.NEXT_PUBLIC_LUCARE_DEMO_MODE,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  NOTION_TOKEN: process.env.NOTION_TOKEN,
  NOTION_DEBERES_DB_ID: process.env.NOTION_DEBERES_DB_ID,
  INTEGRATION_SYNC_SECRET: process.env.INTEGRATION_SYNC_SECRET,
  INTEGRATION_TOKEN_ENCRYPTION_KEY: process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY,
};

export function supabaseConfigured(): boolean {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function googleOAuthConfigured(): boolean {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

export function notionConfigured(): boolean {
  return Boolean(env.NOTION_TOKEN && env.NOTION_DEBERES_DB_ID);
}

export function isDemoMode(): boolean {
  return Boolean(env.LUCARE_DEMO_MODE || env.NEXT_PUBLIC_LUCARE_DEMO_MODE);
}

/** Lectura segura en componentes cliente */
export function isDemoModeClient(): boolean {
  const flagVal = process.env.NEXT_PUBLIC_LUCARE_DEMO_MODE;
  return flagVal === "true" || flagVal === "1";
}