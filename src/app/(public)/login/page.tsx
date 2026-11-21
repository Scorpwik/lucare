"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isDemoModeClient } from "@/lib/env";
import { friendlyError } from "@/lib/feedback";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<"signin" | "signup">("signin");
  const [showForgot, setShowForgot] = React.useState(false);
  const [urlError, setUrlError] = React.useState<string | null>(null);
  const demo = isDemoModeClient();

  React.useEffect(() => {
    const err = new URLSearchParams(window.location.search).get("error");
    if (err === "auth" || err === "recovery") {
      queueMicrotask(() =>
        setUrlError("El enlace no es válido o venció. Pide uno nuevo."),
      );
    }
  }, []);

  const demoLogin = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/demo", { method: "POST" });
      router.replace("/hoy");
      router.refresh();
    } catch (e) {
      console.error(e);
      document.cookie = "lucare-demo-session=1; path=/; max-age=2592000; SameSite=Lax";
      router.replace("/hoy");
      toast.success("Sesión demo iniciada");
    } finally {
      setLoading(false);
    }
  };

  const magicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase no configurado.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) toast.error(friendlyError(error));
      else toast.success("Revisa tu correo para el enlace mágico.");
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase no configurado.");
      return;
    }
    if (!email.trim()) {
      toast.error("Escribe el correo de tu cuenta.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/restablecer`,
      });
      if (error) toast.error(friendlyError(error));
      else {
        toast.success("Si el correo existe, te enviamos un enlace para restablecer tu contraseña.");
        setShowForgot(false);
      }
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  const passwordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase no configurado.");
      return;
    }
    setLoading(true);
    try {
      if (authMode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) toast.error(friendlyError(error));
        else {
          router.replace("/hoy");
          router.refresh();
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) toast.error(friendlyError(error));
        else toast.success("Cuenta creada. Confirma tu correo si es necesario.");
      }
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-6 space-y-6" raised>
        <div>
          <p className="silk">acceso</p>
          <h1 className="font-dot font-black text-4xl leading-none mt-1">LuCare</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Tu panel de salud en Ecuador (America/Guayaquil).
          </p>
        </div>

        {urlError && (
          <p className="text-sm text-danger border border-danger/30 rounded-[var(--pill)] px-3 py-2" role="alert">
            {urlError}
          </p>
        )}

        {demo && (
          <LcButton
            type="button"
            variant="pri"
            className="w-full"
            disabled={loading}
            onClick={demoLogin}
          >
            {loading ? "Entrando…" : "Entrar en modo demo"}
          </LcButton>
        )}

        {!demo && (
          <div className="space-y-6">
            <form className="space-y-4" onSubmit={magicLink}>
              <p className="silk">enlace mágico</p>
              <div>
                <Label htmlFor="email-magic">Correo electrónico</Label>
                <Input
                  id="email-magic"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  disabled={loading}
                />
              </div>
              <LcButton type="submit" variant="pri" className="w-full" disabled={loading}>
                {loading ? "Enviando…" : "Enviar enlace mágico"}
              </LcButton>
            </form>

            {showForgot ? (
              <form className="space-y-4 border-t border-border pt-4" onSubmit={resetPassword}>
                <p className="silk">recuperar acceso</p>
                <p className="text-xs text-muted-foreground">
                  Te enviaremos un enlace al correo de tu cuenta.
                </p>
                <div>
                  <Label htmlFor="email-forgot">Correo</Label>
                  <Input
                    id="email-forgot"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="flex gap-2">
                  <LcButton type="submit" variant="pri" className="flex-1" disabled={loading}>
                    {loading ? "Enviando…" : "Enviar enlace"}
                  </LcButton>
                  <LcButton
                    type="button"
                    variant="ghost"
                    disabled={loading}
                    onClick={() => setShowForgot(false)}
                  >
                    Cancelar
                  </LcButton>
                </div>
              </form>
            ) : (
              <form className="space-y-4 border-t border-border pt-4" onSubmit={passwordAuth}>
                <div className="flex gap-2">
                  <LcButton
                    type="button"
                    size="sm"
                    variant={authMode === "signin" ? "pri" : "ghost"}
                    onClick={() => setAuthMode("signin")}
                  >
                    Iniciar sesión
                  </LcButton>
                  <LcButton
                    type="button"
                    size="sm"
                    variant={authMode === "signup" ? "pri" : "ghost"}
                    onClick={() => setAuthMode("signup")}
                  >
                    Registrarse
                  </LcButton>
                </div>
                <div>
                  <Label htmlFor="email-pw">Correo</Label>
                  <Input
                    id="email-pw"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  {authMode === "signin" && (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground underline mt-2 hover:text-foreground"
                      onClick={() => setShowForgot(true)}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <LcButton type="submit" variant="pri" className="w-full" disabled={loading}>
                  {loading
                    ? "Espera…"
                    : authMode === "signin"
                      ? "Entrar con correo y contraseña"
                      : "Crear cuenta"}
                </LcButton>
              </form>
            )}
          </div>
        )}

        {demo && (
          <p className="text-xs font-mono text-muted-foreground text-center">
            LUCARE_DEMO_MODE activo — sin claves de Supabase.
          </p>
        )}
      </GlassCard>
    </div>
  );
}