import { type JSX, useEffect, useState } from "react";
import { listInstruments, retireInstrument } from "../../api/client";
import type { Instrument, InstrumentLifecycle } from "../../api/types";
import { LifecycleBadge } from "./badges";
import { RetireDialog } from "./retire-dialog";

const FILTER_DEBOUNCE_MS = 250;

interface RetireTarget {
  symbol: string;
}

/**
 * The `data-table` `expandable` instrument table with its toolbar
 * (component design section 2.5; ux-design section 1.2; DAC-E2-10,
 * DAC-E2-S4-4). Active and retired instruments are one table with a
 * lifecycle column, not two tables (AC-21): splitting them would make a
 * retired instrument's history feel archived when it is still live
 * evidence.
 *
 * Filtering is server-side (component design section 2.6, T018): every
 * filter change issues a `listInstruments` request through the typed
 * client rather than filtering the currently loaded page, which is
 * required at AC-4's 3000-instrument volume — filtering only the loaded
 * page would produce a silently wrong result.
 */
export function InstrumentTable({ refreshToken = 0 }: { refreshToken?: number } = {}): JSX.Element {
  const [symbolFilter, setSymbolFilter] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState<InstrumentLifecycle | "">("");
  const [rows, setRows] = useState<Instrument[] | null>(null);
  const [activeCount, setActiveCount] = useState(0);
  const [retiredCount, setRetiredCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retireTarget, setRetireTarget] = useState<RetireTarget | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // refreshToken and reloadToken below are deliberate re-fetch triggers
  // (bumped by the parent screen and by a completed retirement), not
  // values read in the effect body.
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
            setRows(page.rows);
            setActiveCount(page.activeCount);
            setRetiredCount(page.retiredCount);
            setLoadError(null);
          })
          .catch((cause: unknown) => {
            if (cancelled) {
              return;
            }
            setLoadError(
              cause instanceof Error ? cause.message : "the request could not be completed",
            );
          });
      },
      symbolFilter === "" ? 0 : FILTER_DEBOUNCE_MS,
    );

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [symbolFilter, lifecycleFilter, refreshToken, reloadToken]);

  async function handleRetireConfirm(symbol: string): Promise<void> {
    try {
      await retireInstrument(symbol);
    } finally {
      setRetireTarget(null);
      setReloadToken((token) => token + 1);
    }
  }

  if (loadError !== null) {
    return (
      <div role="alert" className="text-status-critical">
        Loading instruments failed: {loadError}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3" data-testid="instrument-table-toolbar">
        <label className="flex flex-col gap-1 text-sm">
          Filter by symbol
          <input
            type="text"
            aria-label="Filter by symbol"
            value={symbolFilter}
            onChange={(event) => setSymbolFilter(event.target.value)}
            className="rounded border border-input p-2 text-base"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Lifecycle
          <select
            aria-label="Lifecycle"
            value={lifecycleFilter}
            onChange={(event) => setLifecycleFilter(event.target.value as InstrumentLifecycle | "")}
            className="rounded border border-input p-2 text-base"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="retired">Retired</option>
          </select>
        </label>
        <p className="font-numeric text-sm">
          {activeCount} active, {retiredCount} retired
        </p>
      </div>

      {rows === null ? (
        <p aria-live="polite">Loading instruments…</p>
      ) : rows.length === 0 ? (
        <div data-testid="instrument-table-no-match" className="flex flex-col gap-2">
          <p>No instrument matches this filter.</p>
          <button
            type="button"
            onClick={() => {
              setSymbolFilter("");
              setLifecycleFilter("");
            }}
            className="w-fit rounded border border-border px-3 py-2 text-sm"
          >
            Reset filter
          </button>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Symbol</th>
              <th scope="col">Lifecycle</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.instrumentId}>
                <th
                  scope="row"
                  className={row.lifecycle === "retired" ? "text-muted-foreground" : undefined}
                >
                  {row.symbol}
                </th>
                <td>
                  <LifecycleBadge lifecycle={row.lifecycle} />
                </td>
                <td>
                  {row.lifecycle === "active" ? (
                    <button
                      type="button"
                      aria-label={`Stop acquiring ${row.symbol}`}
                      onClick={() => setRetireTarget({ symbol: row.symbol })}
                      className="rounded px-2 py-1 text-sm"
                    >
                      Stop acquiring
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {retireTarget !== null ? (
        <RetireDialog
          symbol={retireTarget.symbol}
          hasActiveRun={false}
          onConfirm={() => void handleRetireConfirm(retireTarget.symbol)}
          onCancel={() => setRetireTarget(null)}
        />
      ) : null}
    </div>
  );
}
