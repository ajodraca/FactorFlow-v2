import {
  type CSSProperties,
  type JSX,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { ClassificationApiError, listClassifications } from "../../api/classification-client";
import type {
  ClassificationList,
  FactorCell as FactorCellData,
  FactorName,
  FactorSummary,
  StockRow,
} from "../../api/classification-types";
import { type ResearchQuery, type SortKey, toListParams } from "../../api/research-query";
import { FactorCell } from "../../components/patterns/factor-cell";
import { CELL, FACTOR_LABELS, RESULTS, SORT, failureSentence } from "./copy";
import {
  PAGE_SIZE,
  ROW_HEIGHT_PX,
  VIEWPORT_ROWS,
  needsNextPage,
  scrollTopToReveal,
  visibleWindow,
} from "./results-window";

const FACTORS: readonly FactorName[] = ["value", "growth", "momentum"];

/** Rows of the skeleton on the first-ever load (data-table contract section 4). */
const SKELETON_ROWS = 12;
const SKELETON_KEYS = Array.from({ length: SKELETON_ROWS }, (_, index) => `skeleton-${index}`);

/**
 * Rows the header is allowed: its two-line factor headings (name over the
 * *{n} qualified, 30 needed* sentence) take about two row heights, and the
 * header scrolls with the body inside the fixed-height container, kept in
 * view by `sticky`.
 */
const HEADER_ROWS = 2;
const SCROLL_HEIGHT_PX = (VIEWPORT_ROWS + HEADER_ROWS) * ROW_HEIGHT_PX;

/**
 * How long after the last selection change `onInspect` fires (DAC-E4-S6-4;
 * DEC-0162). This governs only the table's notification: `InspectorPanel`
 * (E4-S7) debounces its own `symbol` prop by its own constant of the same
 * name (DEC-0164), so a host passes it the immediate `selected` and never
 * wires `onInspect` into it, which would make the wait 300 ms.
 */
export const INSPECT_DEBOUNCE_MS = 150;

/** The checked row's fill: `--muted` as an inline style (UX design 1.1; DEC-0240). */
const CHECKED_FILL: CSSProperties = { background: "hsl(var(--muted))" };

/**
 * Which host body replaces the rows (DEC-0159; classification-ui 2.6; UX
 * design 1.1 States; DAC-E4-S9-1): `never-populated` replaces the whole
 * table, `no-match` is the body's only row under the kept header.
 */
export type EmptyKind = "never-populated" | "no-match";

/**
 * What `onResult` hands the host once per first page: the response, whose
 * `neverClassified`, `set`, `later`, `factors` and `matchCount` drive the h1,
 * the as-of line and the banner (DEC-0159; DAC-E4-S6-2's announced count).
 */
export type FirstPage = ClassificationList;

/**
 * A host-supplied column (DEC-0159, amended E4-F02): the Members tab's
 * *Member since* (`placement: "afterName"`, between Name and Value) and its
 * in-row **Remove…** (`placement: "end"`, the default, after Momentum).
 * Entries with the same placement render in array order. A click anywhere in
 * a row selects it (DAC-E4-S6-4), so a control a host renders in a cell
 * stops the click's propagation, as the row's own checkbox does, when
 * activating it must not select the row.
 */
export interface ExtraColumn {
  id: string;
  header: string;
  align?: "left" | "right";
  placement?: "afterName" | "end";
  cell: (row: StockRow) => ReactNode;
}

/** The table's contract with its hosts (DEC-0159; CAP-002-E4-S6 Open Gap 1). */
export interface ResultsTableProps {
  /** The effective query, controlled by the host and held in the URL (DAC-E4-3). */
  query: ResearchQuery;
  onQueryChange: (query: ResearchQuery) => void;
  /** Bumped by the host to reload page one once with the same query (DEC-0062). */
  refreshKey: number;
  /** The selected symbol, controlled by the host so it survives sort, filter, scope and refresh. */
  selected: string | null;
  onSelect: (symbol: string) => void;
  /** A debounced selection notification; see the component's doc comment. */
  onInspect: (symbol: string) => void;
  /** The checked symbols in checking order, controlled by the host. */
  checked: readonly string[];
  onCheckedChange: (checked: string[]) => void;
  /** Called once per first page with the response, never for a later page. */
  onResult: (page: FirstPage) => void;
  /** The host's never-populated and nothing-found bodies (DAC-E4-S9-1). */
  empty: (kind: EmptyKind) => ReactNode;
  /** The sentence the live region announces for a match count; default *{n} stocks match*. */
  matchLabel?: (matchCount: number) => string;
  /** The host's own columns, each rendered by its placement (DEC-0159). */
  extraColumns?: readonly ExtraColumn[];
}

/** The inputs a first page was read for; a later page is read only for the epoch the rows belong to. */
interface Epoch {
  query: ResearchQuery;
  refreshKey: number;
  attempt: number;
}

interface Loaded {
  first: ClassificationList;
  stocks: StockRow[];
  nextCursor: string | null;
  epoch: Epoch;
}

interface PageError {
  cursor: string;
  error: unknown;
}

/** The STD-UI-19 sentence for a failed list read: by code, never by message. */
function sentenceFor(error: unknown): string {
  if (error instanceof ClassificationApiError) {
    return failureSentence(error);
  }
  return failureSentence({
    operation: "list-classifications",
    resource: "classification",
    code: null,
  });
}

function isStaleCursor(error: unknown): boolean {
  return error instanceof ClassificationApiError && error.code === "cursor_stale";
}

/** `incoming` after `existing`, dropping any symbol already loaded. */
function appendNew(existing: StockRow[], incoming: StockRow[]): StockRow[] {
  const known = new Set(existing.map((row) => row.symbol));
  return [...existing, ...incoming.filter((row) => !known.has(row.symbol))];
}

/** The symbol of the row holding focus inside `container`, through the row or a control in it; null when focus is elsewhere. */
function focusedSymbolIn(container: HTMLElement | null): string | null {
  const row = document.activeElement?.closest<HTMLTableRowElement>("tr[data-symbol]");
  if (!row || !container?.contains(row)) {
    return null;
  }
  return row.dataset.symbol ?? null;
}

function swatchStyle(factor: FactorName): CSSProperties {
  // The identity token as an inline style: tailwind.config.js maps no
  // `factor` colour (CAP-002-E4-S6 Open Gap 5; STD-UI-29 introduces no literal).
  return { background: `hsl(var(--factor-${factor}))` };
}

/** The 24 px sort target (data-table accessibility contract; `--space-5`). */
const SORT_BUTTON = "inline-flex h-5 w-5 items-center justify-center rounded";

type AriaSort = "ascending" | "descending";

/** The column's `aria-sort` for the active sort, when the body holds sorted rows. */
function ariaSortFor(
  sort: ResearchQuery["sort"],
  key: SortKey,
  shown: boolean,
): AriaSort | undefined {
  if (!shown || sort === null || sort.key !== key) {
    return undefined;
  }
  return sort.order === "asc" ? "ascending" : "descending";
}

/**
 * The next sort after activating `key`: ascending, descending, then the
 * unsorted default (data-table interaction contract; DEC-0161). The Symbol
 * column's unsorted default is its ascending order, so its cycle reads
 * ascending (default), descending, ascending (default): from a factor sort
 * its first activation returns to that default, A to Z, as any column not
 * currently sorted begins at ascending.
 */
function nextSort(sort: ResearchQuery["sort"], key: SortKey): ResearchQuery["sort"] {
  if (key === "symbol") {
    const atDefault = sort === null || (sort.key === "symbol" && sort.order === "asc");
    return atDefault ? { key, order: "desc" } : null;
  }
  if (sort === null || sort.key !== key) {
    return { key, order: "asc" };
  }
  return sort.order === "asc" ? { key, order: "desc" } : null;
}

/**
 * What the polite region holds (DAC-E4-S6-2; data-table accessibility
 * contract). A sort or a refresh-once rarely changes the match count, and a
 * live region announces changes only, so each first page also bumps `serial`:
 * the sentence is re-inserted as a new node and read again even when its text
 * is the one already shown.
 */
interface Announcement {
  text: string;
  serial: number;
}

interface SortButtonProps {
  name: string;
  active: AriaSort | undefined;
  onActivate: () => void;
}

/** One sort control: its accessible name is the whole button, the arrow is decoration. */
function SortButton({ name, active, onActivate }: SortButtonProps): JSX.Element {
  return (
    <button type="button" aria-label={name} onClick={onActivate} className={SORT_BUTTON}>
      <span aria-hidden="true">
        {active === "ascending" ? "▲" : active === "descending" ? "▼" : "↕"}
      </span>
    </button>
  );
}

interface FactorHeaderProps {
  factor: FactorName;
  summary: FactorSummary | null;
  sort: ResearchQuery["sort"];
  /** Whether the body holds sorted rows, which is when a column may carry `aria-sort`. */
  sorted: boolean;
  descriptionId: string;
  onSort: (key: SortKey) => void;
}

/**
 * A factor's column header: swatch and name; two sort buttons (percentile,
 * standardised score) with the incomplete-last description when the factor
 * is ranked; the *{n} qualified, {m} needed* sentence and no control when it
 * is not (DAC-E4-S6-1; DEC-0161).
 */
function FactorHeader({
  factor,
  summary,
  sort,
  sorted,
  descriptionId,
  onSort,
}: FactorHeaderProps): JSX.Element {
  const ranked = summary === null || summary.ranked;
  const percentileKey: SortKey = `${factor}_percentile`;
  const scoreKey: SortKey = `${factor}_score`;
  const ariaSort = ranked
    ? (ariaSortFor(sort, percentileKey, sorted) ?? ariaSortFor(sort, scoreKey, sorted))
    : undefined;
  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      aria-describedby={ranked ? descriptionId : undefined}
      className="text-right align-top"
    >
      <span className="inline-flex items-center gap-1">
        <span
          data-testid="factor-swatch"
          aria-hidden="true"
          className="inline-block h-2 w-2 rounded"
          style={swatchStyle(factor)}
        />
        {FACTOR_LABELS[factor]}
        {ranked ? (
          <>
            <SortButton
              name={SORT.byPercentile(factor)}
              active={ariaSortFor(sort, percentileKey, sorted)}
              onActivate={() => onSort(percentileKey)}
            />
            <SortButton
              name={SORT.byStandardisedScore(factor)}
              active={ariaSortFor(sort, scoreKey, sorted)}
              onActivate={() => onSort(scoreKey)}
            />
          </>
        ) : null}
      </span>
      {ranked || summary === null ? null : (
        <span className="block font-normal text-muted-foreground text-xs">
          {CELL.qualified(summary.qualifiedCount, summary.minPeerSetSize)}
        </span>
      )}
    </th>
  );
}

/**
 * The cell as rendered: an unranked column reads *Not enough to rank* in
 * every cell whatever the cell says, unless the stock is no longer followed
 * (AC-14; DAC-E4-S6-1).
 */
function cellFor(
  row: StockRow,
  factor: FactorName,
  summaries: Record<FactorName, FactorSummary> | null,
): FactorCellData {
  const cell = row.factors[factor];
  if (summaries === null || summaries[factor].ranked || cell.reasonCode === "retired") {
    return cell;
  }
  return {
    ...cell,
    status: "not_classified",
    score: null,
    percentile: null,
    reasonCode: "not_enough_stocks",
  };
}

/**
 * The results table of the Research screen (E4-S9) and a universe's Members
 * tab (E1-S8) (classification-ui 2.5; UX design 1.1; DAC-E4-S6-1 to
 * DAC-E4-S6-5).
 *
 * A native `table` windowed over keyset pages (DEC-0160; DAC-E4-S6-5): the
 * DOM holds a bounded number of rows however many stocks match, more pages
 * are appended as the window nears the loaded end, and sorting, filtering
 * and counting are the server's (DAC-E4-S6-2). A factor below the peer-set
 * minimum states its count once in its header and ranks nothing
 * (DAC-E4-S6-1); a stock incomplete on one factor reads two percentiles and
 * one *Incomplete* in the response's order (DAC-E4-S6-3).
 *
 * The contract the hosts and the tray and inspector (E4-S7) rely on
 * (DEC-0159, DEC-0162, DEC-0164):
 * - `selected` and `checked` are controlled by symbol, so they survive sort,
 *   filter, scope and the refresh-once; `onSelect` is immediate and
 *   `onCheckedChange` receives the whole list in checking order
 *   (DAC-E4-S6-4).
 * - `onInspect` is a debounced selection notification: it fires once,
 *   `INSPECT_DEBOUNCE_MS` (150 ms) after the last selection change, and is
 *   not the inspector's trigger. `InspectorPanel` debounces its own `symbol`
 *   prop, so a host passes it the immediate `selected` and must not wire
 *   `onInspect` into it, which would make the wait 300 ms.
 * - `empty` and `onResult` are the host's seams: the never-populated and
 *   nothing-found bodies, and the h1, as-of line and banner, stay the host's.
 * - `refreshKey` reloads page one once with the same query; `extraColumns`
 *   adds the host's columns by placement.
 * - `query` is compared by identity: a new object reads page one again, so a
 *   host keeps one object per URL state (decoded once per search string, not
 *   on every render), or each `onResult` would start another read.
 */
export function ResultsTable(props: ResultsTableProps): JSX.Element {
  const {
    query,
    onQueryChange,
    refreshKey,
    selected,
    onSelect,
    checked,
    onCheckedChange,
    empty,
    matchLabel = RESULTS.stocksMatch,
    extraColumns = [],
  } = props;
  const descriptionId = useId();
  const onResultRef = useRef(props.onResult);
  onResultRef.current = props.onResult;
  const matchLabelRef = useRef(matchLabel);
  matchLabelRef.current = matchLabel;
  const onInspectRef = useRef(props.onInspect);
  onInspectRef.current = props.onInspect;
  /** The one `onInspect` debounce, cleared on each new selection and on unmount. */
  const inspectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** A row to focus once it is rendered: an arrow key scrolls it into the window first. */
  const pendingFocus = useRef<string | null>(null);

  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [firstPending, setFirstPending] = useState(true);
  const [pagePending, setPagePending] = useState(false);
  const [firstError, setFirstError] = useState<unknown>(null);
  const [pageError, setPageError] = useState<PageError | null>(null);
  const [announcement, setAnnouncement] = useState<Announcement>({ text: "", serial: 0 });
  const [scrollTop, setScrollTop] = useState(0);
  /** Bumped by Try again on a first page and by the one stale-cursor restart. */
  const [attempt, setAttempt] = useState(0);
  const generation = useRef(0);
  /** The query and refresh a stale cursor already restarted once; a new epoch may restart again. */
  const restartedFor = useRef<{ query: ResearchQuery; refreshKey: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Late responses after unmount are ignored like any superseded generation.
  useEffect(
    () => () => {
      generation.current += 1;
      if (inspectTimer.current !== null) {
        clearTimeout(inspectTimer.current);
      }
    },
    [],
  );

  // A row selected by an arrow key is focused once the window holds it.
  useEffect(() => {
    const symbol = pendingFocus.current;
    if (symbol === null) {
      return;
    }
    const row = scrollRef.current?.querySelector<HTMLTableRowElement>(
      `tr[data-symbol="${symbol}"]`,
    );
    if (row) {
      pendingFocus.current = null;
      row.focus();
    }
  });

  // Page one: on mount, on every query change, on each refreshKey bump and on
  // each attempt. Rows and cursor are replaced only when the response arrives,
  // so the old rows stay dimmed meanwhile; a response from a superseded
  // generation is ignored. onResult and matchLabel are read through refs.
  useEffect(() => {
    generation.current += 1;
    const current = generation.current;
    setFirstPending(true);
    setFirstError(null);
    setPageError(null);
    setPagePending(false);
    listClassifications({ ...toListParams(query), limit: PAGE_SIZE })
      .then((page) => {
        if (current !== generation.current) {
          return;
        }
        // A keyboard user's place is kept: a focused row still in the page
        // stays in the window, so its element persists (rows are keyed by
        // symbol) and React restores focus to it after the commit; otherwise
        // the window starts over.
        const container = scrollRef.current;
        const focused = focusedSymbolIn(container);
        const kept = page.stocks.findIndex((row) => row.symbol === focused);
        const top =
          kept === -1 || container === null ? 0 : scrollTopToReveal(kept, container.scrollTop);
        setLoaded({
          first: page,
          stocks: page.stocks,
          nextCursor: page.nextCursor,
          epoch: { query, refreshKey, attempt },
        });
        setFirstPending(false);
        setScrollTop(top);
        if (container !== null) {
          container.scrollTop = top;
        }
        setAnnouncement((previous) => ({
          text: matchLabelRef.current(page.matchCount),
          serial: previous.serial + 1,
        }));
        onResultRef.current(page);
      })
      .catch((error: unknown) => {
        if (current !== generation.current) {
          return;
        }
        setFirstError(error);
        setFirstPending(false);
      });
  }, [query, refreshKey, attempt]);

  const readPage = useCallback(
    (cursor: string): void => {
      const current = generation.current;
      setPagePending(true);
      setPageError(null);
      listClassifications({ ...toListParams(query), limit: PAGE_SIZE, cursor })
        .then((page) => {
          if (current !== generation.current) {
            return;
          }
          setLoaded((previous) =>
            previous === null
              ? previous
              : {
                  ...previous,
                  stocks: appendNew(previous.stocks, page.stocks),
                  nextCursor: page.nextCursor,
                },
          );
          setPagePending(false);
        })
        .catch((error: unknown) => {
          if (current !== generation.current) {
            return;
          }
          setPagePending(false);
          const restarted =
            restartedFor.current !== null &&
            restartedFor.current.query === query &&
            restartedFor.current.refreshKey === refreshKey;
          if (isStaleCursor(error) && !restarted) {
            restartedFor.current = { query, refreshKey };
            setAttempt((count) => count + 1);
            return;
          }
          setPageError({ cursor, error });
        });
    },
    [query, refreshKey],
  );

  const loadedCount = loaded?.stocks.length ?? 0;
  const nextCursor = loaded?.nextCursor ?? null;
  const busy = firstPending || pagePending;

  // The next keyset page, when the window nears the loaded end and nothing is
  // in flight or failed (a failed page waits for Try again). Only rows read for
  // the current query, refreshKey and attempt page on: a new epoch's page one
  // is in flight from the moment it renders, before any state says so.
  const currentEpoch =
    loaded !== null &&
    loaded.epoch.query === query &&
    loaded.epoch.refreshKey === refreshKey &&
    loaded.epoch.attempt === attempt;
  useEffect(() => {
    if (!currentEpoch || firstError !== null || pageError !== null) {
      return;
    }
    const { end } = visibleWindow({ scrollTop, loadedCount });
    if (nextCursor !== null && needsNextPage({ end, loadedCount, nextCursor, loading: busy })) {
      readPage(nextCursor);
    }
  }, [currentEpoch, firstError, pageError, scrollTop, loadedCount, nextCursor, busy, readPage]);

  const summaries = loaded?.first.factors ?? null;
  const columnCount = 3 + FACTORS.length + extraColumns.length;
  const neverPopulated = loaded?.first.neverClassified === true;
  const hasRows = loaded !== null && !neverPopulated && loaded.stocks.length > 0;
  const showRows = hasRows && firstError === null;
  const range = visibleWindow({ scrollTop, loadedCount });
  const dimmed = firstPending && hasRows;
  /** Sorting is a request: the next sort goes to the host's query (DAC-E4-S6-2). */
  const sortBy = (key: SortKey): void =>
    onQueryChange({ ...query, sort: nextSort(query.sort, key) });
  /** The Symbol column's unsorted default is ascending; a factor sort clears it. */
  const symbolSort = ariaSortFor(query.sort ?? { key: "symbol", order: "asc" }, "symbol", showRows);
  const afterName = extraColumns.filter((column) => column.placement === "afterName");
  const atEnd = extraColumns.filter((column) => column.placement !== "afterName");

  /** Selects a row at once and notifies `onInspect` once the selection has rested (DEC-0162). */
  function select(symbol: string): void {
    if (symbol === selected) {
      return;
    }
    onSelect(symbol);
    if (inspectTimer.current !== null) {
      clearTimeout(inspectTimer.current);
    }
    inspectTimer.current = setTimeout(() => {
      inspectTimer.current = null;
      onInspectRef.current(symbol);
    }, INSPECT_DEBOUNCE_MS);
  }

  /** Checking never selects: the symbol joins or leaves `checked`, order preserved. */
  function toggle(symbol: string, on: boolean): void {
    onCheckedChange(
      on
        ? [...checked.filter((other) => other !== symbol), symbol]
        : checked.filter((other) => other !== symbol),
    );
  }

  /** An arrow key selects the neighbouring loaded row, scrolling it into the window before focusing it. */
  function move(fromIndex: number, delta: number): void {
    if (loaded === null) {
      return;
    }
    const target = Math.min(loaded.stocks.length - 1, Math.max(0, fromIndex + delta));
    if (target === fromIndex) {
      return;
    }
    const symbol = loaded.stocks[target].symbol;
    select(symbol);
    const revealed = scrollTopToReveal(target, scrollTop);
    if (revealed === scrollTop) {
      // In the viewport, so already rendered: focus it now. A request here
      // could outlive the press when the target is already selected, since
      // nothing re-renders, and a later unrelated render would act on it.
      pendingFocus.current = null;
      scrollRef.current?.querySelector<HTMLTableRowElement>(`tr[data-symbol="${symbol}"]`)?.focus();
      return;
    }
    // The scroll's own render brings the row into the window and consumes the request.
    pendingFocus.current = symbol;
    if (scrollRef.current !== null) {
      scrollRef.current.scrollTop = revealed;
    }
    setScrollTop(revealed);
  }

  const renderedSymbols = showRows
    ? loaded.stocks.slice(range.start, range.end).map((row) => row.symbol)
    : [];
  /** The one tab stop: the selected row when rendered, else the first rendered row. */
  const focusableSymbol =
    selected !== null && renderedSymbols.includes(selected)
      ? selected
      : (renderedSymbols[0] ?? null);

  function body(): ReactNode {
    if (firstError !== null) {
      return (
        <tr>
          <td colSpan={columnCount} className="py-3 text-sm">
            <p>{sentenceFor(firstError)}</p>
            <button
              type="button"
              onClick={() => setAttempt((count) => count + 1)}
              className="mt-2 rounded border border-border px-3 py-2 text-sm"
            >
              {RESULTS.tryAgain}
            </button>
          </td>
        </tr>
      );
    }
    if (loaded === null) {
      return SKELETON_KEYS.map((key) => (
        // biome-ignore lint/a11y/noAriaHiddenOnFocusable: a skeleton row holds no content and no tab stop
        <tr key={key} aria-hidden="true" className="h-row border-t border-border">
          <td colSpan={columnCount}>
            <span className="block h-2 rounded bg-secondary" />
          </td>
        </tr>
      ));
    }
    if (!hasRows) {
      return (
        <tr>
          <td colSpan={columnCount} className="py-3">
            {empty("no-match")}
          </td>
        </tr>
      );
    }
    return (
      <>
        {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: a spacer row holds no content and no tab stop */}
        <tr aria-hidden="true" style={{ height: `${range.padTop}px` }}>
          <td colSpan={columnCount} className="p-0" />
        </tr>
        {loaded.stocks.slice(range.start, range.end).map((row, offset) => (
          <StockTableRow
            key={row.symbol}
            row={row}
            index={range.start + offset}
            summaries={summaries}
            selected={row.symbol === selected}
            checked={checked.includes(row.symbol)}
            focusable={row.symbol === focusableSymbol}
            afterName={afterName}
            atEnd={atEnd}
            onSelect={select}
            onToggle={toggle}
            onMove={move}
          />
        ))}
        {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: a spacer row holds no content and no tab stop */}
        <tr aria-hidden="true" style={{ height: `${range.padBottom}px` }}>
          <td colSpan={columnCount} className="p-0" />
        </tr>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <output aria-live="polite" className="sr-only">
        <span key={announcement.serial}>{announcement.text}</span>
      </output>
      {neverPopulated && firstError === null ? (
        empty("never-populated")
      ) : (
        <div
          ref={scrollRef}
          data-testid="results-scroll"
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
          style={{ height: `${SCROLL_HEIGHT_PX}px`, overflowY: "auto", overflowX: "hidden" }}
        >
          <p id={descriptionId} className="sr-only">
            {SORT.incompleteLast}
          </p>
          <table
            aria-busy={busy}
            aria-rowcount={showRows && loaded !== null ? loaded.first.matchCount + 1 : undefined}
            className="w-full text-sm"
          >
            <thead className="sticky top-0 bg-background">
              <tr>
                <th scope="col" />
                <th scope="col" aria-sort={symbolSort} className="text-left align-top">
                  <span className="inline-flex items-center gap-1">
                    {RESULTS.columns.symbol}
                    <SortButton
                      name={SORT.bySymbol}
                      active={symbolSort}
                      onActivate={() => sortBy("symbol")}
                    />
                  </span>
                </th>
                <th scope="col" className="text-left align-top">
                  {RESULTS.columns.name}
                </th>
                {afterName.map((column) => (
                  <ExtraHeader key={column.id} column={column} />
                ))}
                {FACTORS.map((factor) => (
                  <FactorHeader
                    key={factor}
                    factor={factor}
                    summary={summaries === null ? null : summaries[factor]}
                    sort={query.sort}
                    sorted={showRows}
                    descriptionId={descriptionId}
                    onSort={sortBy}
                  />
                ))}
                {atEnd.map((column) => (
                  <ExtraHeader key={column.id} column={column} />
                ))}
              </tr>
            </thead>
            <tbody className={dimmed ? "opacity-60" : undefined}>{body()}</tbody>
          </table>
        </div>
      )}
      {pageError !== null ? (
        <p className="text-sm">
          {sentenceFor(pageError.error)}{" "}
          <button
            type="button"
            onClick={() => readPage(pageError.cursor)}
            className="rounded border border-border px-3 py-2 text-sm"
          >
            {RESULTS.tryAgain}
          </button>
        </p>
      ) : null}
    </div>
  );
}

function alignClass(column: ExtraColumn): string {
  return column.align === "right" ? "text-right" : "text-left";
}

function ExtraHeader({ column }: { column: ExtraColumn }): JSX.Element {
  return (
    <th scope="col" className={`${alignClass(column)} align-top`}>
      {column.header}
    </th>
  );
}

interface StockTableRowProps {
  row: StockRow;
  /** The row's position in the loaded result, 0-based. */
  index: number;
  summaries: Record<FactorName, FactorSummary> | null;
  selected: boolean;
  checked: boolean;
  /** Whether this row is the table's tab stop. */
  focusable: boolean;
  afterName: readonly ExtraColumn[];
  atEnd: readonly ExtraColumn[];
  onSelect: (symbol: string) => void;
  onToggle: (symbol: string, on: boolean) => void;
  onMove: (fromIndex: number, delta: number) => void;
}

/** The selected row's inset edge and fill (UX design 1.1); the edge is always drawn so selection shifts nothing. */
const ROW = "h-row border-t border-border border-l-4";
const ROW_SELECTED = "border-l-status-active bg-status-active-muted";
const ROW_UNSELECTED = "border-l-transparent";

/**
 * One stock: click or Enter on the row selects it, Space on its checkbox
 * checks it, and the two never interfere (DAC-E4-S6-4); the arrows move the
 * selection from the row or its checkbox.
 */
function StockTableRow({
  row,
  index,
  summaries,
  selected,
  checked,
  focusable,
  afterName,
  atEnd,
  onSelect,
  onToggle,
  onMove,
}: StockTableRowProps): JSX.Element {
  function onKeyDown(event: KeyboardEvent<HTMLTableRowElement>): void {
    const target = event.target as HTMLElement;
    const fromRow = target === event.currentTarget;
    const fromCheckbox = target instanceof HTMLInputElement && target.type === "checkbox";
    if (event.key === "Enter" && fromRow) {
      onSelect(row.symbol);
    } else if (event.key === " " && fromRow) {
      // Space on the row does nothing (DAC-E4-S6-4): not even the browser's page scroll.
      event.preventDefault();
    } else if (
      (event.key === "ArrowDown" || event.key === "ArrowUp") &&
      (fromRow || fromCheckbox)
    ) {
      event.preventDefault();
      onMove(index, event.key === "ArrowDown" ? 1 : -1);
    }
  }
  const extraCell = (column: ExtraColumn): JSX.Element => (
    <td key={column.id} className={alignClass(column)}>
      {column.cell(row)}
    </td>
  );
  return (
    <tr
      data-symbol={row.symbol}
      aria-rowindex={index + 2}
      aria-selected={selected}
      tabIndex={focusable ? 0 : -1}
      onClick={() => onSelect(row.symbol)}
      onKeyDown={onKeyDown}
      className={`${ROW} ${selected ? ROW_SELECTED : ROW_UNSELECTED}`}
      style={checked ? CHECKED_FILL : undefined}
    >
      <td>
        <input
          type="checkbox"
          aria-label={CELL.selectRow(row.symbol)}
          checked={checked}
          onChange={(event) => onToggle(row.symbol, event.target.checked)}
          onClick={(event) => event.stopPropagation()}
          className="h-5 w-5"
        />
      </td>
      <th scope="row" className="text-left font-numeric">
        {row.symbol}
      </th>
      <td className="truncate" title={row.name}>
        {row.name}
      </td>
      {afterName.map(extraCell)}
      {FACTORS.map((factor) => (
        <td key={factor} className="text-right">
          <FactorCell cell={cellFor(row, factor, summaries)} factor={factor} />
        </td>
      ))}
      {atEnd.map(extraCell)}
    </tr>
  );
}
