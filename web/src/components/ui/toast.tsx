import type { ComponentProps } from "react";
import { type ExternalToast, Toaster as Sonner, toast as sonnerToast } from "sonner";

/**
 * Vendored shadcn/ui `sonner` (component design 2.1, 3; toast spec sections 4-5
 * and 7; UX design 0.6; DAC-E1-S3-2; DEC-0302).
 *
 * `Toaster` renders sonner's region in the light theme with a close button on
 * every toast; shadcn's `next-themes` hook is dropped (light theme only, and
 * `next-themes` is not an approved package). `toast` exposes `success`,
 * `warning` and `error`. `warning` and `error` persist until dismissed, so the
 * duration is not a caller option; `success` keeps sonner's default. There is no
 * `info` variant and no `important` option, so every toast stays in sonner's
 * polite region and none takes focus.
 */
type ToasterProps = ComponentProps<typeof Sonner>;

const Toaster = (props: ToasterProps) => (
  <Sonner
    theme="light"
    closeButton
    className="toaster group"
    toastOptions={{
      classNames: {
        toast:
          "group toast group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:border-border group-[.toaster]:rounded",
        description: "group-[.toast]:text-muted-foreground",
        actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
        success: "[&_[data-icon]]:text-status-good",
        warning: "[&_[data-icon]]:text-status-warning",
        error: "[&_[data-icon]]:text-status-critical",
      },
    }}
    {...props}
  />
);

type ToastOptions = Pick<ExternalToast, "description" | "action">;

const toast = {
  success: (message: string, options?: ToastOptions) => sonnerToast.success(message, options),
  warning: (message: string, options?: ToastOptions) =>
    sonnerToast.warning(message, { ...options, duration: Number.POSITIVE_INFINITY }),
  error: (message: string, options?: ToastOptions) =>
    sonnerToast.error(message, { ...options, duration: Number.POSITIVE_INFINITY }),
};

export { Toaster, toast };
