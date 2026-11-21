import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";
import {
  GEMINI_FALLBACK_MODEL,
  aiGatewayConfigured,
  googleGenerativeAiConfigured,
  resolveAiGatewayModelId,
  resolveGeminiModelId,
} from "@/lib/env";

export type AiModelCandidate = {
  provider: "gemini" | "gateway";
  modelId: string;
  model: LanguageModel;
};

/** Candidatos en orden de prioridad: Gemini directo → AI Gateway. Solo servidor. */
export function resolveAiModelCandidates(): AiModelCandidate[] {
  const candidates: AiModelCandidate[] = [];
  if (googleGenerativeAiConfigured()) {
    // Google retira modelos para cuentas nuevas (404); el alias "latest" sirve de respaldo.
    const ids = [...new Set([resolveGeminiModelId(), GEMINI_FALLBACK_MODEL])];
    for (const modelId of ids) {
      candidates.push({ provider: "gemini", modelId, model: google(modelId) });
    }
  }
  if (aiGatewayConfigured()) {
    const modelId = resolveAiGatewayModelId();
    candidates.push({ provider: "gateway", modelId, model: modelId });
  }
  return candidates;
}

/** Modelo de texto según prioridad: Gemini directo → AI Gateway. Solo servidor. */
export function resolveAiModel(): LanguageModel {
  const [first] = resolveAiModelCandidates();
  return first?.model ?? resolveAiGatewayModelId();
}

function describeError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const extra = err as Error & { statusCode?: number; responseBody?: string };
  const status = extra.statusCode ? ` status=${extra.statusCode}` : "";
  const body = extra.responseBody ? ` body=${extra.responseBody.slice(0, 400)}` : "";
  return `${err.name}: ${err.message}${status}${body}`;
}

/**
 * Ejecuta `run` con cada proveedor configurado hasta que uno responda.
 * Registra el error de cada intento (sin secretos) para diagnosticar en Vercel.
 */
export async function runWithAiFallback<T>(
  label: string,
  run: (model: LanguageModel) => Promise<T>,
): Promise<T> {
  const candidates = resolveAiModelCandidates();
  if (candidates.length === 0) throw new Error("IA no configurada");
  let lastError: unknown;
  for (const c of candidates) {
    try {
      return await run(c.model);
    } catch (err) {
      lastError = err;
      console.error(`[ai:${label}] ${c.provider}/${c.modelId} falló: ${describeError(err)}`);
    }
  }
  throw lastError;
}
