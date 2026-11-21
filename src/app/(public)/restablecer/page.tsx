"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/feedback";
import { toast } from "sonner";

export default function RestablecerPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sessionChecked, setSessionChecked] = React.useState(false);
  const [hasSession, setHasSession] = React.useState(false);
  const [fieldError, setFieldError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      queueMicrotask(() => {
        setSessionChecked(true);
        setHasSession(false);
      });
      return;
    }
    void supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setSessionChecked(true);
    });
  }, []);

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
    router.replace("/hoy");
    router.refresh();
  };

  if (!sessionChecked) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <GlassCard className="w-full max-w-md p-6" raised>
          <p className="text-sm text-muted-foreground">Verificando enlace…</p>
        </GlassCard>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <GlassCard className="w-full max-w-md p-6 space-y-4" raised>
          <div>
            <p className="silk">acceso</p>
            <h1 className="font-dot font-black text-3xl mt-1">Enlace vencido</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Este enlace para restablecer la contraseña ya no es válido. Pide uno nuevo desde el
            inicio de sesión.
          </p>
          <Link href="/login" className="block">
            <LcButton type="button" variant="pri" className="w-full">
              Volver a iniciar sesión
            </LcButton>
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-6 space-y-6" raised>
        <div>
          <p className="silk">acceso</p>
          <h1 className="font-dot font-black text-4xl leading-none mt-1">Nueva contraseña</h1>
          <p className="text-sm text-muted-foreground mt-2">Elige una contraseña segura (mín. 8 caracteres).</p>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="new-password">Nueva contraseña</Label>
            <Input
              id="new-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!fieldError}
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirmar contraseña</Label>
            <Input
              id="confirm-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-invalid={!!fieldError}
            />
            {fieldError && (
              <p className="text-xs text-danger mt-1" role="alert">
                {fieldError}
              </p>
            )}
          </div>
          <LcButton type="submit" variant="pri" className="w-full" disabled={loading}>
            {loading ? "Guardando…" : "Guardar contraseña"}
          </LcButton>
        </form>
      </GlassCard>
    </div>
  );
}