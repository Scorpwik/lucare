import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, supabaseConfigured } from "@/lib/env";

export async function createClient() {
  if (!supabaseConfigured()) {
    throw new Error("Supabase no está configurado");
  }

  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* Server Component — cookies de solo lectura */
          }
        },
      },
    },
  );
}

export async function getOptionalServerClient() {
  if (!supabaseConfigured()) return null;
  return createClient();
}