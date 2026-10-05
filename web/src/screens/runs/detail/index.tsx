import { type JSX, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ApiError, type RunDetailFilters, getAcquisitionRun } from "../../../api/client";
import type { ResultOutcome, RunDetail, RunState, ScreenState } from "../../../api/types";
import { isNonTerminalRunState } from "../outcome-badge";
import { InstrumentRoster, groupByInstrument } from "./instrument-roster";
import { RESULT_OUTCOME_LABEL } from "./result-outcome-badge";
import { RunSummaryCard } from "./run-summary";

/** The poll cadence while the run is non-terminal (DAC-E7-S4-6; DEC-0016). */
export const RUN_DETAIL_POLL_INTERVAL_MS = 10_000;

const FILTER_OUTCOMES = Object.keys(RESULT_OUTCOME_LABEL) as ResultOutcome[];

/**
 * The Run detail screen, the child route under Runs (ux-design 1.5;
 * owner-web-app 2.3-2.6). Keyed on the run id, so opening another run, as
 * a re-run does, starts from a clean filter, page and expansion.
 */
export default function RunDetailScreen(): JSX.Element {
  const { runId = "" } = useParams();
  return <RunDetailView key={runId} runId={runId} />;
}

/**
 * Produces the `ScreenState<T>` variants `loading`, `empty-no-match`,
 * `populated` and `error`. `empty-never-populated` does not apply, since a
 * run always exists once opened (an unpopulated roster is stated inside
 * `populated`); `partial` and `unavailable` do not apply, since no check
 * runs here; `unreachable` belongs to the shell (ux-design 1.5 States).
 *
 * One request per view: the server's default page of instruments with the
 * current outcome filter and cursor, never a `limit` (DAC-E7-S4-7). Pages
 * replace each other over a client-side cursor stack, and a filter change
 * returns to page 1. While the run is non-terminal, one chained `setTimeout`
 * re-requests the same view every 10 000 ms, keeping expansion; a failed
 * request stops polling until Retry, and the last good summary stays
 * rendered (DEC-0016).
 */
function RunDetailView({ runId }: { runId: string }): JSX.Element {
  const [screenState, setScreenState] = useState<ScreenState<RunDetail>>({ kind: "loading" });
  const [latest, setLatest] = useState<{ detail: RunDetail; fetchedAt: string } | null>(null);
  const [outcome, setOutcome] = useState<ResultOutcome | "">("");
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined]);
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const [busy, setBusy] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  // reloadToken is a deliberate re-fetch trigger (Retry, a settled cancel),
  // not a value read inside the effect body.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cursor = cursors[cursors.length - 1];
    const filters: RunDetailFilters = {};
    if (outcome !== "") {
      filters.outcome = outcome;
    }
    if (cursor !== undefined) {
      filters.cursor = cursor;
    }

    function load(): void {
      setBusy(true);
      getAcquisitionRun(runId, filters)
        .then((detail) => {
          if (cancelled) {
            return;
          }
          const fetchedAt = new Date().toISOString();
          setLatest({ detail, fetchedAt });
          setScreenState(
            outcome !== "" && detail.results.length === 0
              ? { kind: "empty-no-match" }
              : { kind: "populated", data: detail, fetchedAt },
          );
          if (isNonTerminalRunState(detail.run.state)) {
            timer = setTimeout(load, RUN_DETAIL_POLL_INTERVAL_MS);
          }
        })
        .catch((cause: unknown) => {
          if (cancelled) {
            return;
          }
          setScreenState({
            kind: "error",
            message: cause instanceof Error ? cause.message : "the request could not be completed",
            requestId: cause instanceof ApiError ? cause.requestId : "unknown",
          });
        })
        .finally(() => {
          if (!cancelled) {
            setBusy(false);
          }
        });
    }

    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [runId, outcome, cursors, reloadToken]);

  const reload = (): void => setReloadToken((token) => token + 1);

  function onRunChanged(state: RunState): void {
    setLatest((current) =>
      current === null
        ? null
        : { ...current, detail: { ...current.detail, run: { ...current.detail.run, state } } },
    );
    reload();
  }

  function changeFilter(next: ResultOutcome | ""): void {
    setOutcome(next);
    setCursors([undefined]);
  }

  function toggle(instrumentId: number): void {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(instrumentId)) {
        next.delete(instrumentId);
      } else {
        next.add(instrumentId);
      }
      return next;
    });
  }

  const shown =
    screenState.kind === "populated" ? groupByInstrument(screenState.data.results).length : 0;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl">
        Run <span className="font-numeric">{runId}</span>
      </h1>

      {latest !== null ? (
        <RunSummaryCard
          detail={latest.detail}
          fetchedAt={latest.fetchedAt}
          onRunChanged={onRunChanged}
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-5">
        <label className="flex items-center gap-2 text-sm">
          Outcome
          <select
            data-variant="inline"
            value={outcome}
            onChange={(event) => changeFilter(event.target.value as ResultOutcome | "")}
            className="rounded border border-input bg-background px-2 py-1"
          >
            <option value="">All</option>
            {FILTER_OUTCOMES.map((value) => (
              <option key={value} value={value}>
                {RESULT_OUTCOME_LABEL[value]}
              </option>
            ))}
          </select>
        </label>
        <p aria-live="polite" className="sr-only">
          {`${shown} instruments shown`}
        </p>
      </div>

      {screenState.kind === "loading" ? <p aria-live="polite">Loading run…</p> : null}

      {screenState.kind === "empty-no-match" ? (
        <div className="flex flex-col gap-2">
          <p>No instrument in this run matches this filter.</p>
          <button
            type="button"
            onClick={() => changeFilter("")}
            className="w-fit rounded border border-border px-3 py-2 text-sm"
          >
            Reset filter
          </button>
        </div>
      ) : null}

      {screenState.kind === "error" ? (
        <div role="alert" className="flex flex-col gap-2 text-status-critical">
          <p>
            Loading run {runId} failed: {screenState.message} (request {screenState.requestId})
          </p>
          <button
            type="button"
            onClick={reload}
            className="w-fit rounded border border-border px-3 py-2 text-sm"
          >
            Retry
          </button>
        </div>
      ) : null}

      {screenState.kind === "populated" ? (
        <>
          {screenState.data.results.length === 0 ? (
            <p>No instrument results have been recorded for this run yet.</p>
          ) : (
            <InstrumentRoster
              results={screenState.data.results}
              busy={busy}
              expanded={expanded}
              onToggle={toggle}
            />
          )}
          <div className="flex items-center gap-3 text-sm">
            {cursors.length > 1 ? (
              <button
                type="button"
                onClick={() => setCursors((stack) => stack.slice(0, -1))}
                className="rounded border border-border px-3 py-2"
              >
                Previous page
              </button>
            ) : null}
            <span>{`Page ${cursors.length}`}</span>
            {screenState.data.nextCursor !== null ? (
              <button
                type="button"
                onClick={() => {
                  const next = screenState.data.nextCursor ?? undefined;
                  setCursors((stack) => [...stack, next]);
                }}
                className="rounded border border-border px-3 py-2"
              >
                Next page
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
