"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const lcButtonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-[var(--pill)] cursor-pointer font-medium text-[13px] transition-[transform,box-shadow] duration-180 [transition-timing-function:var(--ease-lift)] focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:opacity-45 disabled:cursor-not-allowed disabled:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  {
    variants: {
      variant: {
        default:
          "bg-linear-to-b from-[color-mix(in_srgb,var(--foreground)_92%,#fff)] to-foreground text-background shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_1px_0_color-mix(in_srgb,var(--foreground)_70%,#000),0_4px_10px_rgba(22,20,18,0.12)] active:translate-y-px active:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_0_color-mix(in_srgb,var(--foreground)_70%,#000)]",
        pri: "bg-linear-to-b from-[#e4454e] to-primary text-primary-foreground border-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_0_#8a121c,0_6px_14px_rgba(197,30,42,0.28)] active:translate-y-px active:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_0_#8a121c]",
        ghost:
          "bg-transparent text-foreground border border-border shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:bg-surface/60 active:translate-y-px",
      },
      size: {
        default: "",
        sm: "min-h-[36px] px-3 text-xs",
        lg: "min-h-[48px] px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface LcButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof lcButtonVariants> {
  asChild?: boolean;
}

export const LcButton = React.forwardRef<HTMLButtonElement, LcButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(lcButtonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
LcButton.displayName = "LcButton";