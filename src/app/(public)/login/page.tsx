"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isDemoModeClient } from "@/lib/env";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<"signin" | "signup">("signin");
  const demo = isDemoModeClient();

  const demoLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      if (!res.ok) throw new Error("No se pudo iniciar demo");
      router.replace("/hoy");
      router.refresh();
    } catch {
      toast.error("Error al entrar en modo demo");
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
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Revisa tu correo para el enlace mágico.");
  };

  const passwordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase no configurado.");
      return;
    }
    setLoading(true);
    if (authMode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) toast.error(error.message);
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
      setLoading(false);
      if (error) toast.error(error.message);
      else toast.success("Cuenta creada. Confirma tu correo si es necesario.");
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-6 space-y-6" raised>
        <div>
          <p className="silk">acceso · LuCare</p>
          <h1 className="font-dot font-black text-4xl mt-1">Entrar</h1>
        </div>

        {demo && (
          <LcButton type="button" variant="pri" className="w-full" disabled={loading} onClick={demoLogin}>
            Entrar en modo demo
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
                />
              </div>
              <LcButton type="submit" variant="pri" className="w-full" disabled={loading}>
                Enviar enlace mágico
              </LcButton>
            </form>

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
                />
              </div>
              <LcButton type="submit" variant="pri" className="w-full" disabled={loading}>
                {authMode === "signin" ? "Entrar con correo y contraseña" : "Crear cuenta"}
              </LcButton>
            </form>
          </div>
        )}

        {demo && (
          <p className="text-xs text-muted-foreground text-center">
            Modo demo activo — datos locales, sin Supabase.
          </p>
        )}

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="underline-offset-2 hover:underline">
            Volver al inicio
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}