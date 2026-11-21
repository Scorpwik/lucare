"use client";

import * as React from "react";
import type { PersonalCareRoutine, PersonalCareStep } from "@/lib/types";
import { GlassCard } from "@/components/lucare/glass-card";
import { LcButton } from "@/components/lucare/lc-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { clientUpsertPersonalRoutine } from "@/lib/data/personal-care-client";
import { getDemoState } from "@/lib/demo-store";
import { EmptyState } from "@/components/lucare/empty-state";
import { friendlyError } from "@/lib/feedback";
import { toast } from "sonner";

type Props = {
  routines: PersonalCareRoutine[];
  steps: PersonalCareStep[];
};

export function CuidadoPersonalPanel({ routines: initialRoutines, steps }: Props) {
  const [routines, setRoutines] = React.useState(initialRoutines);
  const [form, setForm] = React.useState({
    name: "",
    category: "general",
    reminder_enabled: false,
    reminder_start_time: "20:00",
    reminder_end_time: "22:00",
    reminder_interval_minutes: 60,
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await clientUpsertPersonalRoutine(null, form);
      setRoutines(getDemoState().personalCareRoutines);
      toast.success("Rutina guardada");
    } catch (err) {
      toast.error(friendlyError(err));
      return;
    }
    setForm({
      name: "",
      category: "general",
      reminder_enabled: false,
      reminder_start_time: "20:00",
      reminder_end_time: "22:00",
      reminder_interval_minutes: 60,
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(20rem,1fr))]">
      <GlassCard className="p-4 space-y-3">
        <p className="silk">rutinas</p>
        {routines.length === 0 && (
          <EmptyState
            title="Sin rutinas"
            description="Crea una rutina de cuidado personal con el formulario."
          />
        )}
        {routines.map((r) => (
          <article key={r.id} className="border-b border-border pb-3 text-sm">
            <p className="font-medium">{r.name}</p>
            <p className="font-mono text-xs text-muted-foreground uppercase">{r.category}</p>
            {r.reminder_enabled && (
              <p className="font-mono text-xs text-muted-foreground mt-1">
                {r.reminder_start_time?.slice(0, 5)}–{r.reminder_end_time?.slice(0, 5)} · cada{" "}
                {r.reminder_interval_minutes} min
              </p>
            )}
            <ul className="mt-1 text-xs text-muted-foreground">
              {steps
                .filter((s) => s.routine_id === r.id)
                .map((s) => (
                  <li key={s.id}>· {s.title}</li>
                ))}
            </ul>
          </article>
        ))}
      </GlassCard>
      <GlassCard className="p-4">
        <p className="silk mb-3">nueva rutina</p>
        <form className="space-y-3" onSubmit={save}>
          <Field>
            <Label>Nombre</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field>
            <Label>Categoría</Label>
            <Input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
          </Field>
          <fieldset className="space-y-2 border border-border rounded-[var(--r)] p-3">
            <legend className="text-xs font-mono text-muted-foreground px-1">
              Ventana de recordatorio
            </legend>
            <div className="flex justify-between items-center">
              <Label>Activar</Label>
              <Switch
                checked={form.reminder_enabled}
                onCheckedChange={(v) => setForm((f) => ({ ...f, reminder_enabled: v }))}
              />
            </div>
            {form.reminder_enabled && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="time"
                    value={form.reminder_start_time}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, reminder_start_time: e.target.value }))
                    }
                  />
                  <Input
                    type="time"
                    value={form.reminder_end_time}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, reminder_end_time: e.target.value }))
                    }
                  />
                </div>
                <Input
                  type="number"
                  min={5}
                  step={5}
                  value={form.reminder_interval_minutes}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      reminder_interval_minutes: Number(e.target.value),
                    }))
                  }
                />
              </>
            )}
          </fieldset>
          <LcButton type="submit" variant="pri" className="w-full">
            Guardar rutina
          </LcButton>
        </form>
      </GlassCard>
    </div>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1">{children}</div>;
}