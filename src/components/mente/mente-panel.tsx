"use client";

import * as React from "react";
import type { JournalEntry, MoodLog } from "@/lib/types";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  clientAddJournal,
  clientDeleteJournal,
  clientScheduleMoodCheckIn,
  clientUpsertMood,
} from "@/lib/data/mind-client";
import { getDemoState } from "@/lib/demo-store";
import { isDemoModeClient } from "@/lib/env";
import { useClientNow } from "@/lib/use-client-time";
import { confirmDelete } from "@/lib/feedback";
import { toast } from "sonner";

type Props = {
  initialMoods: MoodLog[];
  initialJournal: JournalEntry[];
};

const MOOD_LABELS = ["Muy bajo", "Bajo", "Neutral", "Bien", "Excelente"];
const PHASE_LABELS: Record<string, string> = {
  inhale: "Inhala",
  hold: "Sostén",
  exhale: "Exhala",
  idle: "Listo",
};

export function MentePanel({ initialMoods, initialJournal }: Props) {
  const now = useClientNow();
  const today = now?.toISOString().slice(0, 10) ?? "";
  const [moods, setMoods] = React.useState(initialMoods);
  const [journal, setJournal] = React.useState(initialJournal);
  const bootstrapToday = initialMoods[0]?.log_date ?? "";
  const bootstrapMood = initialMoods.find((m) => m.log_date === bootstrapToday);
  const [mood, setMood] = React.useState(bootstrapMood?.mood ?? 4);
  const [stress, setStress] = React.useState(bootstrapMood?.stress ?? 2);
  const [note, setNote] = React.useState(bootstrapMood?.note ?? "");
  const [journalBody, setJournalBody] = React.useState("");
  const [moodReminder, setMoodReminder] = React.useState({
    enabled: false,
    time: "20:00",
  });

  const [breathPhase, setBreathPhase] = React.useState<"inhale" | "hold" | "exhale" | "idle">(
    "idle",
  );
  const [breathCount, setBreathCount] = React.useState(4);
  const [roundsLeft, setRoundsLeft] = React.useState(0);
  const [roundsTarget, setRoundsTarget] = React.useState(3);
  const breathTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const breathRunningRef = React.useRef(false);

  const todayMood = moods.find((m) => m.log_date === today);

  const refreshDemo = () => {
    const s = getDemoState();
    setMoods(s.moodLogs);
    setJournal(s.journalEntries);
  };

  const saveMood = async () => {
    const row = await clientUpsertMood({
      log_date: today,
      mood,
      stress,
      note: note || null,
    });
    if (!isDemoModeClient() && row) {
      setMoods((prev) => {
        const idx = prev.findIndex((m) => m.log_date === today);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = row;
          return next;
        }
        return [row, ...prev];
      });
    } else {
      refreshDemo();
    }
    if (moodReminder.enabled) {
      await clientScheduleMoodCheckIn({ reminder_time: moodReminder.time });
    }
    toast.success("Ánimo registrado");
  };

  const saveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalBody.trim()) return;
    const row = await clientAddJournal(journalBody.trim());
    if (!isDemoModeClient() && row) {
      setJournal((prev) => [row, ...prev]);
    } else {
      refreshDemo();
    }
    setJournalBody("");
    toast.success("Entrada guardada");
  };

  const removeJournal = async (id: string) => {
    if (!confirmDelete("¿Eliminar esta entrada del journal?")) return;
    const ok = await clientDeleteJournal(id);
    if (!ok) {
      toast.error("No se pudo eliminar");
      return;
    }
    if (isDemoModeClient()) refreshDemo();
    else setJournal((prev) => prev.filter((j) => j.id !== id));
    toast.success("Entrada eliminada");
  };

  const stopBreathing = React.useCallback(() => {
    breathRunningRef.current = false;
    if (breathTimerRef.current) {
      clearInterval(breathTimerRef.current);
      breathTimerRef.current = null;
    }
    setBreathPhase("idle");
    setBreathCount(4);
    setRoundsLeft(0);
  }, []);

  const runBreathing = () => {
    if (breathRunningRef.current) return;
    breathRunningRef.current = true;
    let rounds = roundsTarget;
    setRoundsLeft(rounds);

    const phases: Array<["inhale" | "hold" | "exhale", number]> = [
      ["inhale", 4],
      ["hold", 4],
      ["exhale", 4],
    ];

    let phaseIndex = 0;

    const runPhase = () => {
      if (!breathRunningRef.current) return;
      if (phaseIndex >= phases.length) {
        rounds -= 1;
        if (rounds <= 0) {
          stopBreathing();
          toast.success("Ciclo de respiración completado");
          return;
        }
        setRoundsLeft(rounds);
        phaseIndex = 0;
      }
      const [phase, sec] = phases[phaseIndex]!;
      setBreathPhase(phase);
      setBreathCount(sec);
      let left = sec;
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
      breathTimerRef.current = setInterval(() => {
        if (!breathRunningRef.current) return;
        left -= 1;
        setBreathCount(left);
        if (left <= 0) {
          if (breathTimerRef.current) clearInterval(breathTimerRef.current);
          phaseIndex += 1;
          runPhase();
        }
      }, 1000);
    };

    runPhase();
  };

  React.useEffect(() => () => stopBreathing(), [stopBreathing]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <GlassCard className="p-4 space-y-4">
        <p className="silk">check-in de ánimo</p>
        <p className="font-dot font-black text-4xl">
          {todayMood ? MOOD_LABELS[todayMood.mood - 1] : "Sin registro hoy"}
        </p>
        <Field label="Estado (1–5)">
          <Input
            type="range"
            min={1}
            max={5}
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
          />
          <p className="text-xs font-mono text-muted-foreground">{MOOD_LABELS[mood - 1]}</p>
        </Field>
        <Field label="Estrés (1–5)">
          <Input
            type="range"
            min={1}
            max={5}
            value={stress}
            onChange={(e) => setStress(Number(e.target.value))}
          />
        </Field>
        <Field label="Nota breve">
          <Input value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <div className="flex items-center justify-between gap-2 border border-border rounded-md p-2">
          <Label>Recordatorio diario</Label>
          <Switch
            checked={moodReminder.enabled}
            onCheckedChange={(v) => setMoodReminder((r) => ({ ...r, enabled: v }))}
          />
        </div>
        {moodReminder.enabled && (
          <Input
            type="time"
            value={moodReminder.time}
            onChange={(e) => setMoodReminder((r) => ({ ...r, time: e.target.value }))}
          />
        )}
        <LcButton type="button" variant="pri" onClick={saveMood}>
          Guardar ánimo
        </LcButton>
      </GlassCard>

      <div className="space-y-4">
        <GlassCard className="p-4 space-y-3">
          <p className="silk">respiración 4-4-4</p>
          <div className="flex items-center justify-center gap-3 text-xs font-mono text-muted-foreground">
            <Label>Rondas</Label>
            <Input
              type="number"
              min={1}
              max={10}
              className="w-16 h-8"
              value={roundsTarget}
              disabled={breathPhase !== "idle"}
              onChange={(e) => setRoundsTarget(Math.max(1, Number(e.target.value)))}
            />
            {breathPhase !== "idle" && (
              <span className="text-foreground">Quedan {roundsLeft}</span>
            )}
          </div>
          <p className="font-dot font-black text-5xl tabular-nums text-center">{breathCount}</p>
          <p className="text-sm text-center text-muted-foreground">{PHASE_LABELS[breathPhase]}</p>
          <div className="flex gap-2">
            <LcButton
              type="button"
              variant="pri"
              className="flex-1"
              disabled={breathPhase !== "idle"}
              onClick={runBreathing}
            >
              Iniciar
            </LcButton>
            <LcButton
              type="button"
              variant="ghost"
              className="flex-1"
              disabled={breathPhase === "idle"}
              onClick={stopBreathing}
            >
              Detener
            </LcButton>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="silk mb-3">journal</p>
          <form className="space-y-3" onSubmit={saveJournal}>
            <textarea
              className="w-full min-h-24 rounded-md border border-border bg-surface px-3 py-2 text-sm"
              placeholder="¿Qué tienes en mente?"
              value={journalBody}
              onChange={(e) => setJournalBody(e.target.value)}
            />
            <LcButton type="submit" variant="pri" className="w-full">
              Guardar entrada
            </LcButton>
          </form>
          <ul className="mt-4 text-xs text-muted-foreground space-y-2 max-h-40 overflow-y-auto">
            {journal.length === 0 && (
              <li className="text-sm">Sin entradas — escribe una nota breve.</li>
            )}
            {journal.slice(0, 12).map((j) => (
              <li key={j.id} className="border-b border-border pb-2 flex justify-between gap-2">
                <span className="flex-1">{j.body}</span>
                <button
                  type="button"
                  className="text-destructive shrink-0"
                  onClick={() => removeJournal(j.id)}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}