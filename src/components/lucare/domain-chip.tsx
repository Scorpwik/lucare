import { cn } from "@/lib/utils";

const domainColors: Record<string, string> = {
  gym: "var(--gym)",
  skin: "var(--skin)",
  sleep: "var(--sleep)",
  pill: "var(--pillc)",
  default: "var(--foreground)",
};

type DomainChipProps = {
  label: string;
  domain?: keyof typeof domainColors | "default";
  fun?: boolean;
  className?: string;
};

export function DomainChip({
  label,
  domain = "default",
  fun,
  className,
}: DomainChipProps) {
  const dot = domainColors[domain] ?? domainColors.default;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[11px] border px-2.5 py-1.5 rounded-[var(--pill)] shadow-[var(--shadow-1)]",
        fun
          ? "bg-amber text-amber-ink border-transparent font-semibold"
          : "border-border bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] text-foreground",
        className,
      )}
    >
      <i
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: fun ? "currentColor" : dot }}
        aria-hidden
      />
      {label}
    </span>
  );
}