import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/env";
import { vapidConfigured, vapidPublicKey } from "@/lib/push/vapid";

export async function GET() {
  return NextResponse.json({
    configured: vapidConfigured(),
    publicKey: vapidPublicKey(),
    demo: isDemoMode(),
  });
}