import { type JSX, useEffect, useId, useRef } from "react";

/**
 * The `dialog` `confirm` retire confirmation (component design section
 * 2.5; ux-design section 1.2 Interaction Flows; AC-25, DAC-E2-11,
 * DAC-E2-S4-2).
 *
 * `confirm`, never `destructive`: retirement discards nothing — every
 * observation already recorded stands, and the `destructive` variant is
 * specified for deleting or discarding data (STD-UI-2). Initial focus is
 * on cancel, per the `dialog` contract's least-destructive-control rule.
 */
export function RetireDialog({
  symbol,
  hasActiveRun,
  onConfirm,
  onCancel,
}: {
  symbol: string;
  hasActiveRun: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}): JSX.Element {
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  return (
    // A native `<dialog>` carries the implicit `dialog` role and modal
    // semantics WAI-ARIA prefers over a `div` with `role="dialog"` layered
    // on top; `open` renders it non-modal (no browser-native backdrop or
    // focus trap), so the effect above still drives initial focus, and
    // `aria-modal` states the intended semantics explicitly.
    <dialog
      open
      aria-modal="true"
      aria-labelledby={titleId}
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
      {hasActiveRun ? (
        <p data-testid="retire-dialog-in-flight-notice">
          A run is in progress and will still acquire {symbol} this time. Retirement takes effect
          from the next run.
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
