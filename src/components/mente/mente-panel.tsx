"use client";

import * as React from "react";
import type { JournalEntry, MoodLog } from "@/lib/types";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientAddJournal, clientUpsertMood } from "@/lib/data/mind-client";
import { getDemoState } from "@/lib/demo-store";
import { useClientNow } from "@/lib/use-client-time";
import { toast } from "sonner";

type Props = {
  initialMoods: MoodLog[];
  initialJournal: JournalEntry[];
};

const MOOD_LABELS = ["Muy bajo", "Bajo", "Neutral", "Bien", "Excelente"];

export function MentePanel({ initialMoods, initialJournal }: Props) {
  const now = useClientNow();
  const today = now?.toISOString().slice(0, 10) ?? "";
  const [moods, setMoods] = React.useState(initialMoods);
  const [journal, setJournal] = React.useState(initialJournal);
  const [mood, setMood] = React.useState(4);
  const [stress, setStress] = React.useState(2);
  const [note, setNote] = React.useState("");
  const [journalBody, setJournalBody] = React.useState("");
  const [breathPhase, setBreathPhase] = React.useState<"inhale" | "hold" | "exhale" | "idle">(
    "idle",
  );
  const [breathCount, setBreathCount] = React.useState(4);

  const saveMood = () => {
    clientUpsertMood({
      log_date: today,
      mood,
      stress,
      note: note || null,
    });
    setMoods(getDemoState().moodLogs);
    toast.success("Ánimo registrado");
  };

  const saveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalBody.trim()) return;
    clientAddJournal(journalBody.trim());
    setJournal(getDemoState().journalEntries);
    setJournalBody("");
    toast.success("Entrada guardada");
  };

  const runBreathing = () => {
    if (breathPhase !== "idle") return;
    const phases: Array<["inhale" | "hold" | "exhale", number]> = [
      ["inhale", 4],
      ["hold", 4],
      ["exhale", 4],
    ];
    let i = 0;
    const step = () => {
      if (i >= phases.length) {
        setBreathPhase("idle");
        setBreathCount(4);
        return;
      }
      const [phase, sec] = phases[i]!;
      setBreathPhase(phase);
      setBreathCount(sec);
      let left = sec;
      const tick = window.setInterval(() => {
        left -= 1;
        setBreathCount(left);
        if (left <= 0) {
          window.clearInterval(tick);
          i += 1;
          step();
        }
      }, 1000);
    };
    step();
  };

  const todayMood = moods.find((m) => m.log_date === today);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <GlassCard className="p-4 space-y-4">
        <p className="silk">check-in de ánimo</p>
        <p className="font-dot font-black text-4xl">
          {todayMood ? MOOD_LABELS[todayMood.mood - 1] : "Sin registro"}
        </p>
        <Card>
          <Label>Estado (1–5)</Label>
          <Input
            type="range"
            min={1}
            max={5}
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
          />
          <p className="text-xs font-mono text-muted-foreground">{MOOD_LABELS[mood - 1]}</p>
        </Card>
        <Card>
          <Label>Estrés (1–5)</Label>
          <Input
            type="range"
            min={1}
            max={5}
            value={stress}
            onChange={(e) => setStress(Number(e.target.value))}
          />
        </Card>
        <div>
          <Label>Nota breve</Label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <LcButton type="button" variant="pri" onClick={saveMood}>
          Guardar ánimo
        </LcButton>
      </GlassCard>

      <div className="space-y-4">
        <GlassCard className="p-4 space-y-3">
          <p className="silk">respiración 4-4-4</p>
          <p className="font-dot font-black text-5xl tabular-nums text-center">
            {breathCount}
          </p>
          <p className="text-sm text-center capitalize text-muted-foreground">
            {breathPhase === "idle" ? "Listo" : breathPhase}
          </p>
          <LcButton
            type="button"
            variant="pri"
            className="w-full"
            disabled={breathPhase !== "idle"}
            onClick={runBreathing}
          >
            Iniciar ciclo
          </LcButton>
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
          <ul className="mt-4 text-xs text-muted-foreground space-y-2 max-h-32 overflow-y-auto">
            {journal.slice(0, 5).map((j) => (
              <li key={j.id} className="border-b border-border pb-1">
                {j.body}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1">{children}</div>;
}