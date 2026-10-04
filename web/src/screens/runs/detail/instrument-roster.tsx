import { type JSX, useId } from "react";
import type { DataType, ResultOutcome, RunResult } from "../../../api/types";
import { RESULT_OUTCOME_ORDER, ResultOutcomeBadge } from "./result-outcome-badge";

/** The fixed order an expanded instrument lists its data types in. */
const DATA_TYPE_ORDER: DataType[] = ["reference", "prices", "fundamentals", "corporate_actions"];

/** ux-design 1.1's data-type column names. */
const DATA_TYPE_LABEL: Record<DataType, string> = {
  reference: "Reference",
  prices: "Prices",
  fundamentals: "Fundamentals",
  corporate_actions: "Corporate actions",
};

export interface InstrumentGroup {
  instrumentId: number;
  symbol: string;
  results: RunResult[];
}

/**
 * Groups consecutive result rows by instrument, keeping the server's
 * failure-first order (ingestion-api 2.3) and taking each symbol from the
 * group's first row.
 */
export function groupByInstrument(results: RunResult[]): InstrumentGroup[] {
  const groups: InstrumentGroup[] = [];
  for (const row of results) {
    const last = groups[groups.length - 1];
    if (last !== undefined && last.instrumentId === row.instrumentId) {
      last.results.push(row);
    } else {
      groups.push({ instrumentId: row.instrumentId, symbol: row.symbol, results: [row] });
    }
  }
  return groups;
}

/**
 * A data type's detail sentence (ux-design 1.5; STD-UI-19's operation,
 * resource and reason; CAP-001-E7-S4-tasks Open Gap P5). `not_found` never
 * reads as a failure (AC-11).
 */
function detailText(row: RunResult, symbol: string): string {
  const what = DATA_TYPE_LABEL[row.dataType].toLowerCase();
  if (row.outcome === "failed") {
    return `Acquiring ${what} for ${symbol} failed: ${row.reason ?? "No reason was recorded."}`;
  }
  if (row.outcome === "not_found") {
    const sentence = `Acquiring ${what} for ${symbol}: not found at the provider.`;
    return row.reason === null ? sentence : `${sentence} ${row.reason}`;
  }
  return row.reason ?? "";
}

function distinctOutcomes(results: RunResult[]): ResultOutcome[] {
  return RESULT_OUTCOME_ORDER.filter((outcome) => results.some((row) => row.outcome === outcome));
}

/**
 * The instrument roster as a `data-table` `expandable` (ux-design 1.5;
 * owner-web-app 2.3). One collapsed row per instrument, so a 3000-instrument
 * run reads one row each, expanding to the data-type rows the API returned
 * (DAC-E7-9). Under an outcome filter the API returns only matching rows, so
 * none is synthesised here (DEC-0016).
 *
 * Each instrument is its own `tbody`, which its expander controls. Every
 * value is a React text child, never markup (owner-web-app 4; DAC-E7-S4-5).
 */
export function InstrumentRoster({
  results,
  busy,
  expanded,
  onToggle,
}: {
  results: RunResult[];
  busy: boolean;
  expanded: ReadonlySet<number>;
  onToggle: (instrumentId: number) => void;
}): JSX.Element {
  const baseId = useId();

  return (
    <table data-variant="expandable" aria-busy={busy} className="w-full text-left text-sm">
      <thead>
        <tr>
          <th scope="col">
            <span className="sr-only">Expand</span>
          </th>
          <th scope="col">Instrument</th>
          <th scope="col">Outcomes</th>
        </tr>
      </thead>
      {groupByInstrument(results).map((group) => {
        const open = expanded.has(group.instrumentId);
        const groupId = `${baseId}-instrument-${group.instrumentId}`;
        const rows = DATA_TYPE_ORDER.flatMap((dataType) =>
          group.results.filter((row) => row.dataType === dataType),
        );
        return (
          <tbody key={group.instrumentId} id={groupId} className="border-t border-border">
            <tr className="h-row">
              <td>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={groupId}
                  aria-label={`${open ? "Hide" : "Show"} data types for ${group.symbol}`}
                  onClick={() => onToggle(group.instrumentId)}
                  className="rounded px-2 py-1"
                >
                  <span aria-hidden="true">{open ? "▾" : "▸"}</span>
                </button>
              </td>
              <th scope="row" className="font-normal">
                {group.symbol}
              </th>
              <td>
                <span className="flex flex-wrap gap-1">
                  {distinctOutcomes(group.results).map((outcome) => (
                    <ResultOutcomeBadge key={outcome} outcome={outcome} />
                  ))}
                </span>
              </td>
            </tr>
            {open
              ? rows.map((row) => (
                  <tr key={row.dataType} className="h-row">
                    <td />
                    <th scope="row" className="pl-4 font-normal">
                      {DATA_TYPE_LABEL[row.dataType]}
                    </th>
                    <td>
                      <span className="flex flex-wrap items-center gap-2">
                        <ResultOutcomeBadge outcome={row.outcome} />
                        <span>{detailText(row, group.symbol)}</span>
                      </span>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        );
      })}
    </table>
  );
}
