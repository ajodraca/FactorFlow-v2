import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from "react";
import { cn } from "./utils";

/**
 * Vendored shadcn/ui `checkbox` over Radix (component design 2.1), with the
 * `default` variant (DEC-0300). Radix supplies the keyboard contract (Space
 * toggles, Enter does not) and `aria-checked`, including `mixed` for
 * `checked="indeterminate"` (AC-25). The shipped primary border, radius and
 * ring offset are replaced by token-backed classes (AC-26): the box border is
 * the input token and the primary fill appears only when checked or mixed
 * (checkbox spec sections 5 and 6). The corners stay square because the
 * default radius on a box this size would draw a circle.
 *
 * The tri-state is controlled: pass `checked="indeterminate"` to show the dash.
 *
 * The box is 16 px. The spec's 24 px target is the consumer's: put the box and
 * its label in a row with `minHeight: "var(--control-min-target)"`, as the
 * Research filters pane does.
 */
export type CheckboxProps = ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
  variant?: "default";
};

export const Checkbox = forwardRef<ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      data-variant={variant}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-none border border-input bg-background focus-visible:outline-none focus-visible:ring focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {props.checked === "indeterminate" ? (
          <Minus className="h-4 w-4" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  ),
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
