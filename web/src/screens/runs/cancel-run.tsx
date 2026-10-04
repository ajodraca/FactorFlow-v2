import { type JSX, type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { ApiError, cancelAcquisitionRun } from "../../api/client";
import type { RunState } from "../../api/types";
import { OutcomeBadge, isRunState } from "./outcome-badge";

export interface CancelRunControlProps {
  runId: string;
  state: RunState;
  /** Called with the resulting state: cancelling, cancelled, or the actual terminal state from a 409. */
  onSettled?: (state: RunState) => void;
}

/**
 * The `dialog` `confirm` cancel confirmation (ux-design 1.5). `confirm`,
 * never `destructive`: cancelling discards nothing. The copy follows the
 * run's state, because the effects differ (DAC-E5-S6-5, AC-26).
 *
 * The focus trap, Escape-to-close, initial focus on Cancel and focus
 * restore follow `screens/instruments/retire-dialog.tsx`: `<dialog open>`
 * gives no native trap and jsdom has no `showModal()`. While submitting the
 * dialog stays open and busy, never closing before the result is known.
 */
function CancelRunDialog({
  runId,
  queued,
  submitting,
  error,
  onConfirm,
  onCancel,
}: {
  runId: string;
  queued: boolean;
  submitting: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}): JSX.Element {
  const titleId = useId();
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
    <dialog
      open
      aria-modal="true"
      aria-labelledby={titleId}
      aria-busy={submitting || undefined}
      onKeyDown={handleKeyDown}
      data-testid="cancel-run-dialog"
      data-variant="confirm"
      className="fixed inset-0 m-auto flex flex-col gap-3 rounded border border-border bg-background p-5"
    >
      <h2 id={titleId} className="text-lg">
        {queued ? "Cancel this queued run?" : "Stop this run?"}
      </h2>
      <p>
        {queued
          ? "It has not started, so nothing has been acquired. The run in progress is not affected."
          : "Instruments already acquired keep their coverage. Instruments not yet started will be skipped. The run stops after the instrument it is working on now."}
      </p>
      {error !== null ? (
        <p role="alert" className="text-status-critical text-sm">
          Cancelling run {runId} failed: {error}
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
          onClick={() => {
            if (!submitting) {
              onConfirm();
            }
          }}
          className="rounded bg-foreground px-3 py-2 text-background"
        >
          {queued ? "Cancel queued run" : "Stop run"}
        </button>
      </div>
    </dialog>
  );
}

/**
 * The reusable Cancel run action (ux-design 1.5; CAP-001-E5-S6-tasks Open
 * Gap 3, decision DEC-0005). CAP-001-E7-S4 mounts it on Run detail.
 *
 * Offered only while the run is `requested` or `running`. A `202` shows
 * the returned state as an `OutcomeBadge` and withdraws the action, so a
 * `cancelling` run is never presented as already cancelled (AC-19). A `409`
 * `run_already_terminal` says the run had already completed and shows its
 * actual outcome, never a cancellation that did not happen (DAC-E5-S6-6).
 *
 * After a `202`, once the `state` prop has moved past `requested`/`running`,
 * the control renders nothing: its owner has observed the newer state and
 * shows it, so the control's own badge would be stale (CAP-001-E7-S4;
 * DEC-0018). Where the prop never advances, nothing changes. A
 * `409`'s message stays, because the owner cannot tell it apart.
 */
export function CancelRunControl({
  runId,
  state,
  onSettled,
}: CancelRunControlProps): JSX.Element | null {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settled, setSettled] = useState<{ state: RunState; alreadyCompleted: boolean } | null>(
    null,
  );

  async function confirm(): Promise<void> {
    setSubmitting(true);
    setError(null);
    try {
      const result = await cancelAcquisitionRun(runId);
      setOpen(false);
      setSettled({ state: result.state, alreadyCompleted: false });
      onSettled?.(result.state);
    } catch (cause: unknown) {
      if (
        cause instanceof ApiError &&
        cause.code === "run_already_terminal" &&
        isRunState(cause.state)
      ) {
        setOpen(false);
        setSettled({ state: cause.state, alreadyCompleted: true });
        onSettled?.(cause.state);
      } else {
        const message =
          cause instanceof Error ? cause.message : "the request could not be completed";
        setError(cause instanceof ApiError ? `${message} (request ${cause.requestId})` : message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (settled !== null) {
    if (!settled.alreadyCompleted && state !== "requested" && state !== "running") {
      return null;
    }
    return (
      <output className="flex items-center gap-2 text-sm">
        {settled.alreadyCompleted ? <span>This run had already completed.</span> : null}
        <OutcomeBadge state={settled.state} />
      </output>
    );
  }

  if (state !== "requested" && state !== "running") {
    return null;
  }

  return (
    <>
      <button
        type="button"
        data-variant="secondary"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="w-fit rounded bg-secondary px-3 py-2 text-base text-secondary-foreground"
      >
        Cancel run
      </button>
      {open ? (
        <CancelRunDialog
          runId={runId}
          queued={state === "requested"}
          submitting={submitting}
          error={error}
          onConfirm={() => void confirm()}
          onCancel={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
