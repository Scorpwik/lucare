import { connection } from "next/server";
import {
  env,
  googleOAuthConfigured,
  isDemoMode,
  notionConfigured,
} from "@/lib/env";
import { encryptionConfigured } from "@/lib/integrations/crypto";
import { createClient } from "@/lib/supabase/server";
import type { CalendarLink, IntegrationProvider } from "@/lib/types";

export type IntegrationStatus = {
  provider: IntegrationProvider;
  configured: boolean;
  connected: boolean;
  status: CalendarLink["status"];
  last_synced_at: string | null;
  message: string;
  authorize_path: string | null;
};

const disconnected = (provider: IntegrationProvider, configured: boolean, message: string): IntegrationStatus => ({
  provider,
  configured,
  connected: false,
  status: "disconnected",
  last_synced_at: null,
  message,
  authorize_path: null,
});

export async function fetchIntegrationStatuses(): Promise<IntegrationStatus[]> {
  await connection();
  const googleConfigured =
    googleOAuthConfigured() && encryptionConfigured() && Boolean(env.SUPABASE_SERVICE_ROLE_KEY);
  const notionServerConfigured = notionConfigured();

  if (isDemoMode()) {
    return [
      {
        provider: "google_calendar",
        configured: googleConfigured,
        connected: false,
        status: "disconnected",
        last_synced_at: null,
        message: googleConfigured
          ? "Demo — conecta en producción con Supabase"
          : "Google OAuth no configurado",
        authorize_path: null,
      },
      {
        provider: "notion_deberes",
        configured: notionServerConfigured,
        connected: false,
        status: "disconnected",
        last_synced_at: null,
        message: notionServerConfigured
          ? "Demo — datos de ejemplo en agenda"
          : "Notion no configurado (NOTION_TOKEN + NOTION_DEBERES_DB_ID)",
        authorize_path: null,
      },
    ];
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [
      disconnected(
        "google_calendar",
        googleConfigured,
        googleConfigured ? "Inicia sesión para conectar" : "Google no configurado",
      ),
      disconnected(
        "notion_deberes",
        notionServerConfigured,
        notionServerConfigured ? "Inicia sesión para conectar" : "Notion no configurado",
      ),
    ];
  }

  const { data: links } = await supabase
    .from("calendar_links")
    .select("*")
    .eq("user_id", user.id);

  const byProvider = new Map<IntegrationProvider, CalendarLink>();
  for (const row of links ?? []) {
    byProvider.set(row.provider as IntegrationProvider, row as CalendarLink);
  }

  const googleLink = byProvider.get("google_calendar");
  const notionLink = byProvider.get("notion_deberes");

  return [
    {
      provider: "google_calendar",
      configured: googleConfigured,
      connected: googleLink?.status === "connected",
      status: googleLink?.status ?? "disconnected",
      last_synced_at: googleLink?.last_synced_at ?? null,
      message: !googleConfigured
        ? "Faltan GOOGLE_* / INTEGRATION_TOKEN_ENCRYPTION_KEY / service role"
        : googleLink?.status === "error"
          ? "Error en última sync — reconecta o reintenta"
          : googleLink?.status === "connected"
            ? "Google Calendar conectado"
            : "Sin conectar",
      authorize_path: googleConfigured ? "/api/integrations/google/authorize" : null,
    },
    {
      provider: "notion_deberes",
      configured: notionServerConfigured,
      connected: notionLink?.status === "connected",
      status: notionLink?.status ?? "disconnected",
      last_synced_at: notionLink?.last_synced_at ?? null,
      message: !notionServerConfigured
        ? "Notion no configurado en el servidor"
        : notionLink?.status === "error"
          ? "Error al leer Deberes — revisa la base"
          : notionLink?.status === "connected"
            ? "Notion Deberes activo"
            : "Activa la integración para sincronizar deberes",
      authorize_path: null,
    },
  ];
}
