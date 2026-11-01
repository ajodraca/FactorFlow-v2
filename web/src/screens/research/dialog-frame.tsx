import {
  type JSX,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
} from "react";

/** What the Tab cycle may land on: every enabled, tabbable control inside the dialog. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The `dialog` `standard` frame of the Save and Add dialogs (classification-ui
 * section 2.7; dialog design spec sections 4 and 5; DAC-E4-S8-3,
 * DAC-E4-S8-5), the frame `screens/instruments/retire-dialog.tsx` established:
 * a native `<dialog open>` with `aria-modal`, labelled by its `h2` and
 * described by `descriptionId` when given.
 *
 * `<dialog open>` is non-modal and jsdom has no `showModal()`, so the frame
 * supplies its own overlay, which dims and blocks the page behind (dialog
 * spec section 3) and closes the dialog when clicked without taking focus,
 * its own Tab cycle over the controls present at each keypress (the confirm
 * can be swapped while open), closes on Escape, moves focus to
 * `initialFocusRef` on open and restores whatever held focus before it opened
 * when it unmounts for any reason. Escape and the overlay call `onCancel`,
 * which each dialog makes a no-op while a request is pending, as it does its
 * Cancel: the dialog never closes before a request's result is known (dialog
 * spec section 4; DEC-0259). Surface and text are `--popover` /
 * `--popover-foreground` (dialog spec section 6; DEC-0257). It keeps no state
 * of its own.
 */
export function DialogFrame({
  title,
  children,
  initialFocusRef,
  onCancel,
  busy,
  descriptionId,
}: {
  title: string;
  children: ReactNode;
  initialFocusRef: RefObject<HTMLElement>;
  onCancel: () => void;
  busy: boolean;
  descriptionId?: string;
}): JSX.Element {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: focus moves once, on open.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    initialFocusRef.current?.focus();
    return () => {
      previouslyFocused?.focus?.();
    };
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>): void {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
      return;
    }
    if (event.key !== "Tab") {
      return;
    }
    const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (first === undefined || last === undefined) {
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
    <>
      {/* Pointer-only: Escape is the keyboard's way to close, and the overlay
          is hidden from assistive technology. */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Escape on the dialog is the keyboard equivalent. */}
      <div
        aria-hidden="true"
        data-slot="overlay"
        // Keeps focus in the dialog: a press on the overlay never moves it to the page.
        onMouseDown={(event) => event.preventDefault()}
        onClick={onCancel}
        className="fixed inset-0 bg-background/80"
      />
      <dialog
        ref={dialogRef}
        open
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={busy ? "true" : undefined}
        data-variant="standard"
        onKeyDown={handleKeyDown}
        className="fixed inset-0 m-auto flex flex-col gap-3 rounded border border-border bg-[hsl(var(--popover))] p-5 text-[hsl(var(--popover-foreground))]"
      >
        <h2 id={titleId} className="text-lg">
          {title}
        </h2>
        {children}
      </dialog>
    </>
  );
}

/**
 * A confirm action's progress in place (button spec section 4, Loading;
 * dialog spec section 4, Submitting; DEC-0259): a spinner beside the label,
 * its slot always reserved so the button's width never changes, shown only
 * while `pending`; it spins only where motion is allowed. `--radius`
 * (0.5rem) on a `--space-4` (1rem) box draws the circle, so no size literal
 * is introduced (STD-UI-29). Both class lists are whole literals, never
 * assembled, so the build sees every class.
 */
export function ConfirmProgress({ pending }: { pending: boolean }): JSX.Element {
  return (
    <span
      aria-hidden="true"
      className={
        pending
          ? "size-4 rounded-[var(--radius)] border border-current border-t-transparent motion-safe:animate-spin"
          : "invisible size-4 rounded-[var(--radius)] border border-current border-t-transparent motion-safe:animate-spin"
      }
    />
  );
}
