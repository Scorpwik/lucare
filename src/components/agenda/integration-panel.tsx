"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { friendlyError } from "@/lib/feedback";
import { toast } from "sonner";
import type { IntegrationStatus } from "@/lib/data/integrations";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { isDemoModeClient } from "@/lib/env";
import { RefreshCw } from "lucide-react";

type Props = {
  initial: IntegrationStatus[];
};

function labelForProvider(provider: IntegrationStatus["provider"]): string {
  return provider === "google_calendar" ? "Google Calendar" : "Notion Deberes";
}

export function IntegrationPanel({ initial }: Props) {
  const router = useRouter();
  const [rows, setRows] = React.useState(initial);
  const [busy, setBusy] = React.useState<string | null>(null);
  const demo = isDemoModeClient();

  const refreshStatuses = async () => {
    const [googleRes, notionRes] = await Promise.all([
      fetch("/api/integrations/google"),
      fetch("/api/integrations/notion"),
    ]);
    const google = (await googleRes.json()) as IntegrationStatus;
    const notion = (await notionRes.json()) as IntegrationStatus;
    setRows([google, notion]);
  };

  const connectGoogle = () => {
    if (demo) {
      toast.message("Modo demo", {
        description: "Configura Supabase y OAuth en producción.",
      });
      return;
    }
    router.push("/api/integrations/google/authorize");
  };

  const disconnectGoogle = async () => {
    if (!window.confirm("¿Desconectar Google Calendar?")) return;
    setBusy("google_calendar");
    try {
      const res = await fetch("/api/integrations/google", { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(friendlyError(data.error, "No se pudo desconectar Google"));
        return;
      }
      await refreshStatuses();
      toast.success("Google Calendar desconectado");
      router.refresh();
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setBusy(null);
    }
  };

  const syncGoogle = async () => {
    setBusy("google_calendar");
    try {
      const res = await fetch("/api/integrations/google", { method: "POST" });
      const data = await res.json();
      if (!res.ok || data.ok === false) toast.error(friendlyError(data.error, "Error al sincronizar"));
      else toast.success(`Google: ${data.count ?? 0} eventos`);
      await refreshStatuses();
      router.refresh();
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setBusy(null);
    }
  };

  const connectNotion = async () => {
    setBusy("notion_deberes");
    try {
      if (demo) {
        toast.message("Modo demo", { description: "Agenda muestra datos de ejemplo." });
        return;
      }
      const res = await fetch("/api/integrations/notion", { method: "POST" });
      const data = await res.json();
      if (!res.ok) toast.error(friendlyError(data.error, "No se pudo activar Notion"));
      else toast.success(`Notion: ${data.count ?? 0} deberes`);
      await refreshStatuses();
      router.refresh();
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setBusy(null);
    }
  };

  const disconnectNotion = async () => {
    if (!window.confirm("¿Desactivar la sincronización con Notion?")) return;
    setBusy("notion_deberes");
    try {
      const res = await fetch("/api/integrations/notion", { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(friendlyError(data.error, "No se pudo desactivar Notion"));
        return;
      }
      await refreshStatuses();
      toast.success("Notion desactivado");
      router.refresh();
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setBusy(null);
    }
  };

  const syncAll = async () => {
    setBusy("all");
    try {
      await Promise.all([
        fetch("/api/integrations/google", { method: "POST" }),
        fetch("/api/integrations/notion", { method: "POST" }),
      ]);
      await refreshStatuses();
      toast.success("Sincronización solicitada");
      router.refresh();
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <GlassCard className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="silk">integraciones · agenda</p>
        <LcButton
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy === "all"}
          onClick={syncAll}
        >
          <RefreshCw className="size-3.5 mr-1" />
          Sync todo
        </LcButton>
      </div>

      <ul className="space-y-3">
        {rows.map((row) => {
          const on = row.connected;
          const loading = busy === row.provider || busy === "all";
          return (
            <li
              key={row.provider}
              className="border border-border rounded-[var(--r-lg)] p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-sm">{labelForProvider(row.provider)}</p>
                <p className="text-xs text-muted-foreground">{row.message}</p>
                {row.last_synced_at && (
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">
                    última sync · {new Date(row.last_synced_at).toLocaleString("es-EC")}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`font-mono text-[10px] tracking-wide border rounded-[var(--pill)] px-2 py-1 ${
                    on
                      ? "border-success text-success bg-[color-mix(in_srgb,var(--success)_12%,transparent)]"
                      : row.status === "error"
                        ? "border-[var(--signal)] text-[var(--signal)]"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  {!row.configured
                    ? "sin configurar"
                    : on
                      ? "conectado"
                      : row.status === "error"
                        ? "error"
                        : "desconectado"}
                </span>
                {row.provider === "google_calendar" && row.configured && !on && (
                  <LcButton type="button" size="sm" variant="pri" disabled={loading} onClick={connectGoogle}>
                    Conectar
                  </LcButton>
                )}
                {row.provider === "google_calendar" && on && (
                  <>
                    <LcButton type="button" size="sm" variant="ghost" disabled={loading} onClick={syncGoogle}>
                      Sync
                    </LcButton>
                    <LcButton type="button" size="sm" variant="ghost" disabled={loading} onClick={disconnectGoogle}>
                      Desconectar
                    </LcButton>
                  </>
                )}
                {row.provider === "notion_deberes" && row.configured && !on && (
                  <LcButton type="button" size="sm" variant="pri" disabled={loading} onClick={connectNotion}>
                    Activar
                  </LcButton>
                )}
                {row.provider === "notion_deberes" && on && (
                  <LcButton type="button" size="sm" variant="ghost" disabled={loading} onClick={disconnectNotion}>
                    Desactivar
                  </LcButton>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}

export function IntegrationBadges({ statuses }: { statuses: IntegrationStatus[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((b) => (
        <span
          key={b.provider}
          className={`font-mono text-[10px] tracking-wide border rounded-[var(--pill)] px-2 py-1 ${
            b.connected
              ? "border-success text-success bg-[color-mix(in_srgb,var(--success)_12%,transparent)]"
              : b.status === "error"
                ? "border-[var(--signal)] text-[var(--signal)]"
                : "border-border text-muted-foreground"
          }`}
        >
          {labelForProvider(b.provider)} ·{" "}
          {!b.configured
            ? "sin configurar"
            : b.connected
              ? "conectado"
              : b.status === "error"
                ? "error"
                : "desconectado"}
        </span>
      ))}
    </div>
  );
}