import type { JSX } from "react";
import type { OutcomeCounts, ResultOutcome, RunDetail, RunState } from "../../../api/types";
import { formatTimestamp } from "../../../app/status-region";
import { CancelRunControl } from "../cancel-run";
import { ABANDONED_EXPLANATION, OutcomeBadge } from "../outcome-badge";
import { StartRunControl } from "../run-controls";
import { RESULT_OUTCOME_LABEL, RESULT_OUTCOME_ORDER } from "./result-outcome-badge";

/** AC-6 in plain words, beside the re-run action (DEC-0017). */
export const RERUN_SENTENCE =
  "Re-running is safe: data already recorded is not duplicated or overwritten.";

const COUNT_KEY: Record<ResultOutcome, keyof OutcomeCounts> = {
  written: "written",
  unchanged: "unchanged",
  not_found: "notFound",
  failed: "failed",
  skipped: "skipped",
};

function Timestamp({ iso }: { iso: string | null }): JSX.Element {
  if (iso === null) {
    return (
      <>
        <span aria-hidden="true">—</span>
        <span className="sr-only">Not recorded</span>
      </>
    );
  }
  return <span className="font-numeric text-xs">{formatTimestamp(new Date(iso))}</span>;
}

/**
 * The Run detail summary, a `card` `summary` (ux-design 1.5 Page Layout;
 * owner-web-app 2.3). It carries the outcome, the abandoned explanation with
 * the path to a new run (DAC-E7-S4-1), the timestamps with no started time
 * for a queued cancel (AC-26), progress as text only (no indicator and no
 * estimate, owner-web-app 14 OQ 1), the cancel action (AC-19) and, for a
 * failed or partial run, re-run as the named recovery (DAC-E7-S4-2).
 *
 * `CancelRunControl` is always mounted, keyed on the run: it renders nothing
 * where it does not apply, and a conditional mount would drop its
 * already-completed message on the refetch after a `409` (DAC-E7-S4-3;
 * DEC-0018).
 */
export function RunSummaryCard({
  detail,
  fetchedAt,
  onRunChanged,
}: {
  detail: RunDetail;
  fetchedAt: string;
  onRunChanged: (state: RunState) => void;
}): JSX.Element {
  const { run, counts } = detail;
  const recoverable = run.state === "failed" || run.state === "partial";

  return (
    <section
      data-variant="summary"
      aria-label="Run summary"
      className="flex flex-col gap-3 rounded border border-border p-5"
    >
      <div>
        <OutcomeBadge state={run.state} />
      </div>
      {run.state === "abandoned" ? (
        <>
          <p data-testid="abandoned-explanation" className="text-sm">
            {ABANDONED_EXPLANATION}
          </p>
          <StartRunControl />
        </>
      ) : null}
      <dl className="grid w-fit grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt>Requested</dt>
        <dd>
          <Timestamp iso={run.requestedAt} />
        </dd>
        <dt>Started</dt>
        <dd>
          <Timestamp iso={run.startedAt} />
        </dd>
        <dt>Ended</dt>
        <dd>
          <Timestamp iso={run.endedAt} />
        </dd>
      </dl>
      <p aria-live="polite" className="text-sm">
        {`${counts.instrumentsWritten} written and ${counts.instrumentsFailed} failed of ${counts.instrumentsNamed} named instruments`}
      </p>
      <p className="font-numeric text-sm">
        {RESULT_OUTCOME_ORDER.map(
          (outcome) =>
            `${RESULT_OUTCOME_LABEL[outcome]} ${counts.resultsByOutcome[COUNT_KEY[outcome]]}`,
        ).join(" · ")}
      </p>
      <p className="font-numeric text-xs text-muted-foreground">
        {`Last updated ${formatTimestamp(new Date(fetchedAt))}`}
      </p>
      <CancelRunControl
        key={run.runId}
        runId={run.runId}
        state={run.state}
        onSettled={onRunChanged}
      />
      {recoverable ? (
        <>
          <p className="text-sm">{RERUN_SENTENCE}</p>
          <StartRunControl label="Re-run acquisition" />
        </>
      ) : null}
    </section>
  );
}
