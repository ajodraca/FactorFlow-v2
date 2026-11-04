import { type JSX, useCallback, useEffect, useRef, useState } from "react";
import { ClassificationApiError, getStockHistory } from "../../../api/classification-client";
import type { FactorName, StockHistoryRow } from "../../../api/classification-types";
import { ApiUnreachableError } from "../../../api/client";
import { FactorCell } from "../../../components/patterns/factor-cell";
import { StatusBadge, type StatusTier } from "../../../components/patterns/status-badge";
import { CELL, EVIDENCE, FACTOR_LABELS, RESULTS, SCORE_SET, failureSentence } from "../copy";
import { formatDate, formatTimestamp } from "../format";

/** The API's default page size (DEC-0178). */
const PAGE_SIZE = 50;

const FACTORS: readonly FactorName[] = ["value", "growth", "momentum"];

const OUTCOME_TIER: Record<StockHistoryRow["runOutcome"], { tier: StatusTier; word: string }> = {
  succeeded: { tier: "good", word: SCORE_SET.complete },
  partial: { tier: "warning", word: SCORE_SET.partial },
};

const HEAD_CLASS = "px-2 py-1 text-left text-xs text-muted-foreground";
const CELL_CLASS = "px-2 py-1 text-left align-top text-sm";

/**
 * A local union rather than `ScreenState`, whose `error` variant carries a
 * `message` this tab must never render (classification-ui 2.4), as the
 * delivered universe History tab does.
 */
type Body =
  | { kind: "loading" }
  | { kind: "error"; error: unknown }
  | { kind: "loaded"; rows: StockHistoryRow[]; nextCursor: string | null };

function sentenceFor(error: unknown, symbol: string): string {
  return error instanceof ClassificationApiError
    ? failureSentence({
        operation: error.operation,
        resource: error.resource,
        code: error.code,
        symbols: [symbol],
      })
    : failureSentence({ operation: "get-stock-history", resource: "classification", code: null });
}

/** A refused cursor names another set or ordering, so only the first page can recover it. */
function isRefusedCursor(error: unknown): boolean {
  return (
    error instanceof ClassificationApiError &&
    (error.code === "cursor_stale" || error.code === "cursor_invalid")
  );
}

/**
 * Whether `FactorCell` draws the mark on this factor's cell: a scored value or
 * growth cell that carries `restatedPossible` (DAC-E4-S3-3). The sentence
 * explains a mark, so it is shown only when one is drawn (DEC-0180).
 */
function drawsMark(row: StockHistoryRow, factor: "value" | "growth"): boolean {
  const cell = row.factors[factor];
  return (
    cell.restatedPossible &&
    cell.status === "classified" &&
    cell.percentile !== null &&
    cell.reasonCode !== "retired" &&
    cell.reasonCode !== "not_enough_stocks"
  );
}

function marksARow(row: StockHistoryRow): boolean {
  return drawsMark(row, "value") || drawsMark(row, "growth");
}

function HistoryRow({ row }: { row: StockHistoryRow }): JSX.Element {
  const outcome = OUTCOME_TIER[row.runOutcome];
  return (
    <tr className="border-t border-border">
      <th scope="row" className={`${CELL_CLASS} font-numeric font-normal`}>
        {formatDate(row.classificationDate)}
      </th>
      <td className={CELL_CLASS}>
        <span className="font-numeric">{formatTimestamp(row.endedAt)}</span>{" "}
        <StatusBadge tier={outcome.tier}>{outcome.word}</StatusBadge>
      </td>
      {FACTORS.map((factor) => (
        <td key={factor} className={CELL_CLASS}>
          <FactorCell cell={row.factors[factor]} factor={factor} showScore />
        </td>
      ))}
    </tr>
  );
}

/** The header cells of the table, shared by the loaded table and its skeleton. */
function Head(): JSX.Element {
  return (
    <thead>
      <tr>
        <th scope="col" className={HEAD_CLASS}>
          {SCORE_SET.historyColumns.scoresDate}
        </th>
        <th scope="col" className={HEAD_CLASS}>
          {EVIDENCE.producedColumn}
        </th>
        {FACTORS.map((factor) => (
          <th key={factor} scope="col" className={HEAD_CLASS}>
            {FACTOR_LABELS[factor]}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/**
 * The Earlier scores panel of the Stock evidence screen (AC-15, AC-18, AC-19,
 * AC-23; DAC-E5-S2-1 to -4; UX design 1.6; classification-ui 2.4, 10): one
 * stock's classifications in earlier sets in the order the history read
 * returned them, each row one set's result as recorded. The tab fetches,
 * renders and nothing more: no row is sorted, filtered, re-dated or
 * recomputed, and a retired stock's rows are not special-cased (DEC-0178,
 * DEC-0179, DEC-0180).
 *
 * The first page is read on mount and again when the symbol changes; **Show
 * more** appends the next keyset page after the rows already shown. A failed
 * first read replaces the body with the operation, resource and reason
 * sentence (by `code`, never the envelope's `message`) and **Try again**; a
 * failed later page keeps the rows and states the failure beneath them. An
 * unreachable API renders nothing: the shell owns that state.
 */
export default function HistoryTab({ symbol }: { symbol: string }): JSX.Element | null {
  const [body, setBody] = useState<Body>({ kind: "loading" });
  const [pagePending, setPagePending] = useState(false);
  const [pageError, setPageError] = useState<unknown>(null);
  const [unreachable, setUnreachable] = useState(false);
  /** Set when the last page removes a focused Show more: focus then moves to the table. */
  const [focusTable, setFocusTable] = useState(false);
  const moreRef = useRef<HTMLButtonElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  /** Bumped by Try again: the history is read again from its first page. */
  const [attempt, setAttempt] = useState(0);
  /** A response from an earlier read, or one settling after unmount, is ignored. */
  const generation = useRef(0);

  useEffect(
    () => () => {
      generation.current += 1;
    },
    [],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: attempt is the Try again trigger.
  useEffect(() => {
    generation.current += 1;
    const current = generation.current;
    setBody({ kind: "loading" });
    setPagePending(false);
    setPageError(null);
    setUnreachable(false);
    getStockHistory(symbol, { limit: PAGE_SIZE })
      .then((page) => {
        if (current === generation.current) {
          setBody({ kind: "loaded", rows: page.sets, nextCursor: page.nextCursor });
        }
      })
      .catch((error: unknown) => {
        if (current !== generation.current) {
          return;
        }
        if (error instanceof ApiUnreachableError) {
          setUnreachable(true);
        } else {
          setBody({ kind: "error", error });
        }
      });
  }, [symbol, attempt]);

  const readMore = useCallback(
    (cursor: string): void => {
      const current = generation.current;
      setPagePending(true);
      setPageError(null);
      getStockHistory(symbol, { limit: PAGE_SIZE, cursor })
        .then((page) => {
          if (current !== generation.current) {
            return;
          }
          if (page.nextCursor === null && document.activeElement === moreRef.current) {
            setFocusTable(true);
          }
          setBody((previous) =>
            previous.kind === "loaded"
              ? {
                  kind: "loaded",
                  rows: [...previous.rows, ...page.sets],
                  nextCursor: page.nextCursor,
                }
              : previous,
          );
          setPagePending(false);
        })
        .catch((error: unknown) => {
          if (current !== generation.current) {
            return;
          }
          setPagePending(false);
          if (error instanceof ApiUnreachableError) {
            setUnreachable(true);
          } else {
            setPageError(error);
          }
        });
    },
    [symbol],
  );

  useEffect(() => {
    if (focusTable) {
      setFocusTable(false);
      tableRef.current?.focus();
    }
  }, [focusTable]);

  if (unreachable) {
    return null;
  }

  if (body.kind === "loading") {
    return (
      <table
        aria-label={EVIDENCE.earlierScoresFor(symbol)}
        aria-busy="true"
        data-variant="history"
        className="w-full border-collapse"
      >
        <Head />
        <tbody>
          {[0, 1, 2].map((index) => (
            <tr key={index} className="border-t border-border">
              <td colSpan={5} className={CELL_CLASS}>
                <span aria-hidden="true" className="block h-2 rounded bg-secondary" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (body.kind === "error") {
    return (
      <div className="flex flex-col gap-2 text-sm">
        <p>{sentenceFor(body.error, symbol)}</p>
        <button
          type="button"
          onClick={() => setAttempt((count) => count + 1)}
          className="w-fit rounded border border-border px-3 py-2"
        >
          {RESULTS.tryAgain}
        </button>
      </div>
    );
  }

  if (body.rows.length === 0) {
    return <p className="text-sm">{EVIDENCE.noEarlierScores(symbol)}</p>;
  }

  const { nextCursor } = body;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">{EVIDENCE.historyNote}</p>
      {body.rows.some(marksARow) ? (
        <p className="text-xs text-muted-foreground">{CELL.restatedExplanation}</p>
      ) : null}
      <table
        ref={tableRef}
        tabIndex={-1}
        aria-label={EVIDENCE.earlierScoresFor(symbol)}
        data-variant="history"
        className="w-full border-collapse"
      >
        <Head />
        <tbody>
          {body.rows.map((row) => (
            <HistoryRow key={row.setId} row={row} />
          ))}
        </tbody>
      </table>
      {pageError === null ? null : (
        <div className="flex flex-col gap-2 text-sm">
          <p role="alert">{sentenceFor(pageError, symbol)}</p>
          <button
            type="button"
            data-variant="secondary"
            onClick={() => {
              if (isRefusedCursor(pageError) || nextCursor === null) {
                setAttempt((count) => count + 1);
              } else {
                readMore(nextCursor);
              }
            }}
            className="w-fit rounded bg-secondary px-3 py-2 text-secondary-foreground"
          >
            {RESULTS.tryAgain}
          </button>
        </div>
      )}
      {nextCursor === null ? null : (
        <button
          ref={moreRef}
          type="button"
          data-variant="secondary"
          aria-disabled={pagePending ? "true" : undefined}
          onClick={() => {
            if (!pagePending) {
              readMore(nextCursor);
            }
          }}
          className="min-h-6 w-fit rounded bg-secondary px-3 py-2 text-sm text-secondary-foreground"
        >
          {SCORE_SET.showMore}
        </button>
      )}
    </div>
  );
}
