import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { isDemoMode, supabaseConfigured } from "@/lib/env";
import { DEMO_COOKIE } from "@/lib/supabase/proxy";
import { createClient } from "@/lib/supabase/server";

export async function HomeRedirect(): Promise<null> {
  if (isDemoMode()) {
    const cookieStore = await cookies();
    if (cookieStore.get(DEMO_COOKIE)?.value === "1") {
      redirect("/hoy");
    }
    redirect("/login");
  }

  if (supabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    redirect(user ? "/hoy" : "/login");
  }

  redirect("/login");
  return null;
}