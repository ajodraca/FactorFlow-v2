import { type JSX, useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, startAcquisitionRun } from "../../api/client";
import type { RunStartResult } from "../../api/types";

/** ux-design 1.1, verbatim: the depth precondition (AC-2, DAC-E5-S6-3). */
export const DEPTH_NOT_SET_REASON =
  "History depth is not set. Set it in Settings before acquiring.";
/** ux-design 1.1, verbatim: the instruments precondition (AC-24). */
export const NO_INSTRUMENTS_REASON = "No instruments are named. Add instruments before acquiring.";
/** ux-design 1.1, verbatim: a start queued behind an active run (AC-23). */
export const QUEUED_NOTICE = "A run is in progress. This will start when it finishes.";

export interface StartRunControlProps {
  /** `null`: no depth stated, renders blocked. `undefined`: not known, not blocked client-side. */
  historyDepthYears?: number | null;
  /** `0`: no active instrument, renders blocked. `undefined`: not known. */
  activeInstrumentCount?: number;
  /** Called once with the 202 result, before any navigation. */
  onStarted?: (result: RunStartResult) => void;
  /** The button's text. Defaults to `Start acquisition run` (DEC-0004). */
  label?: string;
}

type Refusal = "depth" | "instruments";

/**
 * The Start action (ux-design 1.1; owner-web-app 2.5; CAP-001-E5-S6-tasks
 * Open Gap 2, decision DEC-0004). It reads no Runs-screen state, so Coverage
 * can compose it with nothing but a Router ancestor.
 *
 * A refused precondition renders `blocked`, never `disabled`: the button
 * stays focusable and carries each reason through `aria-describedby`, depth
 * first. A `409` the client could not foresee sets the same rendering from
 * `ApiError.code`, never from the API's message text, until the precondition
 * props change. After a `202` it calls `onStarted`, then routes to the run's
 * detail; when the run is queued behind an active one it stays and says so
 * instead, and the action remains available (AC-23).
 *
 * CAP-001-E7-S4 passes `label="Re-run acquisition"` on a failed or partial
 * run's detail, the named recovery action (DAC-E7-S4-2; DEC-0017). Every
 * other behaviour is the same under either label.
 */
export function StartRunControl({
  historyDepthYears,
  activeInstrumentCount,
  onStarted,
  label = "Start acquisition run",
}: StartRunControlProps): JSX.Element {
  const navigate = useNavigate();
  const depthId = useId();
  const instrumentsId = useId();
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [refusal, setRefusal] = useState<Refusal | null>(null);
  const [queued, setQueued] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  // A refusal reflects the preconditions as they stood when the server
  // answered; new precondition values supersede it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset is keyed on the props, not read
  useEffect(() => {
    setRefusal(null);
  }, [historyDepthYears, activeInstrumentCount]);

  const depthBlocked = historyDepthYears === null || refusal === "depth";
  const instrumentsBlocked = activeInstrumentCount === 0 || refusal === "instruments";
  const blocked = depthBlocked || instrumentsBlocked;
  const describedBy = [depthBlocked ? depthId : null, instrumentsBlocked ? instrumentsId : null]
    .filter(Boolean)
    .join(" ");

  async function start(): Promise<void> {
    pending.current = true;
    setBusy(true);
    setFailure(null);
    setQueued(false);
    try {
      const result = await startAcquisitionRun();
      onStarted?.(result);
      if (result.queuedBehind === null) {
        navigate(`/runs/${encodeURIComponent(result.runId)}`);
      } else {
        setQueued(true);
      }
    } catch (cause: unknown) {
      if (cause instanceof ApiError && cause.code === "history_depth_not_set") {
        setRefusal("depth");
      } else if (cause instanceof ApiError && cause.code === "no_active_instruments") {
        setRefusal("instruments");
      } else {
        const message =
          cause instanceof Error ? cause.message : "the request could not be completed";
        setFailure(cause instanceof ApiError ? `${message} (request ${cause.requestId})` : message);
      }
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        data-variant={blocked ? "blocked" : "default"}
        aria-describedby={describedBy || undefined}
        aria-busy={busy || undefined}
        // Never a bare `disabled` attribute: a disabled control is not
        // focusable, so its reason would never reach a keyboard or
        // screen-reader user (owner-web-app 2.5).
        tabIndex={0}
        onClick={(event) => {
          if (blocked) {
            event.preventDefault();
            return;
          }
          if (pending.current) {
            return;
          }
          void start();
        }}
        className="w-fit rounded border border-border px-3 py-2 text-base data-[variant=blocked]:text-muted-foreground"
      >
        {label}
      </button>
      {depthBlocked ? (
        <p id={depthId} className="text-muted-foreground text-sm">
          {DEPTH_NOT_SET_REASON}
        </p>
      ) : null}
      {instrumentsBlocked ? (
        <p id={instrumentsId} className="text-muted-foreground text-sm">
          {NO_INSTRUMENTS_REASON}
        </p>
      ) : null}
      {queued ? <output className="text-sm">{QUEUED_NOTICE}</output> : null}
      {failure !== null ? (
        <p role="alert" className="text-status-critical text-sm">
          Starting an acquisition run failed: {failure}
        </p>
      ) : null}
    </div>
  );
}
