import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-center gap-1.5 p-4 rounded-[var(--r-lg)] border border-dashed border-border min-h-[84px] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] shadow-[var(--shadow-e0)]",
        className,
      )}
    >
      <p className="font-medium text-sm">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}