import type { JSX } from "react";
import { ConfirmDialog } from "../../components/ui/dialog";

/**
 * The `dialog` `confirm` stop-following confirmation (DAC-E7-9; UX design 1.6;
 * CAP-001 AC-25). `confirm`, never `destructive`: stopping following discards
 * nothing, the history stands. `ConfirmDialog` supplies the focus trap, Escape,
 * Cancel-first focus and the return of focus to the opener.
 *
 * The running-download sentence renders every time (DEC-0390): no usable
 * source says whether a download is running, so conditioning it would hide it
 * while one is. The gap-detection sentence is not rendered (DEC-0391): no
 * artifact gives its wording or the data its condition needs.
 */
export function RetireDialog({
  symbol,
  error = null,
  pending = false,
  onConfirm,
  onCancel,
}: {
  symbol: string;
  error?: string | null;
  /** True while the stop is in flight: the confirmation is held (IR-002). */
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}): JSX.Element {
  return (
    <ConfirmDialog
      open
      onOpenChange={(next) => {
        if (!next) {
          onCancel();
        }
      }}
      title={`Stop following ${symbol}?`}
      description="Its history is kept, and strategies holding it keep holding it. You can follow it again later."
      confirmLabel="Stop following"
      onConfirm={onConfirm}
      pending={pending}
    >
      <p data-testid="retire-dialog-in-flight-notice">
        A download is running and will still download {symbol} this time. Stopping takes effect from
        the next download.
      </p>
      {error !== null ? (
        <p role="alert" className="text-sm text-status-critical">
          Stopping following {symbol} failed: {error}
        </p>
      ) : null}
    </ConfirmDialog>
  );
}
