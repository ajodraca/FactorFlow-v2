import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { type ButtonHTMLAttributes, type MouseEvent, forwardRef } from "react";
import { cn } from "./utils";

/**
 * Vendored shadcn/ui `button` (component design 2.1), with the shipped classes
 * that resolve to Tailwind default literals replaced by token-backed ones
 * (AC-26) and the `destructive`, `link` and `size` parts dropped.
 *
 * Use `blocked`, never `disabled`, where a precondition gates an action
 * (DAC-E1-15). A blocked button stays in the tab order, announces itself with
 * `aria-disabled` and does nothing on activation; the caller renders the
 * reason inline and points to it with `aria-describedby` (DAC-E1-14).
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded px-3 py-2 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        blocked: "border border-input bg-background text-muted-foreground cursor-not-allowed",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render the child element (such as a link) with the button's classes and behaviour. */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", asChild = false, onClick, ...props }, ref) => {
    const Component = asChild ? Slot : "button";
    const blocked = variant === "blocked";
    // A blocked button swallows activation: no handler runs and an enclosing
    // form is not submitted.
    const handleClick = blocked
      ? (event: MouseEvent<HTMLButtonElement>) => event.preventDefault()
      : onClick;
    return (
      <Component
        ref={ref}
        data-variant={variant}
        aria-disabled={blocked ? "true" : undefined}
        className={cn(buttonVariants({ variant }), className)}
        onClick={handleClick}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
