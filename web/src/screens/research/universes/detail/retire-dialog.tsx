import { type JSX, type KeyboardEvent, useEffect, useId, useRef } from "react";
import { DIALOGS, UNIVERSE_LIFECYCLE, failureSentence } from "../../copy";

/** The refusals the dialog states by code (classification-ui 2.7). */
export type RetireError = "universe_retired" | "generic";

const BUTTON = "rounded px-3 py-2 text-sm";

/** The alert sentence per refusal, selected by code and never by an envelope message. */
function errorSentence(error: RetireError): string {
  return error === "universe_retired"
    ? UNIVERSE_LIFECYCLE.retiredRefusal
    : failureSentence({
        operation: "retire-universe",
        resource: "universe",
        code: null,
      });
}

export interface RetireDialogProps {
  universeName: string;
  error: RetireError | null;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * The `dialog` `confirm` retire confirmation (UX design 1.4; classification-ui
 * 2.7; DAC-E1-S9-4, DAC-E1-7). `confirm`, never `destructive`: retiring
 * discards nothing, the members and history stay viewable (STD-UI-2). The
 * structure is `remove-dialog.tsx`'s and `screens/instruments/retire-dialog.tsx`'s:
 * a native `<dialog open>` with no overlay, its own Tab cycle between
 * **Cancel** and the confirm, Escape cancelling, initial focus on **Cancel**
 * and focus restored to the trigger on unmount.
 */
export function RetireDialog({
  universeName,
  error,
  pending,
  onConfirm,
  onCancel,
}: RetireDialogProps): JSX.Element {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => {
      previouslyFocused?.focus?.();
    };
  }, []);

  // The confirm is disabled while pending, and a browser either drops focus
  // from a control it disables or leaves it there with no Tab stop. Either
  // way focus is moved to Cancel, so Escape and the Tab cycle keep working.
  // The effect may run in the commit that sets `pending`, while focus is
  // still on the confirm, hence the explicit check (as `remove-dialog.tsx`).
  useEffect(() => {
    const active = document.activeElement;
    const strandedOnConfirm = pending && active !== null && active === confirmRef.current;
    if (dialogRef.current?.contains(active) && !strandedOnConfirm) {
      return;
    }
    cancelRef.current?.focus();
  }, [pending]);

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>): void {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
      return;
    }
    if (event.key !== "Tab") {
      return;
    }
    // Manual focus trap: `<dialog open>` gives none, and jsdom has no `showModal()`.
    const first = cancelRef.current;
    // A disabled confirm takes no focus, so Cancel is then the cycle's only stop.
    const last = confirmRef.current?.disabled ? first : confirmRef.current;
    if (first === null || last === null) {
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      open
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={pending ? "true" : undefined}
      onKeyDown={handleKeyDown}
      data-variant="confirm"
      className="fixed inset-0 m-auto flex flex-col gap-3 rounded border border-border bg-[hsl(var(--popover))] p-5 text-[hsl(var(--popover-foreground))]"
    >
      <h2 id={titleId} className="text-lg">
        {UNIVERSE_LIFECYCLE.retireTitle(universeName)}
      </h2>
      <p id={descriptionId}>{UNIVERSE_LIFECYCLE.retireDescription}</p>
      {error !== null ? (
        <p role="alert" className="text-[hsl(var(--destructive))] text-sm">
          {errorSentence(error)}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <button
          ref={cancelRef}
          type="button"
          onClick={onCancel}
          className={`${BUTTON} border border-border`}
        >
          {DIALOGS.cancel}
        </button>
        <button
          ref={confirmRef}
          type="button"
          disabled={pending}
          onClick={onConfirm}
          className={`${BUTTON} bg-foreground text-background`}
        >
          {UNIVERSE_LIFECYCLE.retireConfirm}
        </button>
      </div>
    </dialog>
  );
}
