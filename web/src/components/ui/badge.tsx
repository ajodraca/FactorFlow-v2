import { type VariantProps, cva } from "class-variance-authority";
import type { HTMLAttributes, JSX } from "react";
import { cn } from "./utils";

/**
 * Vendored shadcn/ui `badge` (component design 2.1), with the shipped classes
 * that resolve to Tailwind default literals replaced by token-backed ones
 * (AC-26). A badge is never focusable and has no hover (badge spec section 4),
 * so the shipped focus ring and hover states are removed. The coverage
 * variants take the status and value tokens of badge spec section 6.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        "status-neutral": "bg-status-neutral-muted text-status-neutral",
        "status-active": "bg-status-active-muted text-status-active",
        "status-good": "bg-status-good-muted text-status-good",
        "status-warning": "bg-status-warning-muted text-status-warning",
        "status-serious": "bg-status-serious-muted text-status-serious",
        "status-critical": "bg-status-critical-muted text-status-critical",
        "coverage-present": "bg-status-good-muted text-status-good",
        "coverage-absent": "bg-value-missing-muted text-value-missing",
        "coverage-unknown":
          "bg-value-indeterminate-muted bg-pattern-indeterminate text-value-indeterminate",
        secondary: "bg-secondary text-secondary-foreground",
      },
    },
  },
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Required: every caller names its variant. */
  variant: BadgeVariant;
}

export function Badge({ className, variant, ...props }: BadgeProps): JSX.Element {
  return (
    <span data-variant={variant} className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
