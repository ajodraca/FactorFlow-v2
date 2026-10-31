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
 * supplies its own Tab cycle over the controls present at each keypress (the
 * confirm can be swapped while open), closes on Escape, moves focus to
 * `initialFocusRef` on open and restores whatever held focus before it opened
 * when it unmounts for any reason. It keeps no state of its own.
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
    <dialog
      ref={dialogRef}
      open
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={busy ? "true" : undefined}
      data-variant="standard"
      onKeyDown={handleKeyDown}
      className="fixed inset-0 m-auto flex flex-col gap-3 rounded border border-border bg-background p-5"
    >
      <h2 id={titleId} className="text-lg">
        {title}
      </h2>
      {children}
    </dialog>
  );
}
