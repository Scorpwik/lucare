"use client";

import * as React from "react";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { LoadingState } from "@/components/lucare/loading-state";
import { isDemoModeClient } from "@/lib/env";
import {
  showLocalTestNotification,
  subscribeToWebPush,
  unsubscribeFromWebPush,
} from "@/lib/push/client";
import { vapidConfiguredClient } from "@/lib/push/vapid-public";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

type PushStatus = {
  configured: boolean;
  demo: boolean;
};

export function PushSettingsPanel() {
  const [status, setStatus] = React.useState<PushStatus | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [subscribed, setSubscribed] = React.useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = React.useState(false);

  const clientVapid = vapidConfiguredClient();

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/push/status");
        if (!res.ok) throw new Error("status");
        const data = (await res.json()) as PushStatus;
        if (!cancelled) setStatus(data);
      } catch {
        if (!cancelled) {
          setStatus({
            configured: clientVapid,
            demo: isDemoModeClient(),
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clientVapid]);

  React.useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      queueMicrotask(() => setSubscriptionChecked(true));
      return;
    }
    void navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        setSubscribed(Boolean(sub));
        setSubscriptionChecked(true);
      })
      .catch(() => {
        setSubscribed(false);
        setSubscriptionChecked(true);
      });
  }, []);

  const configured = status?.configured ?? clientVapid;
  const demo = status?.demo ?? isDemoModeClient();

  const onSubscribe = async () => {
    setBusy(true);
    let result: Awaited<ReturnType<typeof subscribeToWebPush>>;
    try {
      result = await subscribeToWebPush();
    } catch (e) {
      result = {
        ok: false,
        reason: "error",
        message: e instanceof Error ? e.message : "No se pudo activar push",
      };
    } finally {
      setBusy(false);
    }
    if (!result.ok) {
      if (result.reason === "unsupported") {
        toast.error("Web Push no disponible", { description: result.message });
      } else if (result.reason === "denied") {
        toast.error("Notificaciones bloqueadas", { description: result.message });
      } else if (result.reason === "no-vapid") {
        toast.message("Web Push no configurado", {
          description: "Define NEXT_PUBLIC_VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY.",
        });
      } else {
        toast.error(result.message ?? "No se pudo activar push");
      }
      return;
    }
    setSubscribed(true);
    setSubscriptionChecked(true);
    toast.success(demo ? "Suscripción registrada (demo)" : "Notificaciones push activadas");
  };

  const onUnsubscribe = async () => {
    setBusy(true);
    const result = await unsubscribeFromWebPush();
    setBusy(false);
    if (!result.ok) {
      toast.error(result.message ?? "No se pudo desactivar push");
      return;
    }
    setSubscribed(false);
    toast.success("Suscripción cancelada");
  };

  const onTest = async () => {
    setBusy(true);
    if (configured && !demo) {
      try {
        const res = await fetch("/api/push/test", { method: "POST" });
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          sent?: number;
          skipped?: string;
        };
        if (!res.ok) {
          toast.error(data.error ?? "No se pudo enviar la prueba");
        } else if (data.skipped === "vapid") {
          toast.message("VAPID no configurado", {
            description: "Usa una notificación local en su lugar.",
          });
          await showLocalTestNotification();
        } else if (data.skipped === "no_subscriptions") {
          toast.error("Activa push antes de probar");
        } else {
          toast.success(
            data.sent ? `Prueba enviada (${data.sent})` : "Prueba enviada",
          );
        }
      } catch {
        toast.error("Error de red al probar push");
      }
    } else {
      const local = await showLocalTestNotification();
      if (local.ok) toast.success("Notificación local mostrada");
      else toast.error(local.message ?? "No se pudo probar");
    }
    setBusy(false);
  };

  return (
    <GlassCard className="p-4 mt-4">
      <p className="silk mb-2">notificaciones · web push</p>
      {status === null ? (
        <LoadingState className="py-4" />
      ) : (
        <>
          {!configured && (
            <p className="text-sm text-muted-foreground mb-3 border border-dashed border-border rounded-[var(--r)] p-3">
              Web Push no está configurado en este entorno. Añade un par VAPID en{" "}
              <code className="font-mono text-xs">.env.local</code> (ver{" "}
              <code className="font-mono text-xs">.env.example</code>). En modo demo puedes
              probar notificaciones locales.
            </p>
          )}
          {demo && configured && (
            <p className="text-xs text-muted-foreground mb-3">
              Modo demo: las suscripciones no se guardan en Supabase; la prueba local sigue
              disponible.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <LcButton
              type="button"
              variant="pri"
              size="sm"
              disabled={busy || subscribed === true || !configured}
              onClick={() => void onSubscribe()}
            >
              <Bell className="size-3.5" />
              Activar push
            </LcButton>
            <LcButton
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy || !subscribed}
              onClick={() => void onUnsubscribe()}
            >
              <BellOff className="size-3.5" />
              Desactivar
            </LcButton>
            <LcButton type="button" variant="ghost" size="sm" disabled={busy} onClick={() => void onTest()}>
              Probar
            </LcButton>
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-3">
            estado:{" "}
            {!subscriptionChecked ? "…" : subscribed ? "suscrito" : "sin suscripción"}
            {configured ? " · VAPID ok" : " · VAPID pendiente"}
          </p>
        </>
      )}
    </GlassCard>
  );
}