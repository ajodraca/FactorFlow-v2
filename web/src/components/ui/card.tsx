import { type VariantProps, cva } from "class-variance-authority";
import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "./utils";

/**
 * Vendored shadcn/ui `card` (component design 2.1), with the shipped classes
 * that resolve to Tailwind default literals replaced by token-backed ones
 * (AC-26). The `metric` and `summary` variants add `CardMetricValue` and
 * `CardSummaryList` (DEC-0297). The title is a real level-2 heading; a caller
 * needing another level composes its own heading inside `CardHeader`.
 */
const cardVariants = cva("rounded border border-border bg-card text-card-foreground", {
  variants: {
    variant: { default: "", metric: "", summary: "" },
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      data-variant={variant}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

/** The `metric` variant's one large number (UX design 10: `--text-2xl`, `--font-numeric`). */
export const CardMetricValue = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("font-numeric text-2xl", className)} {...props} />
));
CardMetricValue.displayName = "CardMetricValue";

/** The `summary` variant's description list; callers supply the `dt` and `dd` children. */
export const CardSummaryList = forwardRef<HTMLDListElement, HTMLAttributes<HTMLDListElement>>(
  ({ className, ...props }, ref) => (
    <dl ref={ref} className={cn("grid grid-cols-2 gap-x-4 gap-y-2", className)} {...props} />
  ),
);
CardSummaryList.displayName = "CardSummaryList";
