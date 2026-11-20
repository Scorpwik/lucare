"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env, supabaseConfigured } from "@/lib/env";

export function createClient() {
  if (!supabaseConfigured()) {
    throw new Error("Supabase no está configurado");
  }
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export function getSupabaseBrowserClient() {
  if (!supabaseConfigured()) return null;
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}