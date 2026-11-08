import { type ComponentProps, forwardRef, useId } from "react";
import { cn } from "./utils";

/**
 * Vendored shadcn/ui `input` (component design 2.1) with the `text` and
 * `numeric` variants (DEC-0300). The shipped height, radius, ring offset,
 * breakpoint text size and file-input classes are replaced by token-backed
 * ones (AC-26), and the control meets the minimum control height.
 *
 * `numeric` is right-aligned in tabular figures and may carry a non-editable
 * `suffix`, which is part of the accessible name (DAC-E1-S2-2, DEC-0299): the
 * input is named by `aria-labelledby` listing the caller's label id and then
 * the suffix id. Inside `FormControl` the label id is supplied for you. A
 * suffixed input used outside `FormControl` must be given `aria-labelledby`
 * naming its label.
 */
export type InputProps = Omit<ComponentProps<"input">, "ref"> & {
  variant?: "text" | "numeric";
  suffix?: string;
};

const BASE =
  "h-7 w-full rounded border border-input bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "text", suffix, type, "aria-labelledby": ariaLabelledby, ...props }, ref) => {
    const suffixId = useId();
    const field = (
      <input
        ref={ref}
        type={variant === "numeric" ? "number" : type}
        inputMode={variant === "numeric" ? "numeric" : props.inputMode}
        data-variant={variant}
        aria-labelledby={
          suffix ? [ariaLabelledby, suffixId].filter(Boolean).join(" ") : ariaLabelledby
        }
        className={cn(BASE, variant === "numeric" && "text-right font-numeric", className)}
        {...props}
      />
    );
    if (!suffix) {
      return field;
    }
    return (
      <div className="flex items-center gap-2">
        {field}
        <span id={suffixId} className="text-base text-muted-foreground">
          {suffix}
        </span>
      </div>
    );
  },
);
Input.displayName = "Input";
