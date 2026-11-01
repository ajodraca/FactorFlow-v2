import { type JSX, type KeyboardEvent, type MouseEvent, useEffect, useId, useRef } from "react";
import { DIALOGS, UNIVERSE_DETAIL, UNIVERSE_LIFECYCLE, failureSentence } from "../../copy";

/** The refusals the dialog states by code (classification-ui 2.7; DEC-0107). */
export type RemoveError = "last_member" | "universe_retired" | "generic";

const BUTTON = "rounded px-3 py-2 text-sm";

/** The alert sentence per refusal, selected by code and never by an envelope message. */
function errorSentence(error: RemoveError): string {
  switch (error) {
    case "last_member":
      return UNIVERSE_LIFECYCLE.lastMemberRefused;
    case "universe_retired":
      return UNIVERSE_LIFECYCLE.retiredRefusal;
    case "generic":
      return failureSentence({
        operation: "remove-universe-member",
        resource: "universe-member",
        code: null,
      });
  }
}

export interface RemoveDialogProps {
  symbol: string;
  universeName: string;
  error: RemoveError | null;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onRetire: () => void;
}

/**
 * The `dialog` `confirm` remove confirmation (UX design 1.4; classification-ui
 * 2.7; DAC-E1-S8-4, DAC-E1-S8-5). `confirm`, never `destructive`: a removal
 * discards nothing, the membership until today stays in the history
 * (STD-UI-2). The structure is `screens/instruments/retire-dialog.tsx`'s: a
 * native `<dialog open>` with its own Tab cycle between **Cancel** and the
 * last control, Escape cancelling, initial focus on **Cancel** and focus
 * restored to the trigger on unmount. On `last_member` the confirm is
 * replaced by **Retire…** (DEC-0107).
 */
export function RemoveDialog({
  symbol,
  universeName,
  error,
  pending,
  onConfirm,
  onCancel,
  onRetire,
}: RemoveDialogProps): JSX.Element {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const lastRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => {
      previouslyFocused?.focus?.();
    };
  }, []);

  // The confirm is disabled while pending, and a browser either drops focus
  // from a control it disables or leaves it there with no Tab stop. Either
  // way focus is moved to Cancel (to Retire… on `last_member`), so Escape and
  // the Tab cycle keep working. The effect runs in the commit that sets
  // `pending`, while focus is still on the confirm, hence the explicit check.
  useEffect(() => {
    const active = document.activeElement;
    const strandedOnConfirm = pending && active !== null && active === lastRef.current;
    if (dialogRef.current?.contains(active) && !strandedOnConfirm) {
      return;
    }
    (error === "last_member" ? lastRef : cancelRef).current?.focus();
  }, [pending, error]);

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
    const last = lastRef.current?.disabled ? first : lastRef.current;
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

  const refusedLast = error === "last_member";

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
        {UNIVERSE_DETAIL.remove(symbol, universeName)}
      </h2>
      <p id={descriptionId}>{UNIVERSE_DETAIL.removeDescription}</p>
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
        {/* The two share one position, so React keeps one node and swaps its
            props: focus on the confirm stays on Retire… when it replaces it. */}
        {refusedLast ? (
          <button
            ref={lastRef}
            type="button"
            data-variant="secondary"
            onClick={onRetire}
            className={`${BUTTON} bg-secondary text-secondary-foreground`}
          >
            {UNIVERSE_LIFECYCLE.retireAction}
          </button>
        ) : (
          <button
            ref={lastRef}
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className={`${BUTTON} bg-foreground text-background`}
          >
            {UNIVERSE_DETAIL.removeConfirm}
          </button>
        )}
      </div>
    </dialog>
  );
}

export interface RemoveActionProps {
  symbol: string;
  universeName: string;
  /** The member is the universe's only one: removal is blocked and retirement offered (AC-5). */
  soleMember: boolean;
  onRemove: () => void;
  onRetire: () => void;
}

/**
 * A member row's **Remove…** (UX design 1.4): `ghost`, named for its row; on
 * the sole member `blocked` (focusable, described by the reason, inert) with
 * **Retire…** adjacent (DAC-E1-S8-4). A click never reaches the results
 * table's row, which would select it (CAP-002-E4-S6 `ExtraColumn`).
 */
export function RemoveAction({
  symbol,
  universeName,
  soleMember,
  onRemove,
  onRetire,
}: RemoveActionProps): JSX.Element {
  const reasonId = useId();
  const name = UNIVERSE_DETAIL.remove(symbol, universeName);

  function within(handler?: () => void): (event: MouseEvent<HTMLButtonElement>) => void {
    return (event) => {
      event.stopPropagation();
      handler?.();
    };
  }

  if (!soleMember) {
    return (
      <button
        type="button"
        data-variant="ghost"
        aria-label={name}
        onClick={within(onRemove)}
        className={BUTTON}
      >
        {UNIVERSE_DETAIL.removeAction}
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        data-variant="blocked"
        aria-label={name}
        aria-disabled="true"
        aria-describedby={reasonId}
        tabIndex={0}
        // Never `disabled`: the reason must reach a keyboard and screen-reader user.
        onClick={within()}
        className={`${BUTTON} text-muted-foreground`}
      >
        {UNIVERSE_DETAIL.removeAction}
      </button>
      <span id={reasonId} className="text-xs">
        {UNIVERSE_LIFECYCLE.lastMember}
      </span>
      <button
        type="button"
        data-variant="secondary"
        onClick={within(onRetire)}
        className={`${BUTTON} bg-secondary text-secondary-foreground`}
      >
        {UNIVERSE_LIFECYCLE.retireAction}
      </button>
    </span>
  );
}
