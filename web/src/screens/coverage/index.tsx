import { type JSX, useEffect, useState } from "react";
import { ApiError, fetchCoverage, getHistoryDepth, listInstruments } from "../../api/client";
import type { CoverageView, InstrumentLifecycle, ScreenState } from "../../api/types";
import { formatTimestamp } from "../../app/status-region";
import { StartRunControl } from "../runs/run-controls";
import { NEVER_ACQUIRED, NO_MATCH, planLimitNote } from "./copy";
import { CoverageTable } from "./coverage-table";
import { uniformShortfallYears } from "./uniform-shortfall";

const FILTER_DEBOUNCE_MS = 250;

/**
 * The Coverage screen (ux-design 1.1; owner-web-app 2.3; CAP-001-E6-S4):
 * which instruments the owner can rely on, without reading the data.
 *
 * Only `loading`, `empty-never-populated`, `empty-no-match`, `populated` and
 * `error` are produced. `partial` is the ordinary rendering here, since a
 * row with some data types absent is still a populated row. Unavailability
 * is per column, never per screen: gap detection being unavailable renders
 * in the Gaps column and below the table. `unreachable` belongs to the
 * shell, which substitutes its own state on every route.
 *
 * Coverage is fetched on mount, on a filter or page change, and on Refresh
 * or Retry, and never on a timer (DAC-E6-13). Filtering is server-side and
 * pages replace each other over a cursor stack, so the DOM stays bounded
 * at 3000 instruments (DAC-E6-S4-5). That is pagination, not the
 * virtualisation STD-UI-30 asks for (CAP-001-E6-S4-tasks Open Gap 2).
 *
 * Owner-confirmed provisional choices cited by Open Gap number: the toolbar
 * copy (6); the plan-limit note (3); the Start control's precondition
 * inputs, read as the Runs screen reads them (7); and the polite loading
 * text in place of a row-count skeleton (9).
 */
export default function CoverageScreen(): JSX.Element {
  const [screenState, setScreenState] = useState<ScreenState<CoverageView>>({ kind: "loading" });
  const [lastLoadedAt, setLastLoadedAt] = useState<string | null>(null);
  const [symbolFilter, setSymbolFilter] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState<InstrumentLifecycle | "">("");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([]);
  const [reloadToken, setReloadToken] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [responseToken, setResponseToken] = useState(0);
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

  // No polling: DAC-E6-13, owner-web-app 2.3
  // reloadToken is a deliberate re-fetch trigger (Refresh, Retry, Reset
  // filter), not a value read inside the effect body.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    let cancelled = false;

    function load(): void {
      setRefreshing(true);
      fetchCoverage({
        symbol: symbolFilter || undefined,
        lifecycle: lifecycleFilter || undefined,
        cursor,
      })
        .then((data) => {
          if (cancelled) {
            return;
          }
          const fetchedAt = new Date().toISOString();
          setLastLoadedAt(fetchedAt);
          setResponseToken((token) => token + 1);
          if (data.neverAcquired) {
            setScreenState({ kind: "empty-never-populated" });
          } else if (data.rows.length === 0) {
            setScreenState({ kind: "empty-no-match" });
          } else {
            setScreenState({ kind: "populated", data, fetchedAt });
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
            setRefreshing(false);
          }
        });
    }

    if (symbolFilter === "") {
      load();
      return () => {
        cancelled = true;
      };
    }
    const timer = window.setTimeout(load, FILTER_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [symbolFilter, lifecycleFilter, cursor, reloadToken]);

  const reload = (): void => setReloadToken((token) => token + 1);

  function resetPaging(): void {
    setCursor(undefined);
    setCursorStack([]);
  }

  function resetFilters(): void {
    setSymbolFilter("");
    setLifecycleFilter("");
    resetPaging();
    reload();
  }

  const populated = screenState.kind === "populated" ? screenState.data : null;
  const shortfall = populated === null ? null : uniformShortfallYears(populated.rows);

  return (
    <div className="flex h-full min-h-0 flex-col gap-5">
      <h1 className="text-xl">Coverage</h1>

      <div data-testid="coverage-toolbar" className="flex flex-wrap items-end gap-5">
        <label className="flex flex-col gap-1 text-sm">
          Filter by symbol
          <input
            type="text"
            value={symbolFilter}
            onChange={(event) => {
              setSymbolFilter(event.target.value);
              resetPaging();
            }}
            className="rounded border border-input p-2 text-base"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Lifecycle
          <select
            data-variant="inline"
            value={lifecycleFilter}
            onChange={(event) => {
              setLifecycleFilter(event.target.value as InstrumentLifecycle | "");
              resetPaging();
            }}
            className="rounded border border-input p-2 text-base"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="retired">Retired</option>
          </select>
        </label>
        <StartRunControl
          historyDepthYears={historyDepthYears}
          activeInstrumentCount={activeInstrumentCount}
        />
        <button
          type="button"
          onClick={reload}
          className="w-fit rounded border border-border px-3 py-2 text-sm"
        >
          Refresh
        </button>
        <p className="font-numeric text-xs text-muted-foreground">
          {lastLoadedAt === null
            ? "Not yet loaded"
            : `Last updated ${formatTimestamp(new Date(lastLoadedAt))}`}
        </p>
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {populated === null ? "" : `${populated.rows.length} instruments shown`}
        </p>
      </div>

      {shortfall !== null ? (
        <p data-testid="plan-limit-note" className="text-sm">
          {planLimitNote(shortfall)}
        </p>
      ) : null}

      {screenState.kind === "loading" ? <p aria-live="polite">Loading coverage…</p> : null}

      {screenState.kind === "empty-never-populated" ? <p>{NEVER_ACQUIRED}</p> : null}

      {screenState.kind === "empty-no-match" ? (
        <div className="flex flex-col gap-2">
          <p>{NO_MATCH}</p>
          <button
            type="button"
            onClick={resetFilters}
            className="w-fit rounded border border-border px-3 py-2 text-sm"
          >
            Reset filter
          </button>
        </div>
      ) : null}

      {screenState.kind === "error" ? (
        <div role="alert" className="flex flex-col gap-2 text-status-critical">
          <p>
            Loading coverage failed: {screenState.message} (request {screenState.requestId})
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

      {populated !== null ? (
        <>
          <div data-testid="coverage-table-scroll" className="min-h-0 flex-1 overflow-auto">
            <CoverageTable
              rows={populated.rows}
              gapDetection={populated.gapDetection}
              refreshing={refreshing}
              refreshToken={responseToken}
            />
          </div>
          <div className="flex gap-3">
            {cursorStack.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setCursor(cursorStack[cursorStack.length - 1]);
                  setCursorStack((stack) => stack.slice(0, -1));
                }}
                className="w-fit rounded border border-border px-3 py-2 text-sm"
              >
                Previous page
              </button>
            ) : null}
            {populated.nextCursor !== null ? (
              <button
                type="button"
                onClick={() => {
                  setCursorStack((stack) => [...stack, cursor]);
                  setCursor(populated.nextCursor ?? undefined);
                }}
                className="w-fit rounded border border-border px-3 py-2 text-sm"
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
