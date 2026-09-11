import { type JSX, type KeyboardEvent, useEffect, useId, useRef } from "react";

/**
 * The `dialog` `confirm` retire confirmation (component design section
 * 2.5; ux-design section 1.2 Interaction Flows; AC-25, DAC-E2-11,
 * DAC-E2-S4-2).
 *
 * `confirm`, never `destructive`: retirement discards nothing — every
 * observation already recorded stands, and the `destructive` variant is
 * specified for deleting or discarding data (STD-UI-2). Initial focus is
 * on cancel, per the `dialog` contract's least-destructive-control rule.
 *
 * The in-flight-run sentence (AC-25, DAC-E2-11) renders unconditionally
 * (IR-002): no run-status source exists anywhere on these screens yet — the
 * most recent run is hardcoded `null` by CAP-001-E1-S6 and CAP-001-E7-S3
 * owns its real shape — so a `hasActiveRun` prop here could only ever be a
 * literal that misrepresents the actual state. Rendering the sentence every
 * time satisfies AC-25's and DAC-E2-11's wording ("states that a run
 * already under way still finishes") without a stub that silently
 * suppresses the criterion; this is a disclosed deviation from the task
 * plan's originally conditional reading, to be revisited once a real
 * run-status source exists.
 *
 * The dialog is a real focus trap (IR-006): `<dialog open>` alone is
 * non-modal in every browser (`showModal()` is what supplies the native
 * trap, and jsdom — this repo's test environment — does not implement it),
 * so this component supplies its own Tab-cycle and Escape-to-close, and
 * restores focus to whatever was focused immediately before it mounted
 * (the triggering row action) when it unmounts for any reason.
 */
export function RetireDialog({
  symbol,
  error = null,
  onConfirm,
  onCancel,
}: {
  symbol: string;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}): JSX.Element {
  const titleId = useId();
  const errorId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
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
    // Manual focus trap: `<dialog open>` (rather than `showModal()`) gives
    // no native one, and `showModal()` is unavailable under jsdom.
    const first = cancelRef.current;
    const last = confirmRef.current;
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
    // A native `<dialog>` carries the implicit `dialog` role WAI-ARIA
    // prefers over a `div` with `role="dialog"` layered on top. `aria-modal`
    // now matches the behaviour actually implemented: the keydown handler
    // above traps focus and closes on Escape, which is what makes this
    // genuinely modal rather than merely labelled so.
    <dialog
      open
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={handleKeyDown}
      data-testid="retire-dialog"
      data-variant="confirm"
      className="fixed inset-0 m-auto flex flex-col gap-3 rounded border border-border bg-background p-5"
    >
      <h2 id={titleId} className="text-lg">
        Stop acquiring {symbol}?
      </h2>
      <p>
        Its recorded history is kept and stays visible on the Coverage screen. You can add it again
        later.
      </p>
      <p data-testid="retire-dialog-in-flight-notice">
        A run is in progress and will still acquire {symbol} this time. Retirement takes effect from
        the next run.
      </p>
      {error !== null ? (
        <p id={errorId} role="alert" className="text-status-critical text-sm">
          Stopping acquisition for {symbol} failed: {error}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <button
          ref={cancelRef}
          type="button"
          onClick={onCancel}
          className="rounded border border-border px-3 py-2 text-base"
        >
          Cancel
        </button>
        <button
          ref={confirmRef}
          type="button"
          onClick={onConfirm}
          className="rounded bg-foreground px-3 py-2 text-background"
        >
          Stop acquiring
        </button>
      </div>
    </dialog>
  );
}
