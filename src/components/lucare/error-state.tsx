import { cn } from "@/lib/utils";
import { LcButton } from "./lc-button";

type ErrorStateProps = {
  message: string;
  retry?: () => void;
  className?: string;
};

export function ErrorState({ message, retry, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-4 rounded-[var(--r)] border border-dashed border-danger text-danger bg-[color-mix(in_srgb,var(--danger)_7%,transparent)]",
        className,
      )}
      role="alert"
    >
      <p className="text-sm font-medium">{message}</p>
      {retry && (
        <LcButton variant="ghost" size="sm" type="button" onClick={retry}>
          Reintentar
        </LcButton>
      )}
    </div>
  );
}