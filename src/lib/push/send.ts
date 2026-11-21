import { sendNotification } from "web-push";
import { ensureWebPushConfigured, vapidConfigured } from "@/lib/push/vapid";
import { createClient } from "@/lib/supabase/server";

export type PushPayload = {
  title: string;
  body?: string;
};

export type SendPushResult = {
  sent: number;
  failed: number;
  removed: number;
  skipped?: "vapid" | "no_subscriptions";
};

export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<SendPushResult> {
  if (!vapidConfigured()) {
    return { sent: 0, failed: 0, removed: 0, skipped: "vapid" };
  }

  ensureWebPushConfigured();

  const supabase = await createClient();
  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error) throw error;
  if (!subs?.length) {
    return { sent: 0, failed: 0, removed: 0, skipped: "no_subscriptions" };
  }

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body ?? "",
  });

  let sent = 0;
  let failed = 0;
  let removed = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body,
        );
        sent += 1;
      } catch (err) {
        failed += 1;
        const status =
          err && typeof err === "object" && "statusCode" in err
            ? (err as { statusCode?: number }).statusCode
            : undefined;
        if (status === 404 || status === 410) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("id", sub.id);
          removed += 1;
        }
      }
    }),
  );

  return { sent, failed, removed };
}