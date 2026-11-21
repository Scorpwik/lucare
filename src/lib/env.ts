import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional().default(""),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default(""),
  NEXT_PUBLIC_LUCARE_DEMO_MODE: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  LUCARE_DEMO_MODE: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().optional(),
  NOTION_CLIENT_ID: z.string().optional(),
  NOTION_CLIENT_SECRET: z.string().optional(),
  NOTION_TOKEN: z.string().optional(),
  NOTION_DEBERES_DB_ID: z.string().optional(),
  INTEGRATION_SYNC_SECRET: z.string().optional(),
  INTEGRATION_TOKEN_ENCRYPTION_KEY: z.string().optional(),
  AI_GATEWAY_API_KEY: z.string().optional(),
  AI_GATEWAY_MODEL: z.string().optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),
});

function parseEnv() {
  return envSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    NEXT_PUBLIC_LUCARE_DEMO_MODE: process.env.NEXT_PUBLIC_LUCARE_DEMO_MODE,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    LUCARE_DEMO_MODE: process.env.LUCARE_DEMO_MODE,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
    VAPID_SUBJECT: process.env.VAPID_SUBJECT,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    NOTION_CLIENT_ID: process.env.NOTION_CLIENT_ID,
    NOTION_CLIENT_SECRET: process.env.NOTION_CLIENT_SECRET,
    NOTION_TOKEN: process.env.NOTION_TOKEN,
    NOTION_DEBERES_DB_ID: process.env.NOTION_DEBERES_DB_ID,
    INTEGRATION_SYNC_SECRET: process.env.INTEGRATION_SYNC_SECRET,
    INTEGRATION_TOKEN_ENCRYPTION_KEY: process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY,
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
    AI_GATEWAY_MODEL: process.env.AI_GATEWAY_MODEL,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
  });
}

/**
 * Flash por defecto. gemini-2.5-flash devuelve 404 para cuentas nuevas de AI Studio
 * ("no longer available to new users"), así que usamos la versión vigente.
 */
export const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";

/** Alias de Google al Flash-Lite vigente (más rápido); respaldo si el modelo principal falla. */
export const GEMINI_FALLBACK_MODEL = "gemini-flash-lite-latest";

/** Modelo por defecto del AI Gateway — económico y verificado en el catálogo. */
export const DEFAULT_AI_GATEWAY_MODEL = "amazon/nova-micro";

function looksLikeConfiguredSecret(key: string | undefined): boolean {
  return Boolean(key && key.length > 8 && !key.startsWith("tu-"));
}

export function googleGenerativeAiConfigured(): boolean {
  const key =
    env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  return looksLikeConfiguredSecret(key);
}

export function aiGatewayConfigured(): boolean {
  const key = env.AI_GATEWAY_API_KEY ?? process.env.AI_GATEWAY_API_KEY;
  return looksLikeConfiguredSecret(key);
}

/** Gemini (clave propia) o AI Gateway listos para llamadas en vivo. */
export function aiConfigured(): boolean {
  return googleGenerativeAiConfigured() || aiGatewayConfigured();
}

export function resolveGeminiModelId(): string {
  const configured = env.GEMINI_MODEL ?? process.env.GEMINI_MODEL;
  return configured?.trim() || DEFAULT_GEMINI_MODEL;
}

export function resolveAiGatewayModelId(): string {
  const configured = env.AI_GATEWAY_MODEL ?? process.env.AI_GATEWAY_MODEL;
  return configured?.trim() || DEFAULT_AI_GATEWAY_MODEL;
}

export const env = parseEnv();

export const TIMEZONE = "America/Guayaquil";

export function supabaseConfigured(): boolean {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      url.length > 0 &&
      key.length > 0 &&
      !url.includes("tu-proyecto"),
  );
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
  const flag = process.env.NEXT_PUBLIC_LUCARE_DEMO_MODE;
  return flag === "true" || flag === "1";
}