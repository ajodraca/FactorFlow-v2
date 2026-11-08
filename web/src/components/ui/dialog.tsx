import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { type ReactNode, useRef } from "react";
import { Button } from "./button";

/**
 * Vendored shadcn/ui `alert-dialog` as the design system's `dialog` `confirm`
 * variant (component design 2.1; dialog spec sections 4, 5 and 7; DAC-E1-14;
 * DAC-E1-15; DEC-0301, DEC-0305).
 *
 * Radix AlertDialog supplies the focus trap and the Cancel-first focus. Two of
 * its defaults are overridden on purpose: the content is a `dialog`, not an
 * `alertdialog` (that role belongs to `destructive` and `real-money`, which are
 * not vendored), and it carries `aria-modal`, which Radix does not set. There
 * is no `variant` prop and no destructive styling: stopping following and
 * cancelling a download delete nothing.
 *
 * The confirm action is a plain button, not `AlertDialogPrimitive.Action`, so
 * the dialog stays open until the consumer knows the result and closes it. While
 * `pending`, nothing closes the dialog and the confirm action is
 * `aria-disabled`. `children` render between the description and the buttons,
 * where a refusal is kept inside the dialog.
 */
export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  /** True while the consumer waits for the result of the confirmed action. */
  pending?: boolean;
  children?: ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  pending = false,
  children,
}: ConfirmDialogProps) {
  // Radix returns focus only to a Trigger, and a confirmation is controlled by
  // its caller, so the opener is recorded when the dialog opens and refocused
  // when it closes. A removed opener leaves focus on the body for the consumer.
  const opener = useRef<HTMLElement | null>(null);

  const requestChange = (next: boolean) => {
    if (!next && pending) return;
    onOpenChange(next);
  };

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={requestChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay
          data-slot="overlay"
          className="fixed inset-0 z-50 bg-foreground/40"
          onClick={() => requestChange(false)}
        />
        <AlertDialogPrimitive.Content
          // biome-ignore lint/a11y/useSemanticElements: Radix AlertDialog renders an alertdialog; `confirm` must be a dialog (dialog spec section 5, DAC-E1-S3-1), so the role is overridden on the content.
          role="dialog"
          aria-modal="true"
          data-variant="confirm"
          aria-busy={pending || undefined}
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-prose translate-x-[-50%] translate-y-[-50%] gap-4 rounded border border-border bg-popover p-6 text-popover-foreground"
          onOpenAutoFocus={() => {
            opener.current =
              document.activeElement instanceof HTMLElement ? document.activeElement : null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (opener.current?.isConnected) opener.current.focus();
          }}
        >
          <div className="flex flex-col gap-2">
            <AlertDialogPrimitive.Title className="text-lg font-semibold">
              {title}
            </AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description className="text-base text-muted-foreground">
              {description}
            </AlertDialogPrimitive.Description>
          </div>
          {children}
          <div className="flex justify-end gap-2">
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogPrimitive.Cancel>
            <Button
              variant="default"
              aria-disabled={pending ? "true" : undefined}
              onClick={() => {
                if (!pending) onConfirm();
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
