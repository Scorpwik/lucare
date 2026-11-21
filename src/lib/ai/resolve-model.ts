import { google } from "@ai-sdk/google";
import {
  googleGenerativeAiConfigured,
  resolveAiGatewayModelId,
  resolveGeminiModelId,
} from "@/lib/env";

/** Modelo de texto según prioridad: Gemini directo → AI Gateway. Solo servidor. */
export function resolveAiModel() {
  if (googleGenerativeAiConfigured()) {
    return google(resolveGeminiModelId());
  }
  return resolveAiGatewayModelId();
}