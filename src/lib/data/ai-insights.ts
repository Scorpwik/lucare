import { generateText } from "ai";
import { demoDailyInsight } from "@/lib/ai/demo-copy";
import { INSIGHT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import {
  buildWellnessSnapshot,
  snapshotToPromptText,
  type WellnessSnapshot,
} from "@/lib/ai/snapshot";
import { getServerDemoState, setServerDemoState } from "@/lib/demo-store";
import {
  aiGatewayConfigured,
  isDemoMode,
  resolveAiModel,
} from "@/lib/env";
import type { AiDailyInsight } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { dateInGuayaquil } from "@/lib/reminders";

export type DailyInsightResult = {
  content: string;
  insightDate: string;
  isDemo: boolean;
  cached: boolean;
};

async function getUserId(): Promise<string | null> {
  if (isDemoMode()) return getServerDemoState().userId;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function fetchCachedInsight(
  userId: string,
  insightDate: string,
): Promise<AiDailyInsight | null> {
  if (isDemoMode()) {
    return (
      getServerDemoState().aiDailyInsights.find(
        (i) => i.insight_date === insightDate,
      ) ?? null
    );
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_daily_insights")
    .select("*")
    .eq("user_id", userId)
    .eq("insight_date", insightDate)
    .maybeSingle();
  if (error) throw error;
  return (data as AiDailyInsight | null) ?? null;
}

async function storeInsight(
  userId: string,
  insightDate: string,
  content: string,
  isDemo: boolean,
): Promise<AiDailyInsight> {
  const t = new Date().toISOString();
  if (isDemoMode()) {
    const state = getServerDemoState();
    const existing = state.aiDailyInsights.find((i) => i.insight_date === insightDate);
    const row: AiDailyInsight = existing
      ? { ...existing, content, is_demo: isDemo, updated_at: t }
      : {
          id: crypto.randomUUID(),
          user_id: userId,
          insight_date: insightDate,
          content,
          is_demo: isDemo,
          created_at: t,
          updated_at: t,
        };
    state.aiDailyInsights = [
      ...state.aiDailyInsights.filter((i) => i.insight_date !== insightDate),
      row,
    ];
    setServerDemoState(state);
    return row;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_daily_insights")
    .upsert(
      {
        user_id: userId,
        insight_date: insightDate,
        content,
        is_demo: isDemo,
      },
      { onConflict: "user_id,insight_date" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data as AiDailyInsight;
}

async function generateLiveInsight(snapshot: WellnessSnapshot): Promise<string> {
  const { text } = await generateText({
    model: resolveAiModel(),
    system: INSIGHT_SYSTEM_PROMPT,
    prompt: `Fecha de hoy: ${snapshot.today}\n\nContexto JSON:\n${snapshotToPromptText(snapshot)}`,
    maxOutputTokens: 280,
    temperature: 0.6,
  });
  return text.trim();
}

export async function getDailyInsight(options?: {
  force?: boolean;
}): Promise<DailyInsightResult> {
  const insightDate = dateInGuayaquil();
  const userId = await getUserId();
  if (!userId) {
    return {
      content: "Inicia sesión para ver tu insight diario.",
      insightDate,
      isDemo: true,
      cached: false,
    };
  }

  if (!options?.force) {
    const cached = await fetchCachedInsight(userId, insightDate);
    if (cached) {
      return {
        content: cached.content,
        insightDate,
        isDemo: cached.is_demo,
        cached: true,
      };
    }
  }

  const snapshot = await buildWellnessSnapshot();
  const canUseAi = aiGatewayConfigured();

  let content: string;
  let isDemo: boolean;

  if (canUseAi) {
    try {
      content = await generateLiveInsight(snapshot);
      isDemo = false;
    } catch {
      content = demoDailyInsight(snapshot);
      isDemo = true;
    }
  } else {
    content = demoDailyInsight(snapshot);
    isDemo = true;
  }

  if (isDemoMode() && !canUseAi) {
    isDemo = true;
  }

  await storeInsight(userId, insightDate, content, isDemo);

  return { content, insightDate, isDemo, cached: false };
}