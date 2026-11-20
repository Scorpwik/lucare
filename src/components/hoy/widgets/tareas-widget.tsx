import { getServerDemoState } from "@/lib/demo-store";
import { GlassCard } from "@/components/lucare/glass-card";

export function TareasWidget() {
  const tasks = getServerDemoState().tasks.filter((t) => !t.completed);

  return (
    <GlassCard className="p-4">
      <p className="silk mb-1">tareas</p>
      <p className="font-dot font-black text-4xl tabular-nums">{tasks.length}</p>
      <ul className="mt-2 space-y-2 text-sm">
        {tasks.slice(0, 2).map((t) => (
          <li key={t.id} className="flex gap-2 items-start">
            <span className="size-[18px] border border-foreground rounded-md shrink-0 mt-0.5" />
            {t.title}
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}