import { type JSX, type RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ApiError, ApiUnreachableError, retireInstrument } from "../../api/client";
import { useShell } from "../../app/shell-context";
import { ConfirmDialog } from "../../components/ui/dialog";
import {
  STOP_FOLLOWING,
  isStaleRowRefusal,
  stopFailureReason,
  stopFollowingDescription,
  stopFollowingFailed,
  stopFollowingTitle,
  stoppedFollowing,
} from "./copy";

interface Failure {
  sentence: string;
  staleRow: boolean;
}

export interface StopFollowingDialogProps {
  /** The symbol being confirmed; the dialog is open while it is not `null`. */
  symbol: string | null;
  onClose: () => void;
  /** The caller's aggregate re-read, called after a successful stop. */
  onStopped: () => void;
  /** Called once when a dialog that showed a `404` or `409` closes: the row is stale. */
  onRefusalClosed: () => void;
  /** The Needs fixing heading, focused when the row has left. */
  fallbackFocusRef: RefObject<HTMLElement | null>;
}

/**
 * The confirmed recovery: stop following a symbol with its history kept
 * (component design data-health-ui 2.7 and 10; DAC-E6-12, DAC-E6-S2-2, AC-14,
 * AC-17, AC-25; blueprint section 9).
 *
 * It is the design system's `confirm` dialog and never `destructive`, because
 * nothing is deleted (STD-UI-2). Cancel is first and focused and focus is
 * trapped, which the shared dialog supplies. A success closes the dialog, then
 * calls the caller's re-read and re-reads attention, and announces the stop
 * politely; no toast is raised. A `404` or `409` keeps the dialog open with the
 * reason, and closing it calls `onRefusalClosed` once, because only those two
 * mean the row is stale. Any other failure leaves the row alone.
 *
 * The AC-20 one-tier rule does not apply: no status renders here
 * (DAC-E6-S2-4).
 *
 * Caller contract: render it beside the rows, so that it re-renders with them
 * (do not wrap it in `memo`), give the heading `tabIndex={-1}`, and decide what
 * `onRefusalClosed` re-reads. When the row that opened the dialog has left and
 * focus has fallen to the body, focus moves to the heading; focus the owner has
 * placed elsewhere is never moved (STD-UI-24).
 */
export function StopFollowingDialog({
  symbol,
  onClose,
  onStopped,
  onRefusalClosed,
  fallbackFocusRef,
}: StopFollowingDialogProps): JSX.Element {
  const { refresh } = useShell();
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [announcement, setAnnouncement] = useState({ text: "", serial: 0 });
  const opener = useRef<HTMLElement | null>(null);
  const watchRowExit = useRef(false);
  const lastSymbol = useRef("");
  if (symbol !== null) lastSymbol.current = symbol;
  const shown = symbol ?? lastSymbol.current;

  // Runs before the dialog moves focus to Cancel, so the opener is the row's button.
  useLayoutEffect(() => {
    if (symbol !== null) {
      opener.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      watchRowExit.current = false;
      setFailure(null);
    }
  }, [symbol]);

  // After every render: the caller re-renders when its rows change, so this sees each change.
  // A row that leaves in the same update as the close can leave focus inside the closing
  // dialog until the next tick, and nothing renders after that, so the check runs once more then.
  useEffect(() => {
    const settle = () => {
      if (!watchRowExit.current) return;
      const active = document.activeElement;
      const focusOnBody = active === null || active === document.body;
      if (opener.current?.isConnected === false && focusOnBody) {
        fallbackFocusRef.current?.focus();
        watchRowExit.current = false;
      } else if (!focusOnBody && active !== opener.current && !active?.closest('[role="dialog"]')) {
        // Focus the owner placed elsewhere; the closing dialog's own buttons do not count.
        watchRowExit.current = false;
      }
    };
    settle();
    if (!watchRowExit.current) return;
    const timer = setTimeout(settle, 0);
    return () => clearTimeout(timer);
  });

  async function confirm(target: string): Promise<void> {
    setPending(true);
    setFailure(null);
    try {
      await retireInstrument(target);
      watchRowExit.current = true;
      onClose();
      onStopped();
      refresh("attention");
      setAnnouncement((prev) => ({ text: stoppedFollowing(target), serial: prev.serial + 1 }));
    } catch (cause: unknown) {
      const known =
        cause instanceof ApiUnreachableError || cause instanceof ApiError
          ? cause
          : new ApiError("", "");
      setFailure({
        sentence: stopFollowingFailed(target, stopFailureReason(known)),
        staleRow: isStaleRowRefusal(cause),
      });
    } finally {
      setPending(false);
    }
  }

  function onOpenChange(next: boolean): void {
    if (next) return;
    if (failure?.staleRow) {
      watchRowExit.current = true;
      onRefusalClosed();
    }
    setFailure(null);
    onClose();
  }

  return (
    <>
      <ConfirmDialog
        open={symbol !== null}
        onOpenChange={onOpenChange}
        title={stopFollowingTitle(shown)}
        description={stopFollowingDescription(shown)}
        confirmLabel={STOP_FOLLOWING}
        onConfirm={() => void confirm(shown)}
        pending={pending}
      >
        {failure !== null ? <output className="text-sm">{failure.sentence}</output> : null}
      </ConfirmDialog>
      <output aria-live="polite" className="sr-only">
        <span key={announcement.serial}>{announcement.text}</span>
      </output>
    </>
  );
}
