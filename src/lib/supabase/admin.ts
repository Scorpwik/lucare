import { createClient } from "@supabase/supabase-js";
import { env, supabaseConfigured } from "@/lib/env";

/** Cliente con service role — solo en rutas API de servidor. */
export function getAdminClient() {
  if (!supabaseConfigured() || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase admin no configurado");
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function adminConfigured(): boolean {
  return Boolean(
    supabaseConfigured() && env.SUPABASE_SERVICE_ROLE_KEY,
  );
}