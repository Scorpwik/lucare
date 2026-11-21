"use client";

import * as React from "react";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isDemoModeClient } from "@/lib/env";
import { friendlyError } from "@/lib/feedback";
import { toast } from "sonner";

export function PasswordSettingsPanel() {
  const demo = isDemoModeClient();
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [fieldError, setFieldError] = React.useState<string | null>(null);

  const validate = (): boolean => {
    if (password.length < 8) {
      setFieldError("La contraseña debe tener al menos 8 caracteres.");
      return false;
    }
    if (password !== confirm) {
      setFieldError("Las contraseñas no coinciden.");
      return false;
    }
    setFieldError(null);
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (demo) return;
    if (!validate()) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase no configurado.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(friendlyError(error));
      return;
    }
    toast.success("Contraseña actualizada");
    setPassword("");
    setConfirm("");
  };

  return (
    <GlassCard className="p-4 mt-4">
      <p className="silk mb-1">seguridad</p>
      <h2 className="font-dot font-black text-2xl mb-2">Cambiar contraseña</h2>
      {demo ? (
        <p className="text-sm text-muted-foreground">
          En modo demo no hay cuenta con contraseña. Desactiva el demo para usar Supabase.
        </p>
      ) : (
        <form className="space-y-4 max-w-md" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="settings-new-pw">Nueva contraseña</Label>
            <Input
              id="settings-new-pw"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              aria-invalid={!!fieldError}
            />
          </div>
          <div>
            <Label htmlFor="settings-confirm-pw">Confirmar contraseña</Label>
            <Input
              id="settings-confirm-pw"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              aria-invalid={!!fieldError}
            />
            {fieldError && (
              <p className="text-xs text-danger mt-1" role="alert">
                {fieldError}
              </p>
            )}
          </div>
          <LcButton type="submit" variant="pri" disabled={loading}>
            {loading ? "Guardando…" : "Actualizar contraseña"}
          </LcButton>
        </form>
      )}
    </GlassCard>
  );
}