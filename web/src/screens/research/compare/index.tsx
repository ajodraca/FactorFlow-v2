import { type FormEvent, type JSX, useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ClassificationApiError,
  getStockEvidence,
  listClassifications,
} from "../../../api/classification-client";
import type {
  ClassificationList,
  FactorName,
  StockEvidence,
} from "../../../api/classification-types";
import { ApiError, ApiUnreachableError } from "../../../api/client";
import {
  type ComparisonColumn,
  ComparisonTable,
} from "../../../components/patterns/comparison-table";
import { CELL, COMPARE, RESULTS, UNIVERSES, UNIVERSE_DETAIL, failureSentence } from "../copy";

const MIN_SYMBOLS = 2;
const MAX_SYMBOLS = 6;
const FACTORS: readonly FactorName[] = ["value", "growth", "momentum"];

/** The chosen symbols: the URL's one comma-joined `symbols` value (DEC-0163), uppercased, de-duplicated, in order. */
function parseSymbols(value: string | null): string[] {
  const parts = (value ?? "")
    .split(",")
    .map((part) => part.trim().toUpperCase())
    .filter((part) => part.length > 0);
  return [...new Set(parts)];
}

/** The tray's own form: commas literal, each symbol encoded (DEC-0163). */
function compareUrl(symbols: string[]): string {
  return `/research/compare?symbols=${symbols.map(encodeURIComponent).join(",")}`;
}

function codeOf(caught: unknown): string | null {
  return caught instanceof ApiError ? caught.code : null;
}

/** The evidence read's `factors` holds all three keys only for a stock with a row in the current set (DEC-0140). */
function hasAllFactors(evidence: StockEvidence): boolean {
  return FACTORS.every((factor) => evidence.factors[factor] !== undefined);
}

/**
 * The reads. A local union rather than `ScreenState`, whose `error` carries a
 * `message` this screen must never render (classification-ui 2.4).
 */
type Read =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "loaded" }
  | { kind: "error"; error: unknown };

type FocusTarget = { symbol: string } | "entry";

function readSentence(error: unknown): string {
  return error instanceof ClassificationApiError
    ? failureSentence(error)
    : failureSentence({
        operation: "list-classifications",
        resource: "classification",
        code: codeOf(error),
      });
}

function Skeleton({ count }: { count: number }): JSX.Element {
  return (
    <output aria-busy="true" className="flex gap-3 p-3">
      <span className="sr-only">{UNIVERSES.loading}</span>
      {Array.from({ length: count }, (_, index) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: a fixed-length placeholder.
          key={index}
          data-skeleton-column=""
          aria-hidden="true"
          className="block h-24 flex-1 rounded bg-secondary"
        />
      ))}
    </output>
  );
}

/** Is any restated mark on screen (value or growth percentile, or a backfilled input)? */
function hasMark(columns: ComparisonColumn[]): boolean {
  return columns.some(
    (column) =>
      FACTORS.some((factor) => factor !== "momentum" && column.factors[factor].restatedPossible) ||
      column.inputs.some((input) => input.factor !== "momentum" && input.restatedPossible),
  );
}

/**
 * The Compare screen, `/research/compare?symbols=A,B` (UX design 1.5;
 * classification-ui 2.5, 2.7; CAP-002-E5-S1), which CAP-002-E4-S10 routes to.
 * The chosen symbols live in the URL; two to six are read with one list read
 * and one evidence read per column. A stock keeps its column however its
 * cells read, and an unrecognised symbol is reported, not dropped silently.
 */
export default function CompareScreen(): JSX.Element | null {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const symbols = parseSymbols(searchParams.get("symbols"));
  const symbolsKey = symbols.join(",");
  const count = symbols.length;
  const blocked = count >= MAX_SYMBOLS;

  const [read, setRead] = useState<Read>({ kind: "idle" });
  const [attempt, setAttempt] = useState(0);
  const [list, setList] = useState<ClassificationList | null>(null);
  // The symbols `list` was read for: while the URL has moved on, it is stale and cannot say a symbol is absent.
  const [listKey, setListKey] = useState("");
  const [evidence, setEvidence] = useState<Record<string, StockEvidence>>({});
  const [unknown, setUnknown] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const evidenceRef = useRef(evidence);
  evidenceRef.current = evidence;
  const entryRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<FocusTarget | null>(null);
  // What the event handlers read: the URL's symbols and the columns on screen now, not those of the render that created them.
  const symbolsRef = useRef(symbols);
  symbolsRef.current = symbols;
  const shownRef = useRef<string[]>([]);
  const reasonId = useId();
  const errorId = useId();

  // biome-ignore lint/correctness/useExhaustiveDependencies: `symbolsKey` stands for `symbols`; `attempt` is the Try again trigger.
  useEffect(() => {
    if (count === 0 || count > MAX_SYMBOLS) {
      setRead({ kind: "idle" });
      setList(null);
      setUnknown([]);
      return;
    }
    let cancelled = false;
    setRead((previous) => (previous.kind === "loaded" ? previous : { kind: "loading" }));
    (async () => {
      const result = count >= MIN_SYMBOLS ? await listClassifications({ symbols }) : null;
      if (cancelled) {
        return;
      }
      const reported = result?.unknownSymbols.map((symbol) => symbol.toUpperCase()) ?? [];
      const columns = symbols.filter(
        (symbol) =>
          !reported.includes(symbol) &&
          (result === null || result.stocks.some((stock) => stock.symbol.toUpperCase() === symbol)),
      );
      // Evidence of another set than the list's would put old inputs under new scores (STD-UI-16).
      const missing = columns.filter((symbol) => {
        const cached = evidenceRef.current[symbol];
        return (
          cached === undefined ||
          (result?.set != null && (cached.set?.setId ?? null) !== result.set.setId)
        );
      });
      const settled = await Promise.allSettled(missing.map((symbol) => getStockEvidence(symbol)));
      const fetched: Record<string, StockEvidence> = {};
      const notFollowed: string[] = [];
      settled.forEach((outcome, index) => {
        const symbol = missing[index] as string;
        if (outcome.status === "fulfilled") {
          fetched[symbol] = outcome.value;
        } else if (count < MIN_SYMBOLS && codeOf(outcome.reason) === "instrument_not_found") {
          notFollowed.push(symbol);
        } else {
          throw outcome.reason;
        }
      });
      if (cancelled) {
        return;
      }
      setList(result);
      setListKey(symbolsKey);
      setEvidence((previous) => ({ ...previous, ...fetched }));
      setUnknown([...reported, ...notFollowed]);
      setRead({ kind: "loaded" });
    })().catch((caught: unknown) => {
      if (!cancelled) {
        setRead({ kind: "error", error: caught });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [symbolsKey, attempt]);

  // Focus follows a removal once the remaining header is on screen (T009).
  useEffect(() => {
    const target = focusRef.current;
    if (target === null) {
      return;
    }
    if (target === "entry") {
      focusRef.current = null;
      entryRef.current?.focus();
      return;
    }
    const header = tableRef.current?.querySelector<HTMLElement>(
      `th[data-symbol="${CSS.escape(target.symbol)}"]`,
    );
    if (header) {
      focusRef.current = null;
      header.focus();
    } else if (read.kind !== "loading") {
      // The read settled and that header never came: do not carry the target into a later render.
      focusRef.current = null;
    }
  });

  useEffect(() => {
    if (count === 0) {
      entryRef.current?.focus();
    }
  }, [count]);

  async function add(event: FormEvent): Promise<void> {
    event.preventDefault();
    const symbol = draft.trim().toUpperCase();
    if (blocked || symbol.length === 0) {
      return;
    }
    if (symbols.includes(symbol)) {
      setFieldError(COMPARE.duplicate(symbol));
      return;
    }
    try {
      const found = await getStockEvidence(symbol);
      setEvidence((previous) => ({ ...previous, [symbol]: found }));
      setFieldError(null);
      setDraft("");
      // The URL may have moved while the read was in flight (Back, a tray link).
      const next = [...new Set([...symbolsRef.current, symbol])];
      if (next.length <= MAX_SYMBOLS) {
        navigate(compareUrl(next));
      }
    } catch (caught) {
      if (caught instanceof ApiUnreachableError) {
        return;
      }
      setFieldError(
        failureSentence({
          operation: "get-stock-evidence",
          resource: "classification",
          code: codeOf(caught),
          symbols: [symbol],
        }),
      );
    }
  }

  function remove(symbol: string): void {
    const remaining = symbols.filter((candidate) => candidate !== symbol);
    const shown = shownRef.current;
    const index = shown.indexOf(symbol);
    const neighbour = shown[index + 1] ?? shown[index - 1];
    focusRef.current = neighbour === undefined ? "entry" : { symbol: neighbour };
    navigate(compareUrl(remaining));
  }

  if (read.kind === "error" && read.error instanceof ApiUnreachableError) {
    return null;
  }

  const columns: ComparisonColumn[] = [];
  let neverPopulated = false;
  const notCompared = [...unknown];
  // The list of a larger comparison is stale the moment it shrinks below two.
  const activeList = count >= MIN_SYMBOLS ? list : null;
  if (read.kind !== "loaded") {
    // Nothing to build yet.
  } else if (activeList !== null) {
    neverPopulated = activeList.neverClassified;
    for (const symbol of symbols) {
      const stock = activeList.stocks.find(
        (candidate) => candidate.symbol.toUpperCase() === symbol,
      );
      if (stock === undefined) {
        // Neither a row nor reported by the server: still never silently absent (DAC-E5-1).
        if (listKey === symbolsKey && !unknown.includes(symbol)) {
          notCompared.push(symbol);
        }
      } else {
        columns.push({
          symbol,
          name: stock.name,
          lifecycle: stock.lifecycle,
          factors: stock.factors,
          inputs: evidence[symbol]?.inputs ?? [],
        });
      }
    }
  } else if (count === 1) {
    const only = evidence[symbols[0] as string];
    if (only !== undefined) {
      if (only.set === null) {
        neverPopulated = true;
      } else if (hasAllFactors(only)) {
        columns.push({
          symbol: symbols[0] as string,
          name: only.name,
          lifecycle: only.lifecycle,
          factors: only.factors,
          inputs: only.inputs,
        });
      } else {
        notCompared.push(only.symbol.toUpperCase());
      }
    }
  }

  const prompt =
    count === 0 ? COMPARE.chooseTwoToSixEmpty : count < MIN_SYMBOLS ? COMPARE.chooseTwoToSix : null;
  shownRef.current = columns.map((column) => column.symbol);
  // Only the list read, which exists for two or more symbols, can hit the server's bound.
  const validationBound =
    read.kind === "error" && count >= MIN_SYMBOLS && codeOf(read.error) === "validation_error";

  return (
    <div className="flex flex-col gap-4">
      <nav aria-label={UNIVERSE_DETAIL.breadcrumb} className="text-sm text-muted-foreground">
        <Link to="/research" className="underline">
          {UNIVERSES.researchLink}
        </Link>
        <span aria-hidden="true"> › </span>
        <span aria-current="page">{COMPARE.breadcrumb}</span>
      </nav>
      <section className="flex flex-col gap-4 rounded border border-border bg-card p-4 text-card-foreground">
        <h1 className="text-xl font-semibold">{COMPARE.comparing(count)}</h1>
        <form onSubmit={(event) => void add(event)} className="flex flex-wrap items-start gap-2">
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 text-sm">
              {COMPARE.addAStock}
              <input
                ref={entryRef}
                type="text"
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setFieldError(null);
                }}
                aria-invalid={fieldError === null ? undefined : "true"}
                aria-describedby={fieldError === null ? undefined : errorId}
                className="rounded border border-border px-3 py-2"
              />
            </label>
            {fieldError === null ? null : (
              <p id={errorId} role="alert" className="text-[hsl(var(--destructive))] text-sm">
                {fieldError}
              </p>
            )}
          </div>
          <button
            type="submit"
            data-variant="secondary"
            aria-disabled={blocked}
            aria-describedby={blocked ? reasonId : undefined}
            className="rounded bg-secondary px-3 py-2 text-sm text-secondary-foreground"
          >
            {COMPARE.add}
          </button>
        </form>
        {blocked || validationBound ? (
          <p id={reasonId} className="text-sm">
            {COMPARE.atMost}
          </p>
        ) : null}
        {prompt === null ? null : <p className="text-sm">{prompt}</p>}
        {notCompared.length === 0 ? null : (
          <p className="text-sm">{COMPARE.notCompared(notCompared.join(", "))}</p>
        )}
        {read.kind === "loading" ||
        (read.kind === "loaded" && count >= MIN_SYMBOLS && list === null) ? (
          <Skeleton count={count} />
        ) : null}
        {read.kind === "error" && !validationBound ? (
          <div role="alert" className="flex flex-col items-start gap-2 text-sm">
            <p>{readSentence(read.error)}</p>
            <button
              type="button"
              onClick={() => setAttempt((previous) => previous + 1)}
              className="rounded border border-border px-3 py-2"
            >
              {RESULTS.tryAgain}
            </button>
          </div>
        ) : null}
        {neverPopulated ? <p className="text-sm">{RESULTS.neverScored}</p> : null}
        {columns.length > 0 ? (
          <div ref={tableRef} className="flex flex-col gap-2">
            <ComparisonTable columns={columns} factors={activeList?.factors} onRemove={remove} />
            {hasMark(columns) ? (
              <p className="text-xs text-muted-foreground">{CELL.restatedExplanation}</p>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
