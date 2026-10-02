import { type JSX, useEffect, useState } from "react";
import {
  ApiError,
  type RunListFilters,
  getHistoryDepth,
  listAcquisitionRuns,
  listInstruments,
} from "../../api/client";
import type { AcquisitionRunPage, RunState, ScreenState } from "../../api/types";
import { formatTimestamp } from "../../app/status-region";
import { RUN_STATE_LABEL, isNonTerminalRunState } from "./outcome-badge";
import { StartRunControl } from "./run-controls";
import { RunTable } from "./run-table";

/** The poll cadence while any loaded run is non-terminal (DAC-E5-S6-1). */
export const RUNS_POLL_INTERVAL_MS = 10_000;

const RUN_STATES = Object.keys(RUN_STATE_LABEL) as RunState[];

/**
 * The Runs screen (ux-design 1.4; owner-web-app 2.5), implementing the
 * `ScreenState<T>` variants owner-web-app 2.4 specifies for it.
 *
 * Only `loading`, `empty-never-populated`, `empty-no-match`, `populated` and
 * `error` are produced. `partial` and `unavailable` do not apply (ux-design
 * 1.4: no check runs on this screen), and `unreachable` belongs to the
 * shell, which substitutes its own state on every route.
 *
 * Polling is one chained `setTimeout` after each successful response, and
 * only while that response holds a non-terminal run, so a quiet system
 * makes no requests (CAP-001-E5-S6-tasks Open Gap 6, decision DEC-0005).
 * The previous rows stay rendered, marked busy, while a poll is in flight.
 *
 * Start's preconditions come from the depth and instrument reads. A failed
 * read leaves its value `undefined`, never `null` or `0`, so Start never
 * claims a precondition it could not check (Open Gap 9).
 */
export default function RunsScreen(): JSX.Element {
  const [screenState, setScreenState] = useState<ScreenState<AcquisitionRunPage>>({
    kind: "loading",
  });
  const [filter, setFilter] = useState<RunState | "">("");
  const [reloadToken, setReloadToken] = useState(0);
  const [busy, setBusy] = useState(false);
  const [historyDepthYears, setHistoryDepthYears] = useState<number | null | undefined>(undefined);
  const [activeInstrumentCount, setActiveInstrumentCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    getHistoryDepth()
      .then((depth) => {
        if (!cancelled) {
          setHistoryDepthYears(depth.years);
        }
      })
      .catch(() => undefined);
    listInstruments({ lifecycle: "active", limit: 1 })
      .then((page) => {
        if (!cancelled) {
          setActiveInstrumentCount(page.activeCount);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  // reloadToken is a deliberate re-fetch trigger (filter reset, Retry,
  // a started run), not a value read inside the effect body.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const filters: RunListFilters = filter === "" ? {} : { state: filter };

    function load(): void {
      setBusy(true);
      listAcquisitionRuns(filters)
        .then((page) => {
          if (cancelled) {
            return;
          }
          if (page.runs.length === 0) {
            setScreenState({ kind: filter === "" ? "empty-never-populated" : "empty-no-match" });
          } else {
            setScreenState({ kind: "populated", data: page, fetchedAt: new Date().toISOString() });
          }
          if (page.runs.some((item) => isNonTerminalRunState(item.state))) {
            timer = setTimeout(load, RUNS_POLL_INTERVAL_MS);
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
  }, [filter, reloadToken]);

  const reload = (): void => setReloadToken((token) => token + 1);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl">Runs</h1>

      <div className="flex flex-wrap items-start gap-5">
        <label className="flex items-center gap-2 text-sm">
          Outcome
          <select
            data-variant="inline"
            value={filter}
            onChange={(event) => setFilter(event.target.value as RunState | "")}
            className="rounded border border-input bg-background px-2 py-1"
          >
            <option value="">All</option>
            {RUN_STATES.map((state) => (
              <option key={state} value={state}>
                {RUN_STATE_LABEL[state]}
              </option>
            ))}
          </select>
        </label>
        <StartRunControl
          historyDepthYears={historyDepthYears}
          activeInstrumentCount={activeInstrumentCount}
          onStarted={reload}
        />
        <p className="font-numeric text-xs text-muted-foreground">
          {screenState.kind === "populated"
            ? `Last updated ${formatTimestamp(new Date(screenState.fetchedAt))}`
            : "Not yet loaded"}
        </p>
        <p aria-live="polite" className="sr-only">
          {busy ? "Refreshing runs" : ""}
        </p>
      </div>

      {screenState.kind === "loading" ? <p aria-live="polite">Loading runs…</p> : null}

      {screenState.kind === "empty-never-populated" ? (
        <p>No acquisition run has been requested yet.</p>
      ) : null}

      {screenState.kind === "empty-no-match" ? (
        <div className="flex flex-col gap-2">
          <p>No run matches this filter.</p>
          <button
            type="button"
            onClick={() => {
              setFilter("");
              reload();
            }}
            className="w-fit rounded border border-border px-3 py-2 text-sm"
          >
            Reset filter
          </button>
        </div>
      ) : null}

      {screenState.kind === "error" ? (
        <div role="alert" className="flex flex-col gap-2 text-status-critical">
          <p>
            Loading runs failed: {screenState.message} (request {screenState.requestId})
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
          <RunTable runs={screenState.data.runs} busy={busy} />
          {screenState.data.nextCursor !== null ? (
            <p className="text-sm text-muted-foreground">Showing the 50 most recent runs.</p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
