"use client";

import * as React from "react";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  clientGetWidgets,
  clientToggleWidget,
} from "@/lib/data/dashboard-client";
import type { WidgetKey } from "@/lib/types";
import { toast } from "sonner";

const widgetLabels: Record<WidgetKey, string> = {
  saludo: "Saludo",
  bloqueador: "Bloqueador SPF",
  rutina_am: "Rutina mañana",
  pastillas: "Pastillas",
  citas: "Citas",
  gimnasio: "Gimnasio",
  cuerpo_resumen: "Cuerpo",
  sueno: "Sueño",
  habitos_racha: "Hábitos (racha)",
  animo: "Ánimo",
  cuidado_personal: "Cuidado personal",
  agenda: "Agenda",
  tareas: "Tareas",
};

export default function AjustesPage() {
  const [widgets, setWidgets] = React.useState(() => clientGetWidgets());
  const [pushEnabled, setPushEnabled] = React.useState(false);

  const toggleWidget = (key: WidgetKey, visible: boolean) => {
    clientToggleWidget(key, visible);
    setWidgets(clientGetWidgets());
  };

  const enablePush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Push no soportado en este navegador");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) {
        toast.message("VAPID no configurado — suscripción demo registrada");
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: "https://demo.local/push",
            keys: { p256dh: "demo", auth: "demo" },
          }),
        });
        setPushEnabled(true);
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });
      const json = sub.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });
      setPushEnabled(true);
      toast.success("Notificaciones activadas");
    } catch (e) {
      toast.error("No se pudo activar push");
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      <header>
        <p className="silk">módulo · ajustes</p>
        <h1 className="font-dot font-black text-4xl">Ajustes</h1>
      </header>

      <GlassCard className="p-4 space-y-3">
        <p className="silk">widgets · hoy</p>
        {widgets.map((w) => (
          <SettingsRow key={w.widget_key} label={widgetLabels[w.widget_key]}>
            <Switch
              checked={w.visible}
              onCheckedChange={(v) => toggleWidget(w.widget_key, v)}
            />
          </SettingsRow>
        ))}
      </GlassCard>

      <GlassCard className="p-4 space-y-3">
        <p className="silk">notificaciones</p>
        <p className="text-sm text-muted-foreground">
          Recordatorios de medicación y rutinas vía Web Push.
        </p>
        <LcButton
          type="button"
          variant={pushEnabled ? "ghost" : "pri"}
          onClick={enablePush}
          disabled={pushEnabled}
        >
          {pushEnabled ? "Push activado" : "Activar notificaciones"}
        </LcButton>
      </GlassCard>

      <GlassCard className="p-4 space-y-2">
        <p className="silk">integraciones</p>
        <p className="text-sm text-muted-foreground">
          Google Calendar y Notion — disponibles en Fase 4. Los endpoints API ya están preparados.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <DomainBadge label="Google" />
          <DomainBadge label="Notion" />
        </div>
      </GlassCard>
    </div>
  );
}

function SettingsRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-border">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function DomainBadge({ label }: { label: string }) {
  return (
    <span className="font-mono text-[10px] border border-border rounded-[var(--pill)] px-2 py-1 text-muted-foreground">
      {label} · sin configurar
    </span>
  );
}

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}