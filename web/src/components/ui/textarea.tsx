import { type ComponentProps, forwardRef } from "react";
import { cn } from "./utils";

/**
 * Vendored shadcn/ui `textarea` (component design 2.1) with the `list` variant
 * (DEC-0300). The shipped minimum height is replaced by the native `rows`
 * attribute, four by default, and resizing is suppressed. The browser already
 * inserts a newline on Enter, ignores Escape and leaves Tab to focus
 * navigation, so no key handler is added.
 *
 * The parse, the entry counter and the rejected-entry list belong to the
 * consuming screen, which composes its counter in a polite live region tied to
 * the field by `aria-describedby` (textarea spec section 5; story
 * CAP-003-E4-S3). This component carries the field rules only.
 */
export type TextareaProps = ComponentProps<"textarea"> & {
  variant?: "list";
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = "list", rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      data-variant={variant}
      className={cn(
        "flex w-full resize-none rounded border border-input bg-background px-[var(--cell-padding-x)] py-[var(--cell-padding-y)] text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
