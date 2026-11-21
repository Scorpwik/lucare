"use client";

import * as React from "react";
import { AI_MEDICAL_DISCLAIMER } from "@/lib/ai/prompts";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { friendlyError } from "@/lib/feedback";
import { toast } from "sonner";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isDemo?: boolean;
};

export function AsistenteChat({ className }: { className?: string }) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hola, soy tu asistente LuCare. Pregunta por tu sueño, hábitos, entrenamiento o agenda de hoy.",
      isDemo: true,
    },
  ]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    const uiMessages = [...messages.filter((m) => m.id !== "welcome"), userMsg].map((m) => ({
      id: m.id,
      role: m.role,
      parts: [{ type: "text" as const, text: m.content }],
    }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: uiMessages }),
      });
      const data = (await res.json()) as {
        content?: string;
        isDemo?: boolean;
        error?: string;
      };
      if (!res.ok) {
        if (res.status === 429) {
          toast.error("Demasiados mensajes. Espera un momento e inténtalo de nuevo.");
        } else {
          toast.error(friendlyError(data.error, "No se pudo enviar el mensaje"));
        }
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.content ?? "",
          isDemo: data.isDemo,
        },
      ]);
    } catch (e) {
      toast.error(friendlyError(e, "Sin conexión. Revisa tu internet."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassCard className={`p-4 flex flex-col min-h-[min(32rem,60dvh)] lg:min-h-0 lg:h-full ${className ?? ""}`}>
      <p className="silk mb-1 shrink-0">conversación</p>
      <p className="text-[10px] text-muted-foreground mb-3 shrink-0">{AI_MEDICAL_DISCLAIMER}</p>
      <div className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-1 mb-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.role === "user"
                ? "ml-8 rounded-[var(--pill)] bg-[color-mix(in_srgb,var(--led)_10%,var(--surface))] px-3 py-2 text-sm"
                : "mr-6 border border-border rounded-[var(--pill)] px-3 py-2 text-sm bg-surface"
            }
          >
            <p className="font-mono text-[10px] text-muted-foreground mb-1">
              {m.role === "user" ? "Tú" : "LuCare"}
              {m.isDemo && " · demo"}
            </p>
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form
        className="flex gap-2 shrink-0"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta algo sobre tus datos…"
          disabled={busy}
          aria-label="Mensaje para el asistente"
        />
        <LcButton type="submit" size="sm" disabled={busy || !input.trim()} aria-label="Enviar">
          <Send className="size-4" />
        </LcButton>
      </form>
    </GlassCard>
  );
}