import { type JSX, useEffect, useId, useRef, useState } from "react";
import { ApiError, fetchCoverageGapDates } from "../../api/client";
import type { CoverageDataType, CoverageGapDetection, CoverageRow } from "../../api/types";
import { LifecycleBadge } from "../instruments/badges";
import { DepthShortBadge, PresenceBadge } from "./badges";
import { GapsCell, MissingValue, SessionDate, Timestamp } from "./cells";
import { GAPS_INAPPLICABLE, NO_GAPS, OUTAGE_SENTENCE, reasonSentence } from "./copy";

const DATA_TYPES: CoverageDataType[] = ["reference", "prices", "fundamentals", "corporate_actions"];

const HEADERS: { label: string; numeric?: boolean }[] = [
  { label: "Symbol" },
  { label: "Lifecycle" },
  { label: "Reference" },
  { label: "Prices" },
  { label: "Fundamentals" },
  { label: "Corporate actions" },
  { label: "Covered from", numeric: true },
  { label: "Covered to", numeric: true },
  { label: "Gaps", numeric: true },
  { label: "Depth" },
  { label: "Last acquired", numeric: true },
];

type GapDatesEntry =
  | { status: "loading" }
  | { status: "loaded"; gapDates: string[] | null }
  | { status: "error"; message: string; requestId: string };

export interface CoverageTableProps {
  rows: CoverageRow[];
  gapDetection: CoverageGapDetection;
  refreshing: boolean;
  /** Clears the expansion cache when it changes: a refresh, filter or page change. */
  refreshToken: number;
}

/**
 * The `data-table` `expandable` coverage table (ux-design 1.1;
 * owner-web-app 2.3; AC-7, AC-8, AC-21, AC-22, DAC-E6-4).
 *
 * Gap dates sit behind row expansion and are fetched once per expanded
 * row, only when the view is available and the count is positive; every
 * other case is answered locally (CAP-001-E6-S4-tasks Open Gap 4), through
 * the provisional `expand` request of Open Gap 1. Results
 * are cached by symbol until `refreshToken` changes. Expansion content is
 * limited to gap dates and the unavailable reason, since no contract
 * carries the identity fields ux-design 1.1 lists (Open Gap 8).
 *
 * While `refreshing`, the previous rows stay rendered, dimmed and marked
 * busy, rather than collapsing to a loading message (data-table spec
 * section 4).
 */
export function CoverageTable({
  rows,
  gapDetection,
  refreshing,
  refreshToken,
}: CoverageTableProps): JSX.Element {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [gapDates, setGapDates] = useState<Record<string, GapDatesEntry>>({});
  const mounted = useRef(true);
  const generation = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // refreshToken is a deliberate cache-reset trigger, not a value read here.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    generation.current += 1;
    setExpanded({});
    setGapDates({});
  }, [refreshToken]);

  function loadGapDates(symbol: string): void {
    const started = generation.current;
    const current = (): boolean => mounted.current && started === generation.current;
    setGapDates((cache) => ({ ...cache, [symbol]: { status: "loading" } }));
    // Fetch on expansion: DAC-E6-14 governs over ux-design 1.1; see Resolved Conflict 1
    fetchCoverageGapDates(symbol)
      .then((expansion) => {
        if (current()) {
          setGapDates((cache) => ({
            ...cache,
            [symbol]: { status: "loaded", gapDates: expansion.gapDates },
          }));
        }
      })
      .catch((cause: unknown) => {
        if (current()) {
          setGapDates((cache) => ({
            ...cache,
            [symbol]: {
              status: "error",
              message:
                cause instanceof Error ? cause.message : "the request could not be completed",
              requestId: cause instanceof ApiError ? cause.requestId : "unknown",
            },
          }));
        }
      });
  }

  function toggle(row: CoverageRow): void {
    const opening = !expanded[row.symbol];
    setExpanded((state) => ({ ...state, [row.symbol]: opening }));
    const needsFetch = gapDetection.available && row.gapCount !== null && row.gapCount > 0;
    if (opening && needsFetch && gapDates[row.symbol] === undefined) {
      loadGapDates(row.symbol);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <table aria-busy={refreshing} className="text-sm">
        <thead>
          <tr>
            {HEADERS.map(({ label, numeric }) => (
              <th
                key={label}
                scope="col"
                className={`text-muted-foreground ${numeric ? "text-right" : "text-left"}`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={refreshing ? "text-muted-foreground" : undefined}>
          {rows.map((row) => (
            <CoverageTableRow
              key={row.symbol}
              row={row}
              gapDetection={gapDetection}
              expanded={expanded[row.symbol] === true}
              entry={gapDates[row.symbol]}
              onToggle={() => toggle(row)}
              onRetry={() => loadGapDates(row.symbol)}
            />
          ))}
        </tbody>
      </table>
      <p className="text-xs text-muted-foreground">
        {gapDetection.available ? OUTAGE_SENTENCE : reasonSentence(gapDetection.reason)}
      </p>
    </div>
  );
}

interface CoverageTableRowProps {
  row: CoverageRow;
  gapDetection: CoverageGapDetection;
  expanded: boolean;
  entry: GapDatesEntry | undefined;
  onToggle: () => void;
  onRetry: () => void;
}

function CoverageTableRow({
  row,
  gapDetection,
  expanded,
  entry,
  onToggle,
  onRetry,
}: CoverageTableRowProps): JSX.Element {
  const detailId = useId();
  return (
    <>
      <tr>
        <th
          scope="row"
          className={`text-left ${row.lifecycle === "retired" ? "text-muted-foreground" : ""}`}
        >
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={detailId}
            aria-label={`${expanded ? "Hide" : "Show"} details for ${row.symbol}`}
            onClick={onToggle}
            className="mr-2 rounded px-1"
          >
            <span aria-hidden="true">{expanded ? "▾" : "▸"}</span>
          </button>
          {row.symbol}
        </th>
        <td>
          <LifecycleBadge lifecycle={row.lifecycle} />
        </td>
        {DATA_TYPES.map((dataType) => (
          <td key={dataType}>
            <PresenceBadge state={row.dataTypes[dataType]} />
          </td>
        ))}
        <td className="text-right">
          {row.coveredFrom === null ? <MissingValue /> : <SessionDate value={row.coveredFrom} />}
        </td>
        <td className="text-right">
          {row.coveredTo === null ? <MissingValue /> : <SessionDate value={row.coveredTo} />}
        </td>
        <td className="text-right">
          <GapsCell gapCount={row.gapCount} available={gapDetection.available} />
        </td>
        <td>
          {row.depthShortByYears !== null && row.depthShortByYears > 0 ? (
            <DepthShortBadge years={row.depthShortByYears} />
          ) : null}
        </td>
        <td className="text-right">
          {row.lastAcquiredAt === null ? (
            <MissingValue />
          ) : (
            <Timestamp value={row.lastAcquiredAt} />
          )}
        </td>
      </tr>
      {expanded ? (
        <tr id={detailId}>
          <td colSpan={HEADERS.length}>
            <div aria-live="polite">
              <ExpansionContent
                row={row}
                gapDetection={gapDetection}
                entry={entry}
                onRetry={onRetry}
              />
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function ExpansionContent({
  row,
  gapDetection,
  entry,
  onRetry,
}: Omit<CoverageTableRowProps, "expanded" | "onToggle">): JSX.Element {
  if (!gapDetection.available) {
    return <p>{reasonSentence(gapDetection.reason)}</p>;
  }
  if (row.gapCount === null) {
    return <p>{GAPS_INAPPLICABLE}</p>;
  }
  if (row.gapCount === 0) {
    return <p>{NO_GAPS}</p>;
  }
  if (entry === undefined || entry.status === "loading") {
    return <p>Loading missing dates…</p>;
  }
  if (entry.status === "error") {
    return (
      <div className="flex flex-col gap-2 text-status-critical">
        <p>
          Loading missing dates for {row.symbol} failed: {entry.message} (request {entry.requestId})
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="w-fit rounded border border-border px-3 py-2 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }
  if (entry.gapDates === null) {
    return <p>{reasonSentence(gapDetection.reason)}</p>;
  }
  return (
    <ul className="flex flex-col gap-1">
      {[...entry.gapDates].sort().map((date) => (
        <li key={date}>
          <SessionDate value={date} />
        </li>
      ))}
    </ul>
  );
}
