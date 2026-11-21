import { getServerDemoState } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

function capitalizeWord(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function nameFromEmail(email: string | undefined): string {
  if (!email) return "amigo";
  const local = email.split("@")[0] ?? "amigo";
  const part = local.split(/[._-]/)[0] ?? local;
  return capitalizeWord(part);
}

function nameFromMetadata(metadata: Record<string, unknown> | undefined): string | null {
  if (!metadata) return null;
  const full = metadata.full_name ?? metadata.name;
  if (typeof full === "string" && full.trim()) return full.trim();
  return null;
}

export async function fetchUserDisplayName(): Promise<string> {
  if (isDemoMode()) {
    return getServerDemoState().displayName;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "amigo";

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const fromProfile = profile?.display_name?.trim();
  if (fromProfile) return fromProfile;

  const fromMeta = nameFromMetadata(user.user_metadata as Record<string, unknown> | undefined);
  if (fromMeta) return fromMeta;

  return nameFromEmail(user.email);
}