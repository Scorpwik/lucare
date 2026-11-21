import { generateText, type UIMessage } from "ai";
import { demoChatReply } from "@/lib/ai/demo-copy";
import { CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { buildWellnessSnapshot } from "@/lib/ai/snapshot";
import { getServerDemoState } from "@/lib/demo-store";
import { runWithAiFallback } from "@/lib/ai/resolve-model";
import { aiConfigured, isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

async function chatRateKey(): Promise<string> {
  if (isDemoMode()) return `chat:demo:${getServerDemoState().userId}`;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return `chat:${user?.id ?? "anon"}`;
}

function extractQuestion(messages: UIMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  return (
    lastUser?.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join(" ")
      .trim() ?? ""
  );
}

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const key = await chatRateKey();
    const limited = checkRateLimit(key, 40, 60 * 60 * 1000);
    if (!limited.ok) {
      return Response.json(
        {
          error: "Demasiados mensajes. Intenta más tarde.",
          retryAfterSec: limited.retryAfterSec,
        },
        { status: 429 },
      );
    }

    const body = (await req.json()) as { messages: UIMessage[] };
    const question = extractQuestion(body.messages ?? []);
    const snapshot = await buildWellnessSnapshot();

    if (!aiConfigured()) {
      return Response.json({
        role: "assistant",
        content: demoChatReply(question, snapshot),
        isDemo: true,
      });
    }

    const conversation = (body.messages ?? [])
      .map((m) => {
        const text = m.parts
          ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join("\n");
        return `${m.role}: ${text ?? ""}`;
      })
      .join("\n");

    try {
      const { text } = await runWithAiFallback("chat", (model) =>
        generateText({
          model,
        system: `${CHAT_SYSTEM_PROMPT}\n\nContexto wellness (JSON):\n${JSON.stringify(snapshot)}`,
        prompt: conversation || question,
          maxOutputTokens: 600,
          temperature: 0.5,
        }),
      );

      return Response.json({
        role: "assistant",
        content: text.trim(),
        isDemo: false,
      });
    } catch (err) {
      console.error("[ai:chat] todos los proveedores fallaron; respuesta demo", err instanceof Error ? err.message : err);
      return Response.json({
        role: "assistant",
        content: demoChatReply(question, snapshot),
        isDemo: true,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return Response.json({ error: message }, { status: 500 });
  }
}