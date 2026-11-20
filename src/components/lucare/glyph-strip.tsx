import { cn } from "@/lib/utils";

type GlyphStripProps = {
  active?: number;
  total?: number;
  className?: string;
  pulse?: boolean;
};

export function GlyphStrip({
  active = 3,
  total = 7,
  className,
  pulse = true,
}: GlyphStripProps) {
  return (
    <div className={cn("flex gap-1 h-3.5 my-3", className)} aria-hidden>
      {Array.from({ length: total }).map((_, i) => (
        <i
          key={i}
          className={cn(
            "flex-1 rounded-md h-full bg-muted shadow-[inset_0_1px_1px_rgba(0,0,0,0.12)]",
            i < active &&
              "bg-led shadow-[0_0_8px_color-mix(in_srgb,var(--led)_70%,transparent),inset_0_1px_0_rgba(255,255,255,0.35)]",
            i < active && pulse && "animate-[pulse_1.4s_ease-in-out_infinite]",
          )}
        />
      ))}
    </div>
  );
}