import { cn } from "@/lib/utils";

export function LoadingState({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-1.5 py-6 justify-center", className)} aria-busy>
      {[0, 1, 2].map((i) => (
        <i
          key={i}
          className="w-[7px] h-[7px] rounded-full bg-led shadow-[0_0_8px_var(--led)] animate-[blink_1s_infinite]"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
      <span className="sr-only">Cargando…</span>
    </div>
  );
}