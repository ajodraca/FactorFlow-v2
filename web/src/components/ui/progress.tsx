import * as ProgressPrimitive from "@radix-ui/react-progress";
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from "react";
import { cn } from "./utils";

/**
 * Vendored shadcn/ui `progress` (component design 2.1; progress spec sections
 * 3-6; DAC-E1-14; DAC-E1-S3-3; DEC-0303).
 *
 * The caller renders the visible text (such as "812 of 1,236 stocks") and
 * passes its id as `aria-labelledby`, which the type requires. The bar is
 * indeterminate exactly when `value` or `max` is `null`, so a caller can pass a
 * download's `done` and `total` unchanged. An indeterminate bar carries no
 * `aria-valuenow`.
 *
 * shadcn assumes a maximum of 100 when it positions the indicator; it is
 * positioned here from the caller's maximum. The spec slides the indeterminate
 * indicator, which needs keyframes this layer does not own, so it draws the
 * static hatch the spec prescribes for reduced motion and pulses it when motion
 * is allowed.
 */
type ProgressProps = Omit<
  ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
  "value" | "max"
> & {
  value: number | null;
  max?: number | null;
  "aria-labelledby": string;
};

const Progress = forwardRef<ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, max, ...props }, ref) => {
    const indeterminate = value === null || max === null;
    return (
      <ProgressPrimitive.Root
        ref={ref}
        value={indeterminate ? null : value}
        max={max ?? undefined}
        data-variant={indeterminate ? "indeterminate" : "determinate"}
        className={cn("relative h-2 w-full overflow-hidden rounded bg-seq-1", className)}
        {...props}
      >
        {indeterminate ? (
          <ProgressPrimitive.Indicator className="h-full w-full bg-pattern-indeterminate motion-safe:animate-pulse" />
        ) : (
          <ProgressPrimitive.Indicator
            className="h-full w-full flex-1 bg-status-active transition-all"
            style={{ transform: `translateX(-${100 - (value / (max ?? 100)) * 100}%)` }}
          />
        )}
      </ProgressPrimitive.Root>
    );
  },
);
Progress.displayName = "Progress";

export { Progress };
export type { ProgressProps };
