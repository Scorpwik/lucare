"use client";

import * as React from "react";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { friendlyError } from "@/lib/feedback";
import {
  getLastHealthConnectSync,
  isHealthConnectNative,
  syncHealthConnect,
} from "@/lib/native/health-connect";
import { Activity } from "lucide-react";
import { toast } from "sonner";

function formatLastSync(iso: string | null): string {
  if (!iso) return "Nunca";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Nunca";
  return d.toLocaleString("es-EC", { dateStyle: "short", timeStyle: "short" });
}

export function HealthConnectSyncPanel() {
  const [native, setNative] = React.useState<boolean | null>(null);
  const [lastSync, setLastSync] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [counts, setCounts] = React.useState<{
    steps: number;
    sleep: number;
    heart_rate: number;
    weight: number;
  } | null>(null);

  React.useEffect(() => {
    void (async () => {
      const isNative = await isHealthConnectNative();
      setNative(isNative);
      setLastSync(getLastHealthConnectSync());
    })();
  }, []);

  const onSync = async () => {
    setBusy(true);
    try {
      const result = await syncHealthConnect();
      setLastSync(getLastHealthConnectSync());
      if (result.error) {
        toast.error(friendlyError(result.error, "No se pudo sincronizar"));
        return;
      }
      setCounts(result.applied);
      toast.success(
        `Sincronizado: ${result.applied.steps} pasos, ${result.applied.sleep} sueño, ${result.applied.heart_rate} pulso, ${result.applied.weight} peso`,
      );
      if (result.errors?.length) {
        toast.message("Algunos registros no se guardaron", {
          description: result.errors[0],
        });
      }
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  if (native === null) {
    return null;
  }

  return (
    <GlassCard className="p-4 mt-4 space-y-3">
      <div>
        <p className="silk mb-1">salud · health connect</p>
        <p className="text-xs text-muted-foreground">
          {native
            ? "Sincroniza pasos, sueño, pulso y peso desde Health Connect en tu dispositivo Android."
            : "Disponible en la app Android de LuCare (Capacitor). En el navegador solo puedes importar CSV."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>Última sync: {formatLastSync(lastSync)}</span>
        {counts && (
          <span className="font-mono">
            pasos {counts.steps} · sueño {counts.sleep} · pulso {counts.heart_rate} · peso{" "}
            {counts.weight}
          </span>
        )}
      </div>

      <LcButton
        type="button"
        size="sm"
        disabled={!native || busy}
        onClick={() => void onSync()}
      >
        <Activity className="size-3.5 mr-1" />
        Sincronizar con Health Connect
      </LcButton>
    </GlassCard>
  );
}