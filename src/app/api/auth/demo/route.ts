import { NextResponse } from "next/server";
import { DEMO_COOKIE } from "@/lib/supabase/proxy";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(DEMO_COOKIE, "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    httpOnly: true,
  });
  return res;
}