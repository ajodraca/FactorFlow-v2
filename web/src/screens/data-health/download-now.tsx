import { type JSX, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, ApiUnreachableError, startAcquisitionRun } from "../../api/client";
import { useShell } from "../../app/shell-context";
import { Button } from "../../components/ui/button";
import {
  DOWNLOAD_NOW,
  QUEUED_NOTICE,
  START_REFUSALS,
  TRY_AGAIN,
  readFailureReason,
  startFailed,
} from "./copy";

type Outcome =
  | null
  | { kind: "queued" }
  | { kind: "refused"; code: keyof typeof START_REFUSALS }
  | { kind: "failed"; reason: string };

function isRefusalCode(code: string | null): code is keyof typeof START_REFUSALS {
  return code !== null && Object.hasOwn(START_REFUSALS, code);
}

/**
 * The one routine action that downloads everything again (component design
 * data-health-ui 2.7 and 2.2; DAC-E6-11, DAC-E6-S2-1, AC-15, AC-17). The page
 * header, Needs fixing and the empty state's first download all render it.
 *
 * It always covers the whole followed list: the post carries no argument, so
 * there is no per-stock retry (D-9). It never asks for confirmation and never
 * navigates. A `202` with nothing queued re-reads attention; a `202` queued
 * behind a running download only says so, per data-health-ui 2.2's alt branch.
 * Each refusal code names its own sentence and fix, and any other failure
 * offers Try again. Neither the envelope's message nor its request id is shown.
 *
 * The one-tier rule of AC-20 does not apply: no status renders here
 * (DAC-E6-S2-4). Data health renders no `blocked` pre-check while the history
 * depth is unset; the refusal explains it after the post (Resolved Conflict 1).
 */
export function DownloadNow({ label = DOWNLOAD_NOW }: { label?: string }): JSX.Element {
  const { refresh } = useShell();
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);

  async function start(): Promise<void> {
    pending.current = true;
    setBusy(true);
    setOutcome(null);
    try {
      const result = await startAcquisitionRun();
      if (result.queuedBehind === null) {
        refresh("attention");
      } else {
        setOutcome({ kind: "queued" });
      }
    } catch (cause: unknown) {
      if (cause instanceof ApiError && isRefusalCode(cause.code)) {
        setOutcome({ kind: "refused", code: cause.code });
      } else {
        // Anything but a transport failure reads as the unexpected-problem
        // reason; no thrown value's own text is ever shown.
        const known = cause instanceof ApiUnreachableError ? cause : new ApiError("", "");
        setOutcome({ kind: "failed", reason: readFailureReason(known) });
      }
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  const refusal = outcome?.kind === "refused" ? START_REFUSALS[outcome.code] : null;

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="default"
        aria-busy={busy || undefined}
        onClick={() => {
          if (!pending.current) void start();
        }}
      >
        {label}
      </Button>
      {outcome?.kind === "queued" ? (
        <output className="text-xs text-muted-foreground">{QUEUED_NOTICE}</output>
      ) : null}
      {refusal !== null ? (
        <>
          <output className="text-sm">{refusal.sentence}</output>
          <Button variant="outline" asChild>
            <Link to={refusal.to}>{refusal.fix}</Link>
          </Button>
        </>
      ) : null}
      {outcome?.kind === "failed" ? (
        <>
          <output className="text-sm">{startFailed(outcome.reason)}</output>
          <Button variant="outline" onClick={() => void start()}>
            {TRY_AGAIN}
          </Button>
        </>
      ) : null}
    </div>
  );
}
