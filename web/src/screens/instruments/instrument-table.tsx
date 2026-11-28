import type { ColumnDef } from "@tanstack/react-table";
import { type JSX, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listInstruments, retireInstrument } from "../../api/client";
import type { Instrument, InstrumentLifecycle, ScreenState } from "../../api/types";
import { StateRegion, type StateRenderers } from "../../components/patterns/state-region";
import { Button } from "../../components/ui/button";
import { DataTable } from "../../components/ui/data-table";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { LifecycleBadge, RecognitionBadge } from "./badges";
import { RetireDialog } from "./retire-dialog";

const FILTER_DEBOUNCE_MS = 250;

/** The lifecycle filter's *All* item: Radix Select forbids an empty item value. */
const ALL = "all";

const NO_SYMBOLS: ReadonlySet<string> = new Set();

interface RetireTarget {
  symbol: string;
}

/**
 * The state kinds this region never reaches, each with the reason (AC-24).
 * The screen mounts the table only once a stock has been followed, so a table
 * is never first-time empty; a stock is followed or it is not, and no check
 * runs here (UX design 1.6 States); the shell replaces the main region when
 * the API does not answer at all (AC-23).
 */
const RENDERERS: Omit<
  StateRenderers<Instrument[]>,
  "loading" | "empty-no-match" | "populated" | "error"
> = {
  "empty-never-populated": {
    notApplicable: "the screen renders never-populated before mounting the table",
  },
  partial: { notApplicable: "a stock is followed or it is not (UX 1.6 States)" },
  unavailable: { notApplicable: "no check runs on this screen (UX 1.6 States)" },
  unreachable: { notApplicable: "the shell replaces the main region (AC-23)" },
};

/**
 * The `data-table` `virtualised` followed-stocks table with its toolbar
 * (owner-web-app 2.3; UX design 1.6; DAC-E7-11, DAC-E7-1). Followed and
 * stopped-following stocks are one table with a lifecycle column, not two
 * (AC-21). The table read renders its eight states through `StateRegion`.
 *
 * Filtering is server-side: every filter change issues a `listInstruments`
 * request through the typed client rather than filtering the loaded page,
 * which is required at AC-4's 3000-stock volume. The next keyset page is asked
 * for by the table when its window nears the loaded end, with the same cursor
 * request as before and no button (DEC-0392: no per-row expansion either).
 *
 * `notFoundSymbols` carries the stocks the provider does not recognise. No
 * response names them yet, so production passes nothing and no row shows
 * *Not found* until a source exists (CAP-003-E7-S3 Open Gap 1).
 */
export function InstrumentTable({
  refreshToken = 0,
  notFoundSymbols = NO_SYMBOLS,
}: {
  refreshToken?: number;
  notFoundSymbols?: ReadonlySet<string>;
} = {}): JSX.Element {
  const [symbolFilter, setSymbolFilter] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState<InstrumentLifecycle | "">("");
  const [state, setState] = useState<ScreenState<Instrument[]>>({ kind: "loading" });
  const [activeCount, setActiveCount] = useState(0);
  const [retiredCount, setRetiredCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [retireTarget, setRetireTarget] = useState<RetireTarget | null>(null);
  const [retireError, setRetireError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // refreshToken and reloadToken below are deliberate re-fetch triggers
  // (bumped by the parent screen and by a completed stop), not values read
  // in the effect body.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(
      () => {
        void listInstruments({
          symbol: symbolFilter || undefined,
          lifecycle: lifecycleFilter || undefined,
        })
          .then((page) => {
            if (cancelled) {
              return;
            }
            // A fresh filter/refresh/reload always replaces the loaded set
            // with the first page; paging is what accumulates further pages
            // (IR-001), so a filter change keeps no stale rows.
            setState(
              page.rows.length === 0
                ? { kind: "empty-no-match" }
                : { kind: "populated", data: page.rows, fetchedAt: new Date().toISOString() },
            );
            setActiveCount(page.activeCount);
            setRetiredCount(page.retiredCount);
            setNextCursor(page.nextCursor);
          })
          .catch((cause: unknown) => {
            if (cancelled) {
              return;
            }
            setState({
              kind: "error",
              message:
                cause instanceof Error ? cause.message : "the request could not be completed",
              requestId: "unknown",
            });
          });
      },
      symbolFilter === "" ? 0 : FILTER_DEBOUNCE_MS,
    );

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [symbolFilter, lifecycleFilter, refreshToken, reloadToken]);

  /**
   * Consumes `nextCursor` (IR-001): at AC-4's 3000-stock volume the server's
   * page size only ever returns the first page unless a caller asks for more.
   * Appends the next page to what is loaded, so every stock in the filtered
   * result is reachable and loaded records keep their identity.
   */
  async function handleLoadMore(): Promise<void> {
    if (nextCursor === null || loadingMore) {
      return;
    }
    setLoadingMore(true);
    try {
      const page = await listInstruments({
        symbol: symbolFilter || undefined,
        lifecycle: lifecycleFilter || undefined,
        cursor: nextCursor,
      });
      setState((current) =>
        current.kind === "populated"
          ? { ...current, data: [...current.data, ...page.rows] }
          : current,
      );
      setActiveCount(page.activeCount);
      setRetiredCount(page.retiredCount);
      setNextCursor(page.nextCursor);
    } catch (cause) {
      setState({
        kind: "error",
        message: cause instanceof Error ? cause.message : "the request could not be completed",
        requestId: "unknown",
      });
    } finally {
      setLoadingMore(false);
    }
  }

  /**
   * A rejected `retireInstrument` (404 unknown symbol, 409 already stopped, or a
   * transport failure) must not be presented as a completed stop (IR-004): the
   * dialog stays open with a visible error, and the table is only reloaded once
   * the call actually succeeds.
   */
  async function handleRetireConfirm(symbol: string): Promise<void> {
    setRetireError(null);
    try {
      await retireInstrument(symbol);
      setRetireTarget(null);
      setReloadToken((token) => token + 1);
    } catch (cause) {
      setRetireError(cause instanceof Error ? cause.message : "the request could not be completed");
    }
  }

  // Built once so the table's rows keep their identity across pages.
  const columns = useMemo<ColumnDef<Instrument>[]>(
    () => [
      {
        id: "symbol",
        header: "Symbol",
        cell: ({ row }) => (
          <span className="flex items-center gap-2">
            <Link
              to={`/data/coverage?symbol=${encodeURIComponent(row.original.symbol)}`}
              className={row.original.lifecycle === "retired" ? "text-muted-foreground" : undefined}
            >
              {row.original.symbol}
            </Link>
            {notFoundSymbols.has(row.original.symbol) ? <RecognitionBadge /> : null}
          </span>
        ),
      },
      {
        id: "lifecycle",
        header: "Lifecycle",
        cell: ({ row }) => <LifecycleBadge lifecycle={row.original.lifecycle} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) =>
          row.original.lifecycle === "active" ? (
            <Button
              type="button"
              variant="ghost"
              aria-label={`Stop following ${row.original.symbol}`}
              onClick={() => setRetireTarget({ symbol: row.original.symbol })}
            >
              Stop following
            </Button>
          ) : null,
      },
    ],
    [notFoundSymbols],
  );

  const renderers: StateRenderers<Instrument[]> = {
    ...RENDERERS,
    loading: () => <p>Loading followed stocks…</p>,
    "empty-no-match": () => (
      <div className="flex flex-col gap-2">
        <p>No stock matches this filter.</p>
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => {
            setSymbolFilter("");
            setLifecycleFilter("");
          }}
        >
          Reset filter
        </Button>
      </div>
    ),
    populated: (populated) => (
      <section aria-label="Followed stocks">
        <DataTable
          variant="virtualised"
          rowHeader
          getRowId={(row) => String(row.instrumentId)}
          data={populated.data}
          columns={columns}
          hasMore={nextCursor !== null}
          busy={loadingMore}
          onEndReached={() => void handleLoadMore()}
        />
      </section>
    ),
    error: (failed) => <p>Couldn't read followed stocks: {failed.message}.</p>,
  };

  return (
    <div className="flex flex-col gap-3">
      {state.kind === "error" ? null : (
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1 text-sm">
            <label htmlFor="followed-symbol-filter">Filter by symbol</label>
            <Input
              id="followed-symbol-filter"
              variant="text"
              value={symbolFilter}
              onChange={(event) => setSymbolFilter(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <span>Lifecycle</span>
            <Select
              value={lifecycleFilter === "" ? ALL : lifecycleFilter}
              onValueChange={(value) =>
                setLifecycleFilter(value === ALL ? "" : (value as InstrumentLifecycle))
              }
            >
              <SelectTrigger aria-label="Lifecycle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All</SelectItem>
                <SelectItem value="active">Followed</SelectItem>
                <SelectItem value="retired">Stopped following</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="font-numeric text-sm">
            {activeCount} followed, {retiredCount} stopped following
          </p>
        </div>
      )}

      <StateRegion
        state={state}
        renderers={renderers}
        onRetry={() => setReloadToken((t) => t + 1)}
      />

      {retireTarget !== null ? (
        <RetireDialog
          symbol={retireTarget.symbol}
          error={retireError}
          onConfirm={() => void handleRetireConfirm(retireTarget.symbol)}
          onCancel={() => {
            setRetireTarget(null);
            setRetireError(null);
          }}
        />
      ) : null}
    </div>
  );
}
