import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef, useId } from "react";
import { cn } from "./utils";

/**
 * Vendored shadcn/ui `radio-group` over Radix (component design 2.1), with the
 * `cards` variant (DEC-0300). The group is one tab stop and the arrow keys move
 * the selection (AC-25). `orientation` is deliberately left unset: the cards sit
 * in a row, but Radix ignores the vertical arrows under a horizontal
 * orientation, and the keyboard contract needs both axes.
 *
 * shadcn's bare `RadioGroupItem` is replaced by `RadioGroupCard`, the Radix item
 * itself drawn as a bordered card so the whole card is the click target. Its
 * accessible name is the title and its description the explanatory line
 * (radio-group spec sections 3 and 5). Name the group with `aria-label`, or put
 * it inside `FormControl` under a `FormLabel`.
 */
export type RadioGroupProps = ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
  variant?: "cards";
};

export const RadioGroup = forwardRef<ElementRef<typeof RadioGroupPrimitive.Root>, RadioGroupProps>(
  ({ className, variant = "cards", ...props }, ref) => (
    <RadioGroupPrimitive.Root
      ref={ref}
      data-variant={variant}
      className={cn("grid grid-flow-col auto-cols-fr gap-3", className)}
      {...props}
    />
  ),
);
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

export type RadioGroupCardProps = Omit<
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
  "children" | "title"
> & {
  /** The option's name, and the card's accessible name. */
  title: string;
  /** The explanatory line under the title, and the card's accessible description. */
  description: string;
};

export const RadioGroupCard = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupCardProps
>(({ className, title, description, ...props }, ref) => {
  const titleId = useId();
  const descriptionId = useId();
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={cn(
        "flex items-start gap-2 rounded border border-border bg-background p-4 text-left focus-visible:outline-none focus-visible:ring focus-visible:ring-ring data-[state=checked]:ring-1 data-[state=checked]:ring-foreground",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-input"
      >
        <RadioGroupPrimitive.Indicator>
          <Circle className="h-2 w-2 fill-current text-primary" />
        </RadioGroupPrimitive.Indicator>
      </span>
      <span>
        <span id={titleId} className="block font-semibold">
          {title}
        </span>
        <span id={descriptionId} className="block text-xs text-muted-foreground">
          {description}
        </span>
      </span>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupCard.displayName = "RadioGroupCard";
