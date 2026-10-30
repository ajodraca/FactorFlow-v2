import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { type JSX, type ReactNode, useState } from "react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClassificationApiError, listClassifications } from "../../api/classification-client";
import type {
  ClassificationList,
  CurrentSet,
  FactorCell as FactorCellData,
  FactorName,
  FactorSummary,
  StockRow,
} from "../../api/classification-types";
import { DEFAULT_RESEARCH_QUERY, type ResearchQuery } from "../../api/research-query";
import { CELL, FACTOR_LABELS, RESULTS, SORT, failureSentence } from "./copy";
import { formatPercentile } from "./format";
import { INSPECT_DEBOUNCE_MS, type ResultsTableProps, ResultsTable } from "./results-table";
import {
  OVERSCAN_ROWS,
  PAGE_SIZE,
  ROW_HEIGHT_PX,
  VIEWPORT_ROWS,
  scrollTopToReveal,
  visibleWindow,
} from "./results-window";

vi.mock("../../api/classification-client", async () => {
  const actual = await vi.importActual<typeof import("../../api/classification-client")>(
    "../../api/classification-client",
  );
  return { ...actual, listClassifications: vi.fn() };
});

const listMock = vi.mocked(listClassifications);

const MAX_RENDERED = VIEWPORT_ROWS + 2 * OVERSCAN_ROWS;
const FACTORS: readonly FactorName[] = ["value", "growth", "momentum"];

// --- Fixtures (classification-api section 2.7; S1's ClassificationList) ----

/** A `FactorCell` response value with the unused fields null and false. */
function cell(overrides: Partial<FactorCellData>): FactorCellData {
  return {
    status: "not_classified",
    score: null,
    percentile: null,
    reasonCode: null,
    reasonInput: null,
    reasonDetail: null,
    restatedPossible: false,
    ...overrides,
  };
}

function scored(percentile: string, score = "0.50"): FactorCellData {
  return cell({ status: "classified", percentile, score });
}

function notClassified(
  reasonCode: FactorCellData["reasonCode"],
  overrides: Partial<FactorCellData> = {},
): FactorCellData {
  return cell({ reasonCode, ...overrides });
}

function stock(
  symbol: string,
  factors: Partial<Record<FactorName, FactorCellData>> = {},
  overrides: Partial<Omit<StockRow, "factors">> = {},
): StockRow {
  return {
    symbol,
    name: `${symbol} Incorporated`,
    lifecycle: "active",
    factors: {
      value: factors.value ?? scored("84"),
      growth: factors.growth ?? scored("61"),
      momentum: factors.momentum ?? scored("27"),
    },
    ...overrides,
  };
}

function retired(symbol: string): StockRow {
  const cells = {
    value: notClassified("retired"),
    growth: notClassified("retired"),
    momentum: notClassified("retired"),
  };
  return stock(symbol, cells, { lifecycle: "retired" });
}

/** `SYM0000` to `SYM{count - 1}`, every factor scored, percentiles varying by row. */
function generated(count: number, prefix = "SYM"): StockRow[] {
  return Array.from({ length: count }, (_, index) => {
    const symbol = `${prefix}${String(index).padStart(4, "0")}`;
    return stock(symbol, {
      value: scored(String(index % 101)),
      growth: scored(String((index * 7) % 101)),
      momentum: scored(String((index * 13) % 101)),
    });
  });
}

function summary(overrides: Partial<FactorSummary> = {}): FactorSummary {
  return { qualifiedCount: 2846, ranked: true, minPeerSetSize: 30, ...overrides };
}

const SET: CurrentSet = {
  setId: "set-1",
  classificationDate: "2026-10-15",
  runId: "run-1",
  runStartedAt: "2026-10-15T22:30:00Z",
  runOutcome: "succeeded",
  state: "complete",
  startedAt: "2026-10-15T22:40:00Z",
  endedAt: "2026-10-15T22:46:00Z",
  latestTradingDay: "2026-10-15",
  activeInstruments: 2846,
  notCurrent: false,
};

function list(
  stocks: StockRow[],
  overrides: Partial<Omit<ClassificationList, "stocks">> = {},
): ClassificationList {
  return {
    neverClassified: false,
    set: SET,
    later: null,
    factors: { value: summary(), growth: summary(), momentum: summary() },
    matchCount: stocks.length,
    stocks,
    unknownSymbols: [],
    nextCursor: null,
    ...overrides,
  };
}

function neverClassified(): ClassificationList {
  return list([], {
    neverClassified: true,
    set: null,
    factors: {
      value: summary({ qualifiedCount: 0, ranked: false }),
      growth: summary({ qualifiedCount: 0, ranked: false }),
      momentum: summary({ qualifiedCount: 0, ranked: false }),
    },
  });
}

function apiError(code: string | null, message = "LEAKED ENVELOPE TEXT"): ClassificationApiError {
  return new ClassificationApiError(message, "req-1", {
    code,
    operation: "list-classifications",
    resource: "classification",
  });
}

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// --- The host (CAP-002-E4-S6 Open Gap 1; what E4-S9 and E1-S8 do) -----------

const NEVER_POPULATED_BODY = "never populated body from the host";
const NO_MATCH_BODY = "nothing found body from the host";

interface HostProps extends Partial<Omit<ResultsTableProps, "query">> {
  /** A controlled query: the host re-renders with a new one as E4-S9 does from the URL. */
  query?: ResearchQuery;
  /** The host's own starting query, which the table changes through onQueryChange. */
  initialQuery?: ResearchQuery;
  initialSelected?: string | null;
  initialChecked?: string[];
}

const noop = (): void => undefined;

function Host({
  query: controlledQuery,
  initialQuery = DEFAULT_RESEARCH_QUERY,
  initialSelected = null,
  initialChecked = [],
  ...rest
}: HostProps): JSX.Element {
  const [query, setQuery] = useState<ResearchQuery>(initialQuery);
  const [selected, setSelected] = useState<string | null>(initialSelected);
  const [checked, setChecked] = useState<string[]>(initialChecked);
  return (
    <>
      <output data-testid="host-checked">{checked.join(",")}</output>
      <output data-testid="host-selected">{selected ?? ""}</output>
      <ResultsTable
        query={controlledQuery ?? query}
        onQueryChange={setQuery}
        refreshKey={0}
        selected={selected}
        onSelect={setSelected}
        onInspect={noop}
        checked={checked}
        onCheckedChange={setChecked}
        onResult={noop}
        empty={(kind): ReactNode => (
          <p>{kind === "never-populated" ? NEVER_POPULATED_BODY : NO_MATCH_BODY}</p>
        )}
        {...rest}
      />
    </>
  );
}

const scroller = (): HTMLElement => screen.getByTestId("results-scroll");

function scrollToRow(row: number): void {
  const element = scroller();
  element.scrollTop = row * ROW_HEIGHT_PX;
  fireEvent.scroll(element);
}

const stockRows = (): HTMLTableRowElement[] =>
  Array.from(document.querySelectorAll<HTMLTableRowElement>("tbody tr[data-symbol]"));
const table = (): HTMLElement => screen.getByRole("table");
const statusRegion = (): HTMLElement =>
  screen
    .getAllByRole("status")
    .find((region) => region.getAttribute("aria-live") === "polite") as HTMLElement;
const rowOf = (symbol: string): HTMLTableRowElement =>
  document.querySelector(`tbody tr[data-symbol="${symbol}"]`) as HTMLTableRowElement;
const headerCells = (): HTMLElement[] => screen.getAllByRole("columnheader");
/** A header's own text: its buttons (whose arrows are decoration) removed. */
function headerText(header: HTMLElement): string {
  const clone = header.cloneNode(true) as HTMLElement;
  for (const button of clone.querySelectorAll("button")) {
    button.remove();
  }
  return (clone.textContent ?? "").trim();
}
/** The arrow a sort button draws: decoration beside its accessible name. */
const glyphOf = (button: HTMLElement): string =>
  button.querySelector("[aria-hidden='true']")?.textContent?.trim() ?? "";
/** Watches the polite region for the DOM changes a screen reader announces (data-table section 5). */
function observeRegion(region: HTMLElement): { records: MutationRecord[]; disconnect: () => void } {
  const records: MutationRecord[] = [];
  const observer = new MutationObserver((batch) => records.push(...batch));
  observer.observe(region, { childList: true, characterData: true, subtree: true });
  return { records, disconnect: () => observer.disconnect() };
}
/** The header whose own text is `label`, the unranked column's qualified sentence aside. */
const headerOf = (label: string): HTMLElement =>
  headerCells().find(
    (header) => headerText(header).replace(/\d+ qualified, \d+ needed$/, "") === label,
  ) as HTMLElement;

beforeEach(() => {
  listMock.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

// --- Cycle 2: data, paging and windowing ------------------------------------

// Implements TC-COMP-093 (T005): DAC-E4-S6-5, AC-11.
describe("TC-COMP-093: 3000 rows are windowed, so the DOM does not grow with the result", () => {
  it("renders a bounded number of rows and cells for 3000 stocks", async () => {
    listMock.mockResolvedValueOnce(list(generated(3000), { matchCount: 3000 }));
    render(<Host />);
    await screen.findByText("SYM0000");

    const columns = headerCells().length;
    expect(stockRows().length).toBeLessThanOrEqual(MAX_RENDERED);
    expect(stockRows().length).toBeLessThan(3000);
    expect(document.querySelectorAll("td").length).toBeLessThanOrEqual(
      (MAX_RENDERED + 2) * columns,
    );
    expect(table()).toHaveAttribute("aria-rowcount", "3001");
    for (const [position, row] of stockRows().entries()) {
      expect(row).toHaveAttribute("aria-rowindex", String(position + 2));
    }
  });

  it("moves the window with the scroll position", async () => {
    listMock.mockResolvedValueOnce(list(generated(3000), { matchCount: 3000 }));
    render(<Host />);
    await screen.findByText("SYM0000");

    scrollToRow(2999);
    expect(screen.getByText("SYM2999")).toBeInTheDocument();
    expect(screen.queryByText("SYM0000")).not.toBeInTheDocument();
    expect(stockRows().length).toBeLessThanOrEqual(MAX_RENDERED);
    const last = rowOf("SYM2999");
    expect(last).toHaveAttribute("aria-rowindex", "3001");
    // The spacers keep the scroll height at the loaded rows' height.
    const { padTop, padBottom } = visibleWindow({
      scrollTop: 2999 * ROW_HEIGHT_PX,
      loadedCount: 3000,
    });
    const bodyRows = Array.from(document.querySelectorAll<HTMLElement>("tbody tr"));
    expect(bodyRows[0].style.height).toBe(`${padTop}px`);
    expect(bodyRows[bodyRows.length - 1].style.height).toBe(`${padBottom}px`);
    expect(padTop).toBeGreaterThan(0);
  });

  it("holds the same bound for 50 rows and for 3000", async () => {
    listMock.mockResolvedValueOnce(list(generated(50)));
    const { unmount } = render(<Host />);
    await screen.findByText("SYM0000");
    const fifty = stockRows().length;
    expect(fifty).toBeLessThanOrEqual(MAX_RENDERED);
    unmount();

    listMock.mockResolvedValueOnce(list(generated(3000), { matchCount: 3000 }));
    render(<Host />);
    await screen.findByText("SYM0000");
    expect(stockRows().length).toBeLessThanOrEqual(MAX_RENDERED);
  });

  it("hides both spacer rows from assistive technology, so only stock rows are rows", async () => {
    listMock.mockResolvedValueOnce(list(generated(3000), { matchCount: 3000 }));
    render(<Host />);
    await screen.findByText("SYM0000");
    scrollToRow(1500);
    const bodyRows = Array.from(document.querySelectorAll<HTMLElement>("tbody tr"));
    const top = bodyRows[0];
    const bottom = bodyRows[bodyRows.length - 1];
    expect(top).not.toHaveAttribute("data-symbol");
    expect(bottom).not.toHaveAttribute("data-symbol");
    expect(top.style.height).not.toBe("0px");
    expect(bottom.style.height).not.toBe("0px");
    expect(top).toHaveAttribute("aria-hidden", "true");
    expect(bottom).toHaveAttribute("aria-hidden", "true");
    const tbody = document.querySelector("tbody") as HTMLElement;
    expect(within(tbody).getAllByRole("row")).toHaveLength(stockRows().length);
  });

  it("creates no horizontal scrollbar: the container hides overflow-x and the table is w-full", async () => {
    listMock.mockResolvedValueOnce(list(generated(50)));
    render(<Host />);
    await screen.findByText("SYM0000");
    expect(scroller().style.overflowX).toBe("hidden");
    expect(scroller().style.overflowY).toBe("auto");
    expect(scroller().style.height).toBe(`${(VIEWPORT_ROWS + 2) * ROW_HEIGHT_PX}px`);
    expect(table()).toHaveClass("w-full");
  });
});

// T006: keyset paging and the request lifecycle (AC-11, AC-16, DAC-E4-S6-2, DAC-E4-S6-5; Open Gap 2).
describe("T006: keyset paging and the request lifecycle", () => {
  it("reads page one with the query's parameters, PAGE_SIZE and no cursor", async () => {
    listMock.mockResolvedValueOnce(list(generated(3)));
    render(<Host />);
    await screen.findByText("SYM0000");
    expect(listMock).toHaveBeenCalledTimes(1);
    expect(listMock).toHaveBeenCalledWith({ limit: PAGE_SIZE });
    expect(listMock.mock.calls[0][0]).not.toHaveProperty("cursor");
  });

  it("reads the next page once as the window nears the loaded end, appends it and never duplicates", async () => {
    listMock.mockResolvedValueOnce(list(generated(50), { matchCount: 120, nextCursor: "c1" }));
    render(<Host />);
    await screen.findByText("SYM0000");
    expect(listMock).toHaveBeenCalledTimes(1);
    expect(table()).toHaveAttribute("aria-rowcount", "121");
    expect(table()).not.toHaveAttribute("aria-busy", "true");
    expect(document.querySelector("tbody")).not.toHaveClass("opacity-60");

    const second = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(second.promise);
    scrollToRow(10);
    expect(listMock).toHaveBeenCalledTimes(2);
    expect(listMock).toHaveBeenLastCalledWith({ limit: PAGE_SIZE, cursor: "c1" });

    // In flight: more scrolling issues nothing, and the rows are busy but not dimmed.
    scrollToRow(12);
    scrollToRow(14);
    expect(listMock).toHaveBeenCalledTimes(2);
    expect(table()).toHaveAttribute("aria-busy", "true");
    expect(document.querySelector("tbody")).not.toHaveClass("opacity-60");

    const overlapping = [
      stock("SYM0049"),
      ...generated(50).map((row, index) => ({
        ...row,
        symbol: `SYM${String(50 + index).padStart(4, "0")}`,
      })),
    ];
    await act(async () => {
      second.resolve(list(overlapping, { matchCount: 120, nextCursor: null }));
    });
    scrollToRow(90);
    expect(screen.getByText("SYM0099")).toBeInTheDocument();
    expect(table()).not.toHaveAttribute("aria-busy", "true");
    expect(table()).toHaveAttribute("aria-rowcount", "121");
    scrollToRow(0);
    expect(screen.getByText("SYM0000")).toBeInTheDocument();
    scrollToRow(45);
    expect(document.querySelectorAll('tbody tr[data-symbol="SYM0049"]')).toHaveLength(1);

    // No cursor left: no further read however far it scrolls.
    scrollToRow(99);
    scrollToRow(200);
    expect(listMock).toHaveBeenCalledTimes(2);
  });

  it("pages on through a third page once the second has arrived", async () => {
    listMock.mockResolvedValueOnce(list(generated(50), { matchCount: 150, nextCursor: "c1" }));
    render(<Host />);
    await screen.findByText("SYM0000");
    listMock.mockResolvedValueOnce(
      list(generated(50, "PG2"), { matchCount: 150, nextCursor: "c2" }),
    );
    scrollToRow(10);
    await waitFor(() => {
      scrollToRow(50);
      expect(screen.getByText("PG20000")).toBeInTheDocument();
    });
    expect(listMock).toHaveBeenCalledTimes(2);
    listMock.mockResolvedValueOnce(
      list(generated(50, "PG3"), { matchCount: 150, nextCursor: null }),
    );
    scrollToRow(80);
    await waitFor(() => {
      scrollToRow(110);
      expect(screen.getByText("PG30000")).toBeInTheDocument();
    });
    expect(listMock).toHaveBeenCalledTimes(3);
    expect(listMock.mock.calls[2][0]).toEqual({ limit: PAGE_SIZE, cursor: "c2" });
    scrollToRow(149);
    expect(screen.getByText("PG30049")).toBeInTheDocument();
    expect(listMock).toHaveBeenCalledTimes(3);
  });

  it("issues no page read while the window is far from the loaded end", async () => {
    listMock.mockResolvedValueOnce(list(generated(50), { matchCount: 120, nextCursor: "c1" }));
    render(<Host />);
    await screen.findByText("SYM0000");
    scrollToRow(1);
    scrollToRow(3);
    expect(listMock).toHaveBeenCalledTimes(1);
  });

  it("discards loaded rows on a changed query, reads page one, and ignores a late superseded response", async () => {
    listMock.mockResolvedValueOnce(list(generated(50), { matchCount: 120, nextCursor: "c1" }));
    const { rerender } = render(<Host />);
    await screen.findByText("SYM0000");

    scrollToRow(4);
    const late = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(late.promise);
    const hidden: ResearchQuery = { ...DEFAULT_RESEARCH_QUERY, hideIncomplete: true };
    rerender(<Host query={hidden} />);
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
    expect(listMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ hideIncomplete: true, limit: PAGE_SIZE }),
    );
    expect(listMock.mock.calls[1][0]).not.toHaveProperty("cursor");
    // Pending: the old rows stay, dimmed and busy, and the old cursor is never
    // sent with the new query however far the old rows scroll.
    scrollToRow(30);
    expect(screen.getByText("SYM0030")).toBeInTheDocument();
    expect(table()).toHaveAttribute("aria-busy", "true");
    expect(document.querySelector("tbody")).toHaveClass("opacity-60");
    expect(listMock).toHaveBeenCalledTimes(2);

    const fresh = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(fresh.promise);
    const scoped: ResearchQuery = { ...hidden, scope: "u-1" };
    rerender(<Host query={scoped} />);
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(3));
    expect(listMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ hideIncomplete: true, universeId: "u-1", limit: PAGE_SIZE }),
    );

    await act(async () => {
      fresh.resolve(list(generated(2, "NEW")));
    });
    // The window starts over with the new rows: the scroll position is reset.
    expect(screen.getByText("NEW0000")).toBeInTheDocument();
    expect(scroller().scrollTop).toBe(0);
    expect(screen.queryByText("SYM0000")).not.toBeInTheDocument();
    expect(table()).not.toHaveAttribute("aria-busy", "true");

    // The superseded response arrives late and changes nothing.
    await act(async () => {
      late.resolve(list(generated(3, "OLD"), { nextCursor: "c9" }));
    });
    expect(screen.queryByText("OLD0000")).not.toBeInTheDocument();
    expect(screen.getByText("NEW0000")).toBeInTheDocument();
    scrollToRow(99);
    expect(listMock).toHaveBeenCalledTimes(3);
  });

  it("never sends the old cursor under a new query, even when a page lands in the same render as the change", async () => {
    listMock.mockResolvedValueOnce(list(generated(50), { matchCount: 200, nextCursor: "c1" }));
    const { rerender } = render(<Host />);
    await screen.findByText("SYM0000");

    const second = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(second.promise);
    scrollToRow(40);
    expect(listMock).toHaveBeenCalledTimes(2);

    // Page two arrives with more to come, in the same batch as a new query: the
    // window is still near the (new) loaded end, nothing is in flight, and the
    // only read that follows is page one of the new query.
    const pageOne = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(pageOne.promise);
    const scoped: ResearchQuery = { ...DEFAULT_RESEARCH_QUERY, scope: "u-2" };
    await act(async () => {
      second.resolve(list(generated(10, "PG2"), { matchCount: 200, nextCursor: "c2" }));
      await Promise.resolve();
      rerender(<Host query={scoped} />);
    });
    expect(listMock).toHaveBeenCalledTimes(3);
    expect(listMock.mock.calls[2][0]).toEqual({ universeId: "u-2", limit: PAGE_SIZE });
    scrollToRow(55);
    expect(listMock).toHaveBeenCalledTimes(3);
  });

  it("shows a 12-row skeleton on the first-ever load, busy, with no stock text and no 0", () => {
    listMock.mockReturnValueOnce(deferred<ClassificationList>().promise);
    render(<Host />);
    expect(table()).toHaveAttribute("aria-busy", "true");
    const body = document.querySelector("tbody") as HTMLElement;
    expect(body.querySelectorAll("tr")).toHaveLength(12);
    expect(stockRows()).toHaveLength(0);
    expect(body.textContent).not.toMatch(/\d/);
    expect(body.textContent?.trim()).toBe("");
    for (const header of headerCells()) {
      expect(header).not.toHaveAttribute("aria-sort");
    }
  });

  it("reloads page one once on a refreshKey bump, keeps the rows until the response and keeps focus", async () => {
    listMock.mockResolvedValueOnce(list(generated(5)));
    const { rerender } = render(<Host />);
    await screen.findByText("SYM0000");

    const reload = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(reload.promise);
    const before = document.createElement("button");
    document.body.append(before);
    before.focus();
    rerender(<Host refreshKey={1} />);
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
    expect(listMock).toHaveBeenLastCalledWith({ limit: PAGE_SIZE });
    expect(screen.getByText("SYM0000")).toBeInTheDocument();
    expect(table()).toHaveAttribute("aria-busy", "true");
    expect(document.activeElement).toBe(before);

    await act(async () => {
      reload.resolve(list(generated(5, "NEW")));
    });
    expect(screen.getByText("NEW0000")).toBeInTheDocument();
    expect(document.activeElement).toBe(before);
    expect(listMock).toHaveBeenCalledTimes(2);
    before.remove();
  });

  it("restarts from page one once on a stale cursor of a later page", async () => {
    listMock.mockResolvedValueOnce(list(generated(50), { matchCount: 120, nextCursor: "c1" }));
    render(<Host />);
    await screen.findByText("SYM0000");

    listMock.mockRejectedValueOnce(apiError("cursor_stale"));
    listMock.mockResolvedValueOnce(
      list(generated(50, "AGN"), { matchCount: 120, nextCursor: "c2" }),
    );
    scrollToRow(10);
    await screen.findByText("AGN0000");
    expect(listMock).toHaveBeenCalledTimes(3);
    expect(listMock.mock.calls[1][0]).toEqual({ limit: PAGE_SIZE, cursor: "c1" });
    expect(listMock.mock.calls[2][0]).toEqual({ limit: PAGE_SIZE });
    expect(screen.queryByText("SYM0000")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: RESULTS.tryAgain })).not.toBeInTheDocument();

    // A second stale cursor in the same epoch is a later-page error, not another restart.
    listMock.mockRejectedValueOnce(apiError("cursor_stale"));
    scrollToRow(10);
    await screen.findByRole("button", { name: RESULTS.tryAgain });
    expect(listMock).toHaveBeenCalledTimes(4);
    expect(screen.getByText("AGN0000")).toBeInTheDocument();
  });

  it("shows a stale cursor on page one as the error body", async () => {
    listMock.mockRejectedValueOnce(apiError("cursor_stale"));
    render(<Host />);
    const sentence = failureSentence({
      operation: "list-classifications",
      resource: "classification",
      code: "cursor_stale",
    });
    await screen.findByText(sentence);
    expect(listMock).toHaveBeenCalledTimes(1);
  });

  it("replaces the body with the failure sentence on a failed first page, keeps the header and retries the same read", async () => {
    listMock.mockRejectedValueOnce(apiError("internal_error", "the server's own words"));
    render(<Host />);
    const sentence = failureSentence({
      operation: "list-classifications",
      resource: "classification",
      code: "internal_error",
    });
    await screen.findByText(sentence);
    expect(screen.queryByText(/the server's own words/)).not.toBeInTheDocument();
    expect(headerCells().length).toBeGreaterThan(0);
    expect(stockRows()).toHaveLength(0);
    expect(table()).not.toHaveAttribute("aria-busy", "true");

    listMock.mockResolvedValueOnce(list(generated(2)));
    fireEvent.click(screen.getByRole("button", { name: RESULTS.tryAgain }));
    await screen.findByText("SYM0000");
    expect(listMock).toHaveBeenCalledTimes(2);
    expect(listMock.mock.calls[1][0]).toEqual(listMock.mock.calls[0][0]);
    expect(screen.queryByText(sentence)).not.toBeInTheDocument();
  });

  it("falls back to the generic sentence for a failure that is not a ClassificationApiError", async () => {
    listMock.mockRejectedValueOnce(new Error("socket hang up"));
    render(<Host />);
    await screen.findByText(
      failureSentence({
        operation: "list-classifications",
        resource: "classification",
        code: null,
      }),
    );
    expect(screen.queryByText(/socket hang up/)).not.toBeInTheDocument();
  });

  it("keeps the rows on a failed later page and offers Try again for that cursor", async () => {
    listMock.mockResolvedValueOnce(list(generated(50), { matchCount: 120, nextCursor: "c1" }));
    render(<Host />);
    await screen.findByText("SYM0000");

    listMock.mockRejectedValueOnce(apiError("internal_error"));
    scrollToRow(10);
    const retry = await screen.findByRole("button", { name: RESULTS.tryAgain });
    expect(screen.getByText("SYM0000")).toBeInTheDocument();
    expect(stockRows().length).toBeGreaterThan(0);
    expect(retry.closest("table")).toBeNull();
    expect(
      screen.getByText(
        failureSentence({
          operation: "list-classifications",
          resource: "classification",
          code: "internal_error",
        }),
      ),
    ).toBeInTheDocument();
    // No automatic retry while the error stands, and the table is not busy.
    scrollToRow(12);
    expect(listMock).toHaveBeenCalledTimes(2);
    expect(table()).not.toHaveAttribute("aria-busy", "true");
    scrollToRow(0);

    listMock.mockResolvedValueOnce(
      list(generated(50, "PG2"), { matchCount: 120, nextCursor: null }),
    );
    fireEvent.click(retry);
    // The click itself repeats the read for that cursor, wherever the window sits.
    expect(listMock).toHaveBeenCalledTimes(3);
    expect(listMock.mock.calls[2][0]).toEqual({ limit: PAGE_SIZE, cursor: "c1" });
    await waitFor(() => {
      scrollToRow(60);
      expect(screen.getByText("PG20000")).toBeInTheDocument();
    });
    expect(listMock).toHaveBeenCalledTimes(3);
    expect(screen.queryByRole("button", { name: RESULTS.tryAgain })).not.toBeInTheDocument();
  });

  it("hands each first page to onResult and never a later page", async () => {
    const onResult = vi.fn();
    const first = list(generated(50), { matchCount: 120, nextCursor: "c1" });
    listMock.mockResolvedValueOnce(first);
    const { rerender } = render(<Host onResult={onResult} />);
    await screen.findByText("SYM0000");
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(first);

    listMock.mockResolvedValueOnce(list(generated(50, "PG2"), { matchCount: 120 }));
    scrollToRow(10);
    await waitFor(() => {
      scrollToRow(60);
      expect(screen.getByText("PG20000")).toBeInTheDocument();
    });
    expect(onResult).toHaveBeenCalledTimes(1);

    const refreshed = list(generated(3, "NEW"));
    listMock.mockResolvedValueOnce(refreshed);
    rerender(<Host onResult={onResult} refreshKey={1} />);
    await screen.findByText("NEW0000");
    expect(onResult).toHaveBeenCalledTimes(2);
    expect(onResult).toHaveBeenLastCalledWith(refreshed);
  });

  it("announces the server's match count politely after each first page, never the row count", async () => {
    listMock.mockResolvedValueOnce(list(generated(50), { matchCount: 2846, nextCursor: "c1" }));
    render(<Host />);
    await screen.findByText("SYM0000");
    const region = statusRegion();
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveClass("sr-only");
    expect(region).toHaveTextContent(RESULTS.stocksMatch(2846));
    expect(region.textContent).not.toContain("50 ");
  });

  it("announces the match count again after a refresh-once that leaves it unchanged", async () => {
    listMock.mockResolvedValueOnce(list(generated(5), { matchCount: 2846 }));
    const { rerender } = render(<Host />);
    await screen.findByText("SYM0000");
    const region = statusRegion();
    expect(region).toHaveTextContent(RESULTS.stocksMatch(2846));
    const observer = observeRegion(region);

    listMock.mockResolvedValueOnce(list(generated(5, "NEW"), { matchCount: 2846 }));
    rerender(<Host refreshKey={1} />);
    await screen.findByText("NEW0000");
    // The text is the same sentence, and the region changed, which is what a polite region announces.
    expect(observer.records.length).toBeGreaterThan(0);
    observer.disconnect();
    expect(region.textContent?.trim()).toBe(RESULTS.stocksMatch(2846));
  });

  it("keeps focus on a focused row past the first window across a refresh-once that keeps it", async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValueOnce(list(generated(50)));
    const { rerender } = render(<Host />);
    await screen.findByText("SYM0000");
    scrollToRow(30);
    await user.click(screen.getByRole("rowheader", { name: "SYM0040" }));
    expect(document.activeElement).toBe(rowOf("SYM0040"));

    const reload = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(reload.promise);
    rerender(<Host refreshKey={1} />);
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
    expect(document.activeElement).toBe(rowOf("SYM0040"));
    await act(async () => {
      reload.resolve(list(generated(50)));
    });
    expect(rowOf("SYM0040")).not.toBeNull();
    expect(document.activeElement).toBe(rowOf("SYM0040"));
    expect(selectedSymbols()).toEqual(["SYM0040"]);
    expect(scroller().scrollTop).toBe(30 * ROW_HEIGHT_PX);
    expect(screen.queryByText("SYM0000")).not.toBeInTheDocument();
  });

  it("keeps focus on the focused row when a refresh-once reorders the rows around it", async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValueOnce(list(generated(50)));
    const { rerender } = render(
      <Host
        initialQuery={{
          ...DEFAULT_RESEARCH_QUERY,
          sort: { key: "value_percentile", order: "desc" },
        }}
      />,
    );
    await screen.findByText("SYM0000");
    scrollToRow(30);
    await user.click(screen.getByRole("rowheader", { name: "SYM0040" }));
    expect(document.activeElement).toBe(rowOf("SYM0040"));

    // A new score set (DEC-0062) ranks the neighbours differently: the focused row moves in the DOM.
    // A browser blurs a focused node that is moved (the DOM's removing steps run the focus fixup);
    // jsdom does not when React moves it, so the move is shimmed to blur as a browser would.
    const blurMoved = (node: Node): void => {
      if (node.isConnected && node.contains(document.activeElement)) {
        (document.activeElement as HTMLElement).blur();
      }
    };
    const insertBefore = Node.prototype.insertBefore;
    const appendChild = Node.prototype.appendChild;
    const insertSpy = vi.spyOn(Node.prototype, "insertBefore").mockImplementation(function (
      this: Node,
      node,
      reference,
    ) {
      blurMoved(node);
      return insertBefore.call(this, node, reference);
    });
    const appendSpy = vi.spyOn(Node.prototype, "appendChild").mockImplementation(function (
      this: Node,
      node,
    ) {
      blurMoved(node);
      return appendChild.call(this, node);
    });
    try {
      const rows = generated(50);
      [rows[36], rows[37], rows[38], rows[39], rows[40], rows[41]] = [
        rows[41],
        rows[40],
        rows[39],
        rows[38],
        rows[37],
        rows[36],
      ];
      listMock.mockResolvedValueOnce(list(rows));
      rerender(<Host refreshKey={1} />);
      await waitFor(() => expect(table()).not.toHaveAttribute("aria-busy", "true"));
      expect(
        stockRows()
          .map((row) => row.dataset.symbol)
          .slice(16, 22),
      ).toEqual(["SYM0041", "SYM0040", "SYM0039", "SYM0038", "SYM0037", "SYM0036"]);
      expect(document.activeElement).toBe(rowOf("SYM0040"));
      expect(scroller().scrollTop).toBe(30 * ROW_HEIGHT_PX);
    } finally {
      insertSpy.mockRestore();
      appendSpy.mockRestore();
    }
  });

  it("leaves a focused row of the host's own, outside the table, alone on a refresh-once", async () => {
    listMock.mockResolvedValueOnce(list(generated(50)));
    const { rerender } = render(<Host />);
    await screen.findByText("SYM0000");
    // A host row that happens to carry a listed symbol: not the table's, so not its place to keep.
    const outside = document.createElement("table");
    outside.setAttribute("role", "presentation");
    outside.innerHTML = '<tbody><tr data-symbol="SYM0030" tabindex="-1"><td>host</td></tr></tbody>';
    document.body.append(outside);
    const hostRow = outside.querySelector("tr") as HTMLTableRowElement;
    try {
      hostRow.focus();
      expect(document.activeElement).toBe(hostRow);
      scrollToRow(30);

      // The refreshed page still lists SYM0030, yet the window starts over: the focus is not the table's.
      listMock.mockResolvedValueOnce(list(generated(50)));
      rerender(<Host refreshKey={1} />);
      await waitFor(() => expect(table()).not.toHaveAttribute("aria-busy", "true"));
      expect(listMock).toHaveBeenCalledTimes(2);
      expect(document.activeElement).toBe(hostRow);
      expect(scroller().scrollTop).toBe(0);
      expect(screen.getByText("SYM0000")).toBeInTheDocument();
    } finally {
      outside.remove();
    }
  });

  it("scrolls a refreshed page to the focused row when the refresh moved it, and resets when it is gone", async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValueOnce(list(generated(50)));
    const { rerender } = render(<Host />);
    await screen.findByText("SYM0000");
    scrollToRow(30);
    await user.click(screen.getByRole("rowheader", { name: "SYM0040" }));

    // The refreshed page lists the focused stock first: the window follows it.
    const moved = [stock("SYM0040"), ...generated(49, "NEW")];
    listMock.mockResolvedValueOnce(list(moved));
    rerender(<Host refreshKey={1} />);
    await screen.findByText("NEW0000");
    expect(document.activeElement).toBe(rowOf("SYM0040"));
    expect(scroller().scrollTop).toBe(scrollTopToReveal(0, 30 * ROW_HEIGHT_PX));

    // The next refresh drops it: the window starts over at the top.
    scrollToRow(20);
    rowOf("NEW0030").focus();
    listMock.mockResolvedValueOnce(list(generated(50, "GONE")));
    rerender(<Host refreshKey={2} />);
    await screen.findByText("GONE0000");
    expect(scroller().scrollTop).toBe(0);
    expect(rowOf("NEW0030")).toBeNull();
  });

  it("ignores a later page of a superseded query that lands after the new page one", async () => {
    listMock.mockResolvedValueOnce(list(generated(50), { matchCount: 120, nextCursor: "c1" }));
    const { rerender } = render(<Host />);
    await screen.findByText("SYM0000");
    const latePage = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(latePage.promise);
    scrollToRow(40);
    expect(listMock).toHaveBeenCalledTimes(2);

    listMock.mockResolvedValueOnce(list(generated(2, "NEW")));
    rerender(<Host query={{ ...DEFAULT_RESEARCH_QUERY, scope: "u-3" }} />);
    await screen.findByText("NEW0000");
    expect(stockRows()).toHaveLength(2);

    await act(async () => {
      latePage.resolve(list(generated(10, "OLD"), { matchCount: 120, nextCursor: "c2" }));
    });
    expect(screen.queryByText("OLD0000")).not.toBeInTheDocument();
    expect(stockRows().map((row) => row.dataset.symbol)).toEqual(["NEW0000", "NEW0001"]);
    scrollToRow(0);
    expect(listMock).toHaveBeenCalledTimes(3);
  });

  it("drops a later page in flight when the query changes: the new rows are not busy and page on", async () => {
    listMock.mockResolvedValueOnce(list(generated(50), { matchCount: 120, nextCursor: "c1" }));
    const { rerender } = render(<Host />);
    await screen.findByText("SYM0000");
    listMock.mockReturnValueOnce(deferred<ClassificationList>().promise);
    scrollToRow(40);
    expect(listMock).toHaveBeenCalledTimes(2);
    expect(table()).toHaveAttribute("aria-busy", "true");

    listMock.mockResolvedValueOnce(
      list(generated(50, "NEW"), { matchCount: 90, nextCursor: "n1" }),
    );
    rerender(<Host query={{ ...DEFAULT_RESEARCH_QUERY, scope: "u-4" }} />);
    await screen.findByText("NEW0000");
    expect(table()).not.toHaveAttribute("aria-busy", "true");

    listMock.mockResolvedValueOnce(list(generated(40, "NX"), { matchCount: 90, nextCursor: null }));
    scrollToRow(40);
    expect(listMock).toHaveBeenCalledTimes(4);
    expect(listMock.mock.calls[3][0]).toEqual({
      universeId: "u-4",
      limit: PAGE_SIZE,
      cursor: "n1",
    });
    await waitFor(() => expect(table()).not.toHaveAttribute("aria-busy", "true"));
    scrollToRow(60);
    expect(screen.getByText("NX0000")).toBeInTheDocument();
  });

  it("drops a later page's error when the query changes", async () => {
    listMock.mockResolvedValueOnce(list(generated(50), { matchCount: 120, nextCursor: "c1" }));
    const { rerender } = render(<Host />);
    await screen.findByText("SYM0000");
    listMock.mockRejectedValueOnce(apiError("internal_error"));
    scrollToRow(40);
    await screen.findByRole("button", { name: RESULTS.tryAgain });

    listMock.mockResolvedValueOnce(list(generated(3, "NEW")));
    rerender(<Host query={{ ...DEFAULT_RESEARCH_QUERY, scope: "u-5" }} />);
    await screen.findByText("NEW0000");
    expect(screen.queryByRole("button", { name: RESULTS.tryAgain })).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        failureSentence({
          operation: "list-classifications",
          resource: "classification",
          code: "internal_error",
        }),
      ),
    ).not.toBeInTheDocument();
  });

  it("never sends the old cursor after a refreshKey bump, even when a page lands in the same render as the bump", async () => {
    listMock.mockResolvedValueOnce(list(generated(50), { matchCount: 200, nextCursor: "c1" }));
    const { rerender } = render(<Host />);
    await screen.findByText("SYM0000");

    const second = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(second.promise);
    scrollToRow(40);
    expect(listMock).toHaveBeenCalledTimes(2);

    const pageOne = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(pageOne.promise);
    await act(async () => {
      second.resolve(list(generated(10, "PG2"), { matchCount: 200, nextCursor: "c2" }));
      await Promise.resolve();
      rerender(<Host refreshKey={1} />);
    });
    expect(listMock).toHaveBeenCalledTimes(3);
    expect(listMock.mock.calls[2][0]).toEqual({ limit: PAGE_SIZE });
    scrollToRow(55);
    expect(listMock).toHaveBeenCalledTimes(3);
    await act(async () => {
      pageOne.resolve(list(generated(50, "RF"), { matchCount: 200, nextCursor: "r1" }));
    });
    expect(screen.getByText("RF0000")).toBeInTheDocument();
    for (const call of listMock.mock.calls.slice(2)) {
      expect(call[0]).not.toHaveProperty("cursor", "c2");
    }
  });

  it("ignores a superseded page one that fails late", async () => {
    listMock.mockResolvedValueOnce(list(generated(3)));
    const { rerender } = render(<Host />);
    await screen.findByText("SYM0000");
    const lateFailure = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(lateFailure.promise);
    rerender(<Host query={{ ...DEFAULT_RESEARCH_QUERY, scope: "u-6" }} />);
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));

    listMock.mockResolvedValueOnce(list(generated(3, "NEW")));
    rerender(<Host query={{ ...DEFAULT_RESEARCH_QUERY, scope: "u-7" }} />);
    await screen.findByText("NEW0000");
    await act(async () => {
      lateFailure.reject(apiError("internal_error"));
    });
    expect(screen.getByText("NEW0000")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: RESULTS.tryAgain })).not.toBeInTheDocument();
    expect(table()).not.toHaveAttribute("aria-busy", "true");
  });

  it("ignores a superseded later page that fails late", async () => {
    listMock.mockResolvedValueOnce(list(generated(50), { matchCount: 120, nextCursor: "c1" }));
    const { rerender } = render(<Host />);
    await screen.findByText("SYM0000");
    const latePage = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(latePage.promise);
    scrollToRow(40);
    expect(listMock).toHaveBeenCalledTimes(2);

    listMock.mockResolvedValueOnce(list(generated(3, "NEW")));
    rerender(<Host query={{ ...DEFAULT_RESEARCH_QUERY, scope: "u-8" }} />);
    await screen.findByText("NEW0000");
    await act(async () => {
      latePage.reject(apiError("internal_error"));
    });
    expect(screen.queryByRole("button", { name: RESULTS.tryAgain })).not.toBeInTheDocument();
    expect(table()).not.toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("NEW0000")).toBeInTheDocument();
  });

  it("hands nothing to onResult for a page one that lands after unmount", async () => {
    const onResult = vi.fn();
    const pending = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(pending.promise);
    const { unmount } = render(<Host onResult={onResult} />);
    expect(listMock).toHaveBeenCalledTimes(1);
    unmount();
    await act(async () => {
      pending.resolve(list(generated(3)));
    });
    expect(onResult).not.toHaveBeenCalled();
  });

  it("uses the host's matchLabel when given", async () => {
    listMock.mockResolvedValueOnce(list(generated(2), { matchCount: 7 }));
    render(<Host matchLabel={(count) => RESULTS.membersMatch(count, 12)} />);
    await screen.findByText("SYM0000");
    expect(statusRegion()).toHaveTextContent("7 of 12 members match");
  });

  it("renders the host's never-populated body in place of the table, and keeps it while a reload is pending", async () => {
    const empty = vi.fn((kind: "never-populated" | "no-match") => (
      <p>{kind === "never-populated" ? NEVER_POPULATED_BODY : NO_MATCH_BODY}</p>
    ));
    listMock.mockResolvedValueOnce(neverClassified());
    const { rerender } = render(<Host empty={empty} />);
    await screen.findByText(NEVER_POPULATED_BODY);
    expect(empty).toHaveBeenCalledWith("never-populated");
    expect(empty).not.toHaveBeenCalledWith("no-match");
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryAllByRole("row")).toHaveLength(0);
    expect(screen.queryAllByRole("columnheader")).toHaveLength(0);
    expect(screen.queryAllByRole("button", { name: /^Sort by/ })).toHaveLength(0);
    expect(screen.queryByRole("button", { name: RESULTS.tryAgain })).toBeNull();
    expect(statusRegion()).toBeInTheDocument();

    const reload = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(reload.promise);
    rerender(<Host empty={empty} refreshKey={1} />);
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
    expect(screen.getByText(NEVER_POPULATED_BODY)).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();

    await act(async () => {
      reload.resolve(list(generated(2)));
    });
    expect(screen.queryByText(NEVER_POPULATED_BODY)).not.toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("SYM0000")).toBeInTheDocument();
  });

  it("replaces the never-populated body with the failure sentence when a reload fails", async () => {
    listMock.mockResolvedValueOnce(neverClassified());
    const { rerender } = render(<Host />);
    await screen.findByText(NEVER_POPULATED_BODY);

    listMock.mockRejectedValueOnce(apiError("internal_error"));
    rerender(<Host refreshKey={1} />);
    const sentence = failureSentence({
      operation: "list-classifications",
      resource: "classification",
      code: "internal_error",
    });
    await screen.findByText(sentence);
    expect(screen.queryByText(NEVER_POPULATED_BODY)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: RESULTS.tryAgain })).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("renders the host's no-match body as the only row under the kept header", async () => {
    const empty = vi.fn((kind: "never-populated" | "no-match") => (
      <p>{kind === "never-populated" ? NEVER_POPULATED_BODY : NO_MATCH_BODY}</p>
    ));
    listMock.mockResolvedValueOnce(list([], { matchCount: 0 }));
    render(
      <Host
        empty={empty}
        initialQuery={{
          ...DEFAULT_RESEARCH_QUERY,
          sort: { key: "value_percentile", order: "asc" },
        }}
      />,
    );
    await screen.findByText(NO_MATCH_BODY);
    expect(empty).toHaveBeenCalledWith("no-match");
    expect(empty).not.toHaveBeenCalledWith("never-populated");
    expect(screen.getByRole("table")).toBeInTheDocument();
    const columns = headerCells().length;
    expect(columns).toBeGreaterThan(0);
    const body = document.querySelector("tbody") as HTMLElement;
    expect(body.querySelectorAll("tr")).toHaveLength(1);
    const cells = body.querySelectorAll("td");
    expect(cells).toHaveLength(1);
    expect(cells[0].colSpan).toBe(columns);
    expect(within(cells[0]).getByText(NO_MATCH_BODY)).toBeInTheDocument();
    expect(stockRows()).toHaveLength(0);
    for (const header of headerCells()) {
      expect(header).not.toHaveAttribute("aria-sort");
    }
    expect(table()).not.toHaveAttribute("aria-rowcount");
  });

  it("gives the Symbol header no default aria-sort while no row is listed", async () => {
    listMock.mockResolvedValueOnce(list([], { matchCount: 0 }));
    render(<Host />);
    await screen.findByText(NO_MATCH_BODY);
    expect(headerOf(RESULTS.columns.symbol)).not.toHaveAttribute("aria-sort");
    expect(screen.getByRole("button", { name: SORT.bySymbol })).toBeInTheDocument();
  });
});

// T008, the loading half: structure and cell composition (AC-9, DAC-E4-1; Open Gaps 1 and 3).
describe("T008: structure and cell composition", () => {
  const incompleteGrowth = stock("INC", {
    growth: notClassified("input_missing", {
      reasonInput: "revenue",
      reasonDetail: "revenue missing",
    }),
  });

  it("is a native table whose columns run checkbox, Symbol, Name, Value, Growth, Momentum", async () => {
    listMock.mockResolvedValueOnce(list([stock("AAPL"), incompleteGrowth]));
    render(<Host />);
    await screen.findByText("AAPL");
    expect(table().tagName).toBe("TABLE");
    const headers = headerCells();
    expect(headers).toHaveLength(6);
    expect(headers.slice(1).map(headerText)).toEqual([
      RESULTS.columns.symbol,
      RESULTS.columns.name,
      FACTOR_LABELS.value,
      FACTOR_LABELS.growth,
      FACTOR_LABELS.momentum,
    ]);
    for (const header of headers) {
      expect(header.tagName).toBe("TH");
      expect(header).toHaveAttribute("scope", "col");
    }
  });

  it("makes each Symbol cell a programmatic row header in the numeric face, plain text", async () => {
    listMock.mockResolvedValueOnce(list([stock("AAPL")]));
    render(<Host />);
    await screen.findByText("AAPL");
    const rowHeader = screen.getByRole("rowheader", { name: "AAPL" });
    expect(rowHeader.tagName).toBe("TH");
    expect(rowHeader).toHaveAttribute("scope", "row");
    expect(rowHeader).toHaveClass("font-numeric");
    expect(rowHeader.querySelector("a, button")).toBeNull();
    expect(rowOf("AAPL").children[1]).toBe(rowHeader);
  });

  it("truncates the Name cell by class and carries the full name as its title", async () => {
    listMock.mockResolvedValueOnce(list([stock("AAPL", {}, { name: "Apple Inc." })]));
    render(<Host />);
    await screen.findByText("AAPL");
    const name = rowOf("AAPL").children[2] as HTMLElement;
    expect(name.tagName).toBe("TD");
    expect(name).toHaveTextContent("Apple Inc.");
    expect(name).toHaveAttribute("title", "Apple Inc.");
    expect(name).toHaveClass("truncate");
  });

  it("renders each factor cell through FactorCell: the whole-number percentile, an aria-hidden bar, no score", async () => {
    listMock.mockResolvedValueOnce(
      list([
        stock("AAPL", {
          value: scored("84.4", "1.27"),
          growth: scored("61"),
          momentum: scored("27"),
        }),
      ]),
    );
    render(<Host />);
    await screen.findByText("AAPL");
    const row = rowOf("AAPL");
    const cells = [row.children[3], row.children[4], row.children[5]] as HTMLElement[];
    expect(
      cells.map((cell) => cell.querySelector("[data-testid='factor-percentile']")?.textContent),
    ).toEqual([formatPercentile("84.4"), "61", "27"]);
    for (const cell of cells) {
      const bar = cell.querySelector("[data-testid='factor-bar']");
      expect(bar).toHaveAttribute("aria-hidden", "true");
      expect(cell.querySelector("[data-testid='factor-score']")).toBeNull();
      expect(cell).toHaveClass("text-right");
    }
    expect(row.textContent).not.toContain("1.27");
    expect(row.textContent).not.toContain("+1.27");
  });

  it("reads Not followed in every factor cell of a retired stock", async () => {
    listMock.mockResolvedValueOnce(list([retired("OLD")]));
    render(<Host />);
    await screen.findByText("OLD");
    const row = rowOf("OLD");
    for (const cell of [row.children[3], row.children[4], row.children[5]]) {
      expect(cell).toHaveTextContent(CELL.notFollowed);
      expect(cell.querySelector("[data-variant='status-neutral']")).not.toBeNull();
    }
  });

  it("gives each factor header an aria-hidden swatch painting the factor's identity token and the factor's name", async () => {
    listMock.mockResolvedValueOnce(list([stock("AAPL")]));
    render(<Host />);
    await screen.findByText("AAPL");
    for (const factor of FACTORS) {
      const header = headerOf(FACTOR_LABELS[factor]);
      const swatch = header.querySelector(
        "[aria-hidden='true'][data-testid='factor-swatch']",
      ) as HTMLElement;
      expect(swatch).not.toBeNull();
      expect(swatch.style.background).toContain(`--factor-${factor}`);
      expect(header).toHaveClass("text-right");
    }
    expect(headerOf(RESULTS.columns.symbol)).toHaveClass("text-left");
    expect(headerOf(RESULTS.columns.name)).toHaveClass("text-left");
  });

  it("applies no polarity or neutral-value class to any cell", async () => {
    listMock.mockResolvedValueOnce(list([stock("AAPL"), incompleteGrowth, retired("OLD")]));
    render(<Host />);
    await screen.findByText("AAPL");
    for (const cell of document.querySelectorAll("td, th")) {
      expect(cell.className).not.toMatch(/gain|loss|neutral-value/);
    }
  });
});

// --- Cycle 3: the header and sort -------------------------------------------

const sortButton = (name: string): HTMLElement => screen.getByRole("button", { name });
const ariaSortOf = (): Record<string, string | null> =>
  Object.fromEntries(
    headerCells().map((header, index) => [
      index === 0 ? "checkbox" : headerText(header),
      header.getAttribute("aria-sort"),
    ]),
  );

// Implements TC-COMP-110 (T001): DAC-E4-S6-1, AC-14, DAC-E4-1.
describe("TC-COMP-110: a factor below 30 qualifying stocks states the count once and has no sort control", () => {
  const underThirty = (qualifiedCount: number, minPeerSetSize: number): ClassificationList =>
    list(
      ["AAPL", "MSFT", "NVDA"].map((symbol) =>
        stock(symbol, { growth: notClassified("not_enough_stocks") }),
      ),
      {
        factors: {
          value: summary(),
          growth: summary({ qualifiedCount, ranked: false, minPeerSetSize }),
          momentum: summary(),
        },
      },
    );

  it("puts {n} qualified, {needed} needed in the Growth header exactly once, from the response's numbers", async () => {
    listMock.mockResolvedValueOnce(underThirty(20, 30));
    render(<Host />);
    await screen.findByText("AAPL");
    const sentence = CELL.qualified(20, 30);
    expect(sentence).toBe("20 qualified, 30 needed");
    expect(screen.getAllByText(sentence)).toHaveLength(1);
    expect(headerOf(FACTOR_LABELS.growth)).toHaveTextContent(sentence);
    for (const row of stockRows()) {
      expect(row.textContent).not.toContain("qualified");
    }
  });

  it("reads the response's threshold, never a literal 30", async () => {
    listMock.mockResolvedValueOnce(underThirty(3, 25));
    render(<Host />);
    await screen.findByText("AAPL");
    expect(screen.getAllByText("3 qualified, 25 needed")).toHaveLength(1);
    expect(screen.queryByText(/30 needed/)).toBeNull();
  });

  it("renders Not enough to rank in every Growth cell, with no count, no title and no digit", async () => {
    listMock.mockResolvedValueOnce(underThirty(20, 30));
    render(<Host />);
    await screen.findByText("AAPL");
    for (const row of stockRows()) {
      const growth = row.children[4] as HTMLElement;
      const badge = growth.querySelector("[data-variant='coverage-unknown']") as HTMLElement;
      expect(badge).not.toBeNull();
      expect(growth.textContent?.trim()).toBe(CELL.notEnoughToRank);
      expect(growth.textContent).not.toMatch(/\d/);
      expect(badge).not.toHaveAttribute("title");
      expect(growth.querySelector("[title]")).toBeNull();
    }
  });

  it("removes the Growth sort controls and aria-sort while Value and Momentum keep theirs", async () => {
    listMock.mockResolvedValueOnce(underThirty(20, 30));
    render(
      <Host
        initialQuery={{
          ...DEFAULT_RESEARCH_QUERY,
          sort: { key: "value_percentile", order: "asc" },
        }}
      />,
    );
    await screen.findByText("AAPL");
    const growth = headerOf(FACTOR_LABELS.growth);
    expect(growth.querySelector("button")).toBeNull();
    expect(growth).not.toHaveAttribute("aria-sort");
    expect(growth).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("button", { name: SORT.byPercentile("growth") })).toBeNull();
    expect(screen.queryByRole("button", { name: SORT.byStandardisedScore("growth") })).toBeNull();
    expect(sortButton(SORT.byPercentile("value"))).toBeInTheDocument();
    expect(sortButton(SORT.byStandardisedScore("value"))).toBeInTheDocument();
    expect(sortButton(SORT.byPercentile("momentum"))).toBeInTheDocument();
    expect(sortButton(SORT.byStandardisedScore("momentum"))).toBeInTheDocument();
    expect(headerOf(FACTOR_LABELS.value)).toHaveAttribute("aria-sort", "ascending");
    expect(headerOf(FACTOR_LABELS.momentum)).toHaveAttribute("aria-describedby");
  });

  it("carries no aria-sort on the unranked column even when the query sorts by it", async () => {
    for (const key of ["growth_percentile", "growth_score"] as const) {
      listMock.mockResolvedValueOnce(underThirty(20, 30));
      const { unmount } = render(
        <Host initialQuery={{ ...DEFAULT_RESEARCH_QUERY, sort: { key, order: "asc" } }} />,
      );
      await screen.findByText("AAPL");
      expect(listMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort: key, order: "asc" }),
      );
      expect(headerOf(FACTOR_LABELS.growth)).not.toHaveAttribute("aria-sort");
      for (const header of headerCells()) {
        expect(header).not.toHaveAttribute("aria-sort");
      }
      unmount();
    }
  });

  it("never shows a percentile on an unranked factor, even when a cell arrives classified", async () => {
    const page = underThirty(20, 30);
    page.stocks[0].factors.growth = scored("77", "1.10");
    listMock.mockResolvedValueOnce(page);
    render(<Host />);
    await screen.findByText("AAPL");
    const growth = rowOf("AAPL").children[4] as HTMLElement;
    expect(growth.textContent?.trim()).toBe(CELL.notEnoughToRank);
    expect(growth.querySelector("[data-testid='factor-percentile']")).toBeNull();
    expect(rowOf("AAPL").textContent).not.toContain("77");
  });

  it("keeps Not followed for a retired stock in an unranked column", async () => {
    const page = underThirty(20, 30);
    page.stocks.push(retired("OLD"));
    listMock.mockResolvedValueOnce(page);
    render(<Host />);
    await screen.findByText("OLD");
    const growth = rowOf("OLD").children[4] as HTMLElement;
    expect(growth.textContent?.trim()).toBe(CELL.notFollowed);
  });
});

// Implements TC-COMP-098 (T002): DAC-E4-S6-3, AC-12.
describe("TC-COMP-098: a stock incomplete on one factor reads two percentiles and one Incomplete", () => {
  const incomplete = stock("INC", {
    value: scored("84"),
    growth: notClassified("input_missing", {
      reasonInput: "revenue",
      reasonDetail: "revenue missing",
    }),
    momentum: scored("27"),
  });

  it("renders two percentiles and one Incomplete, never 0, and no row-level failure", async () => {
    listMock.mockResolvedValueOnce(list([stock("AAPL"), incomplete]));
    render(<Host />);
    await screen.findByText("INC");
    const row = rowOf("INC");
    const percentiles = row.querySelectorAll("[data-testid='factor-percentile']");
    expect(Array.from(percentiles).map((cell) => cell.textContent)).toEqual(["84", "27"]);
    const badges = row.querySelectorAll("[data-variant='coverage-absent']");
    expect(badges).toHaveLength(1);
    expect(badges[0]).toHaveTextContent(CELL.incomplete);
    expect((row.children[4] as HTMLElement).textContent).not.toMatch(/\d/);
    expect(row).not.toHaveAttribute("aria-invalid");
    expect(row.className).not.toMatch(/destructive|critical|serious|warning/);
    expect((row.children[3] as HTMLElement).textContent).toBe("84");
  });

  it("renders rows in exactly the response's order, incomplete last or first alike", async () => {
    listMock.mockResolvedValueOnce(list([stock("AAPL"), stock("MSFT"), incomplete]));
    const { unmount } = render(<Host />);
    await screen.findByText("INC");
    expect(stockRows().map((row) => row.dataset.symbol)).toEqual(["AAPL", "MSFT", "INC"]);
    unmount();

    listMock.mockResolvedValueOnce(list([incomplete, stock("AAPL"), stock("MSFT")]));
    render(<Host />);
    await screen.findByText("INC");
    expect(stockRows().map((row) => row.dataset.symbol)).toEqual(["INC", "AAPL", "MSFT"]);
  });

  it("describes every sortable factor header as listing incomplete scores last in both directions", async () => {
    listMock.mockResolvedValueOnce(list([stock("AAPL"), incomplete]));
    render(<Host />);
    await screen.findByText("INC");
    for (const factor of FACTORS) {
      const header = headerOf(FACTOR_LABELS[factor]);
      const id = header.getAttribute("aria-describedby");
      expect(id).toBeTruthy();
      const description = document.getElementById(id as string) as HTMLElement;
      expect(description).toHaveTextContent(SORT.incompleteLast);
      expect(description).toHaveClass("sr-only");
    }
    expect(SORT.incompleteLast).toBe(
      "Stocks with an incomplete score are listed last, whether sorted up or down.",
    );
  });

  it("sends hideIncomplete to the read when the query hides incomplete scores, and renders what the response holds", async () => {
    listMock.mockResolvedValueOnce(list([stock("AAPL")], { matchCount: 1 }));
    render(<Host initialQuery={{ ...DEFAULT_RESEARCH_QUERY, hideIncomplete: true }} />);
    await screen.findByText("AAPL");
    expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ hideIncomplete: true }));
    expect(stockRows()).toHaveLength(1);
  });

  it("keeps an incomplete row the response contains under a threshold with hide-incomplete off", async () => {
    listMock.mockResolvedValueOnce(list([stock("AAPL"), incomplete]));
    render(
      <Host
        initialQuery={{
          ...DEFAULT_RESEARCH_QUERY,
          sentences: { growth: { measure: "percentile", direction: "atLeast", value: "50" } },
        }}
      />,
    );
    await screen.findByText("INC");
    expect(listMock.mock.calls[0][0]).not.toHaveProperty("hideIncomplete");
    expect(listMock.mock.calls[0][0]).toMatchObject({ growthPercentileMin: "50" });
    expect(rowOf("INC")).toBeInTheDocument();
    expect(stockRows()).toHaveLength(2);
  });
});

// Implements TC-COMP-138 (T003): DAC-E4-S6-2, AC-16.
describe("TC-COMP-138: sorting is a request", () => {
  async function renderSorted(): Promise<ReturnType<typeof userEvent.setup>> {
    const user = userEvent.setup();
    listMock.mockResolvedValueOnce(list(generated(3), { matchCount: 2846 }));
    render(<Host />);
    await screen.findByText("SYM0000");
    return user;
  }

  it("cycles the Value percentile sort through ascending, descending and none, as requests", async () => {
    const user = await renderSorted();
    expect(ariaSortOf()).toMatchObject({
      Symbol: "ascending",
      Value: null,
      Growth: null,
      Momentum: null,
    });
    expect(glyphOf(sortButton(SORT.bySymbol))).toBe("▲");
    expect(glyphOf(sortButton(SORT.byPercentile("value")))).toBe("↕");

    listMock.mockResolvedValueOnce(list(generated(3, "ASC"), { matchCount: 2846 }));
    await user.click(sortButton(SORT.byPercentile("value")));
    expect(listMock).toHaveBeenCalledTimes(2);
    expect(listMock.mock.calls[1][0]).toEqual({
      sort: "value_percentile",
      order: "asc",
      limit: PAGE_SIZE,
    });
    await screen.findByText("ASC0000");
    expect(ariaSortOf()).toMatchObject({
      Symbol: null,
      Value: "ascending",
      Growth: null,
      Momentum: null,
    });
    expect(glyphOf(sortButton(SORT.byPercentile("value")))).toBe("▲");
    expect(glyphOf(sortButton(SORT.byStandardisedScore("value")))).toBe("↕");
    expect(glyphOf(sortButton(SORT.bySymbol))).toBe("↕");

    listMock.mockResolvedValueOnce(list(generated(3, "DSC"), { matchCount: 2846 }));
    await user.click(sortButton(SORT.byPercentile("value")));
    expect(listMock.mock.calls[2][0]).toEqual({
      sort: "value_percentile",
      order: "desc",
      limit: PAGE_SIZE,
    });
    await screen.findByText("DSC0000");
    expect(headerOf(FACTOR_LABELS.value)).toHaveAttribute("aria-sort", "descending");
    expect(glyphOf(sortButton(SORT.byPercentile("value")))).toBe("▼");

    listMock.mockResolvedValueOnce(list(generated(3, "NON"), { matchCount: 2846 }));
    await user.click(sortButton(SORT.byPercentile("value")));
    expect(listMock.mock.calls[3][0]).toEqual({ limit: PAGE_SIZE });
    expect(listMock.mock.calls[3][0]).not.toHaveProperty("sort");
    expect(listMock.mock.calls[3][0]).not.toHaveProperty("order");
    await screen.findByText("NON0000");
    expect(headerOf(FACTOR_LABELS.value)).not.toHaveAttribute("aria-sort");
    expect(headerOf(RESULTS.columns.symbol)).toHaveAttribute("aria-sort", "ascending");
    expect(glyphOf(sortButton(SORT.byPercentile("value")))).toBe("↕");
    expect(glyphOf(sortButton(SORT.bySymbol))).toBe("▲");
  });

  it("keeps the rest of the query when it sorts", async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValueOnce(list(generated(3), { matchCount: 12 }));
    render(
      <Host
        initialQuery={{
          ...DEFAULT_RESEARCH_QUERY,
          scope: "u-1",
          hideIncomplete: true,
          symbol: "SY",
          sentences: { value: { measure: "percentile", direction: "atLeast", value: "80" } },
        }}
      />,
    );
    await screen.findByText("SYM0000");
    listMock.mockResolvedValueOnce(list(generated(3, "SRT"), { matchCount: 12 }));
    await user.click(sortButton(SORT.byPercentile("growth")));
    expect(listMock.mock.calls[1][0]).toEqual({
      universeId: "u-1",
      hideIncomplete: true,
      symbol: "SY",
      valuePercentileMin: "80",
      sort: "growth_percentile",
      order: "asc",
      limit: PAGE_SIZE,
    });
    await screen.findByText("SRT0000");
  });

  it("requests the standardised-score key from the second button", async () => {
    const user = await renderSorted();
    listMock.mockResolvedValueOnce(list(generated(3, "GS"), { matchCount: 2846 }));
    await user.click(sortButton(SORT.byStandardisedScore("growth")));
    expect(listMock.mock.calls[1][0]).toEqual({
      sort: "growth_score",
      order: "asc",
      limit: PAGE_SIZE,
    });
    await screen.findByText("GS0000");
    expect(headerOf(FACTOR_LABELS.growth)).toHaveAttribute("aria-sort", "ascending");
    expect(headerOf(FACTOR_LABELS.value)).not.toHaveAttribute("aria-sort");
  });

  it("cycles the Symbol sort through its default ascending, descending and back", async () => {
    const user = await renderSorted();
    listMock.mockResolvedValueOnce(list(generated(3, "SD"), { matchCount: 2846 }));
    await user.click(sortButton(SORT.bySymbol));
    expect(listMock.mock.calls[1][0]).toEqual({ sort: "symbol", order: "desc", limit: PAGE_SIZE });
    await screen.findByText("SD0000");
    expect(headerOf(RESULTS.columns.symbol)).toHaveAttribute("aria-sort", "descending");

    listMock.mockResolvedValueOnce(list(generated(3, "SA"), { matchCount: 2846 }));
    await user.click(sortButton(SORT.bySymbol));
    expect(listMock.mock.calls[2][0]).toEqual({ limit: PAGE_SIZE });
    await screen.findByText("SA0000");
    expect(headerOf(RESULTS.columns.symbol)).toHaveAttribute("aria-sort", "ascending");
    expect(glyphOf(sortButton(SORT.bySymbol))).toBe("▲");
  });

  it("starts the Symbol sort at its A to Z default when a factor sort is active", async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValueOnce(list(generated(3), { matchCount: 2846 }));
    render(
      <Host
        initialQuery={{
          ...DEFAULT_RESEARCH_QUERY,
          sort: { key: "value_percentile", order: "desc" },
        }}
      />,
    );
    await screen.findByText("SYM0000");
    expect(headerOf(FACTOR_LABELS.value)).toHaveAttribute("aria-sort", "descending");

    listMock.mockResolvedValueOnce(list(generated(3, "AZ"), { matchCount: 2846 }));
    await user.click(sortButton(SORT.bySymbol));
    expect(listMock.mock.calls[1][0]).toEqual({ limit: PAGE_SIZE });
    expect(listMock.mock.calls[1][0]).not.toHaveProperty("sort");
    expect(listMock.mock.calls[1][0]).not.toHaveProperty("order");
    await screen.findByText("AZ0000");
    expect(headerOf(RESULTS.columns.symbol)).toHaveAttribute("aria-sort", "ascending");
    expect(headerOf(FACTOR_LABELS.value)).not.toHaveAttribute("aria-sort");

    listMock.mockResolvedValueOnce(list(generated(3, "ZA"), { matchCount: 2846 }));
    await user.click(sortButton(SORT.bySymbol));
    expect(listMock.mock.calls[2][0]).toEqual({ sort: "symbol", order: "desc", limit: PAGE_SIZE });
    await screen.findByText("ZA0000");
    expect(headerOf(RESULTS.columns.symbol)).toHaveAttribute("aria-sort", "descending");
  });

  it("treats an explicit symbol ascending sort in the query as the default: the next press is Z to A", async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValueOnce(list(generated(3), { matchCount: 2846 }));
    render(
      <Host initialQuery={{ ...DEFAULT_RESEARCH_QUERY, sort: { key: "symbol", order: "asc" } }} />,
    );
    await screen.findByText("SYM0000");
    expect(headerOf(RESULTS.columns.symbol)).toHaveAttribute("aria-sort", "ascending");
    listMock.mockResolvedValueOnce(list(generated(3, "ZA"), { matchCount: 2846 }));
    await user.click(sortButton(SORT.bySymbol));
    expect(listMock.mock.calls[1][0]).toEqual({ sort: "symbol", order: "desc", limit: PAGE_SIZE });
    await screen.findByText("ZA0000");
  });

  it("keeps focus on the activated button before and after the rows arrive, with the old rows busy meanwhile", async () => {
    const user = await renderSorted();
    const pending = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(pending.promise);
    const button = sortButton(SORT.byPercentile("momentum"));
    await user.click(button);
    expect(document.activeElement).toBe(button);
    expect(screen.getByText("SYM0000")).toBeInTheDocument();
    expect(table()).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("progressbar")).toBeNull();
    // aria-sort follows the query at once, before the response.
    expect(headerOf(FACTOR_LABELS.momentum)).toHaveAttribute("aria-sort", "ascending");

    await act(async () => {
      pending.resolve(list([stock("ZZZ"), stock("AAA"), stock("MMM")], { matchCount: 2846 }));
    });
    expect(document.activeElement).toBe(button);
    expect(sortButton(SORT.byPercentile("momentum"))).toBe(button);
    expect(table()).not.toHaveAttribute("aria-busy", "true");
    // The table never sorts rows itself: the DOM order is the response order.
    expect(stockRows().map((row) => row.dataset.symbol)).toEqual(["ZZZ", "AAA", "MMM"]);
  });

  it("announces the server's match count after the sorted page arrives", async () => {
    const user = await renderSorted();
    listMock.mockResolvedValueOnce(list(generated(3, "S"), { matchCount: 1203 }));
    await user.click(sortButton(SORT.byPercentile("value")));
    await screen.findByText("S0000");
    expect(statusRegion()).toHaveTextContent(RESULTS.stocksMatch(1203));
  });

  it("announces the match count again after a sort that leaves it unchanged", async () => {
    const user = await renderSorted();
    const region = statusRegion();
    expect(region.textContent?.trim()).toBe(RESULTS.stocksMatch(2846));
    const observer = observeRegion(region);

    const sorted = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(sorted.promise);
    await user.click(sortButton(SORT.byPercentile("value")));
    // Nothing is announced before the sorted page arrives.
    expect(observer.records).toHaveLength(0);
    await act(async () => {
      sorted.resolve(list(generated(3, "S"), { matchCount: 2846 }));
    });
    expect(screen.getByText("S0000")).toBeInTheDocument();
    expect(observer.records.length).toBeGreaterThan(0);
    observer.disconnect();
    expect(region.textContent?.trim()).toBe(RESULTS.stocksMatch(2846));
    expect(statusRegion()).toBe(region);
  });

  it("activates once on Enter and once on Space from the keyboard", async () => {
    const user = await renderSorted();
    const button = sortButton(SORT.byPercentile("value"));
    button.focus();
    listMock.mockResolvedValueOnce(list(generated(3, "K1"), { matchCount: 2846 }));
    await user.keyboard("{Enter}");
    await screen.findByText("K10000");
    expect(listMock).toHaveBeenCalledTimes(2);
    expect(listMock.mock.calls[1][0]).toMatchObject({ sort: "value_percentile", order: "asc" });
    listMock.mockResolvedValueOnce(list(generated(3, "K2"), { matchCount: 2846 }));
    await user.keyboard(" ");
    await screen.findByText("K20000");
    expect(listMock).toHaveBeenCalledTimes(3);
    expect(listMock.mock.calls[2][0]).toMatchObject({ sort: "value_percentile", order: "desc" });
  });
});

// T008, the header half: the sort controls and the header's composition (AC-9, DAC-E4-1; Open Gap 3).
describe("T008: the header's sort controls", () => {
  it("names seven sort buttons uniquely, each at the 24 px target, with an aria-hidden arrow", async () => {
    listMock.mockResolvedValueOnce(list([stock("AAPL")]));
    render(<Host />);
    await screen.findByText("AAPL");
    const names = screen
      .getAllByRole("button", { name: /^Sort by/ })
      .map((button) => button.getAttribute("aria-label"));
    expect(names).toEqual([
      SORT.bySymbol,
      SORT.byPercentile("value"),
      SORT.byStandardisedScore("value"),
      SORT.byPercentile("growth"),
      SORT.byStandardisedScore("growth"),
      SORT.byPercentile("momentum"),
      SORT.byStandardisedScore("momentum"),
    ]);
    for (const button of screen.getAllByRole("button", { name: /^Sort by/ })) {
      expect(button).toHaveClass("h-5", "w-5");
      expect(button).toHaveAttribute("type", "button");
      const glyph = button.querySelector("[aria-hidden='true']");
      expect(glyph).not.toBeNull();
      expect(button.textContent?.trim()).not.toBe("");
    }
    // The factor name is header text beside the buttons, not a button's name.
    for (const factor of FACTORS) {
      const header = headerOf(FACTOR_LABELS[factor]);
      const clone = header.cloneNode(true) as HTMLElement;
      for (const button of clone.querySelectorAll("button")) {
        button.remove();
      }
      expect(clone.textContent).toContain(FACTOR_LABELS[factor]);
    }
  });
});

// --- Cycle 4: rows, selection and checking ----------------------------------

const checkboxOf = (symbol: string): HTMLInputElement =>
  screen.getByRole("checkbox", { name: CELL.selectRow(symbol) }) as HTMLInputElement;
const hostChecked = (): string => screen.getByTestId("host-checked").textContent ?? "";
const selectedSymbols = (): string[] =>
  stockRows()
    .filter((row) => row.getAttribute("aria-selected") === "true")
    .map((row) => row.dataset.symbol as string);
/** Advances the faked clock inside React's act, so the debounce's effects commit. */
function advance(ms: number): void {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

// Implements TC-COMP-139 (T004): DAC-E4-S6-4, AC-16.
describe("TC-COMP-139: selection and checking never interfere", () => {
  const THREE = [stock("AAPL"), stock("MSFT"), stock("NVDA")];

  async function renderRows(
    props: HostProps = {},
    rows: StockRow[] = THREE,
  ): Promise<ReturnType<typeof userEvent.setup>> {
    const user = userEvent.setup();
    listMock.mockResolvedValueOnce(list(rows));
    render(<Host {...props} />);
    await screen.findByText(rows[0].symbol);
    return user;
  }

  it("selects on a click of the Symbol cell without checking, and marks only that row", async () => {
    const user = await renderRows();
    await user.click(screen.getByRole("rowheader", { name: "MSFT" }));
    expect(selectedSymbols()).toEqual(["MSFT"]);
    expect(checkboxOf("MSFT").checked).toBe(false);
    expect(hostChecked()).toBe("");
    expect(rowOf("MSFT")).toHaveClass("border-l-status-active", "bg-status-active-muted");
    expect(rowOf("AAPL")).not.toHaveClass("bg-status-active-muted");
    expect(rowOf("AAPL")).toHaveAttribute("aria-selected", "false");
  });

  it("selects on Enter from the focused row and not from its checkbox", async () => {
    const user = await renderRows();
    rowOf("NVDA").focus();
    await user.keyboard("{Enter}");
    expect(selectedSymbols()).toEqual(["NVDA"]);
    expect(hostChecked()).toBe("");
    checkboxOf("AAPL").focus();
    await user.keyboard("{Enter}");
    expect(selectedSymbols()).toEqual(["NVDA"]);
    expect(hostChecked()).toBe("");
  });

  it("checks on Space on the checkbox and on a click of it, never selecting", async () => {
    const user = await renderRows();
    checkboxOf("AAPL").focus();
    await user.keyboard(" ");
    expect(checkboxOf("AAPL").checked).toBe(true);
    expect(hostChecked()).toBe("AAPL");
    expect(selectedSymbols()).toEqual([]);
    await user.click(checkboxOf("NVDA"));
    expect(hostChecked()).toBe("AAPL,NVDA");
    expect(selectedSymbols()).toEqual([]);
    await user.click(checkboxOf("AAPL"));
    expect(hostChecked()).toBe("NVDA");
    expect(checkboxOf("AAPL").checked).toBe(false);
  });

  it("keeps the selection where it was when a second row is checked, and both checks when a third is selected", async () => {
    const user = await renderRows();
    await user.click(screen.getByRole("rowheader", { name: "AAPL" }));
    await user.click(checkboxOf("MSFT"));
    expect(selectedSymbols()).toEqual(["AAPL"]);
    expect(hostChecked()).toBe("MSFT");
    await user.click(checkboxOf("AAPL"));
    expect(selectedSymbols()).toEqual(["AAPL"]);
    await user.click(screen.getByRole("rowheader", { name: "NVDA" }));
    expect(selectedSymbols()).toEqual(["NVDA"]);
    expect(hostChecked()).toBe("MSFT,AAPL");
    // Both marks on one row: the selection classes and the checked fill (DEC-0240).
    await user.click(screen.getByRole("rowheader", { name: "MSFT" }));
    expect(rowOf("MSFT")).toHaveClass("border-l-status-active", "bg-status-active-muted");
    expect(rowOf("MSFT").style.background).toContain("--muted");
    expect(rowOf("AAPL").style.background).toContain("--muted");
    expect(rowOf("AAPL")).not.toHaveClass("bg-status-active-muted");
    expect(rowOf("NVDA").style.background).toBe("");
    expect(rowOf("NVDA")).toHaveClass("border-l-transparent");
  });

  it("names each checkbox Select {SYMBOL} at the 24 px target, and selection shifts no content", async () => {
    await renderRows();
    for (const row of THREE) {
      const checkbox = checkboxOf(row.symbol);
      expect(checkbox).toHaveAttribute("type", "checkbox");
      expect(checkbox).toHaveClass("h-5", "w-5");
      expect(rowOf(row.symbol).children[0]).toContainElement(checkbox);
      expect(rowOf(row.symbol)).toHaveClass("border-l-4");
    }
  });

  it("moves the selection and DOM focus with the arrow keys, staying put at either end", async () => {
    const user = await renderRows();
    await user.click(screen.getByRole("rowheader", { name: "AAPL" }));
    expect(document.activeElement).toBe(rowOf("AAPL"));
    await user.keyboard("{ArrowDown}");
    expect(selectedSymbols()).toEqual(["MSFT"]);
    expect(document.activeElement).toBe(rowOf("MSFT"));
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    expect(selectedSymbols()).toEqual(["NVDA"]);
    expect(document.activeElement).toBe(rowOf("NVDA"));
    await user.keyboard("{ArrowUp}");
    expect(selectedSymbols()).toEqual(["MSFT"]);
    expect(document.activeElement).toBe(rowOf("MSFT"));
    await user.keyboard("{ArrowUp}");
    await user.keyboard("{ArrowUp}");
    expect(selectedSymbols()).toEqual(["AAPL"]);
    expect(document.activeElement).toBe(rowOf("AAPL"));
    // From the checkbox the arrows move the row selection too; Space on the row does nothing.
    checkboxOf("AAPL").focus();
    await user.keyboard("{ArrowDown}");
    expect(selectedSymbols()).toEqual(["MSFT"]);
    expect(document.activeElement).toBe(rowOf("MSFT"));
    await user.keyboard(" ");
    expect(hostChecked()).toBe("");
    expect(selectedSymbols()).toEqual(["MSFT"]);
  });

  it("leaves focus on a sort button activated after an arrow press past either end", async () => {
    const user = await renderRows();
    await user.click(screen.getByRole("rowheader", { name: "NVDA" }));
    await user.keyboard("{ArrowDown}");
    expect(selectedSymbols()).toEqual(["NVDA"]);
    expect(document.activeElement).toBe(rowOf("NVDA"));
    listMock.mockResolvedValueOnce(list(THREE));
    const button = sortButton(SORT.byPercentile("value"));
    await user.click(button);
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(table()).not.toHaveAttribute("aria-busy", "true"));
    expect(document.activeElement).toBe(button);

    await user.click(screen.getByRole("rowheader", { name: "AAPL" }));
    await user.keyboard("{ArrowUp}");
    expect(selectedSymbols()).toEqual(["AAPL"]);
    listMock.mockResolvedValueOnce(list(THREE));
    const symbolButton = sortButton(SORT.bySymbol);
    await user.click(symbolButton);
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(3));
    await waitFor(() => expect(table()).not.toHaveAttribute("aria-busy", "true"));
    expect(document.activeElement).toBe(symbolButton);
  });

  it("prevents the browser's default for Space on the row, and leaves it to the checkbox", async () => {
    await renderRows();
    rowOf("MSFT").focus();
    expect(fireEvent.keyDown(rowOf("MSFT"), { key: " " })).toBe(false);
    expect(hostChecked()).toBe("");
    expect(selectedSymbols()).toEqual([]);
    expect(fireEvent.keyDown(checkboxOf("MSFT"), { key: " " })).toBe(true);
    expect(fireEvent.keyDown(rowOf("MSFT"), { key: "Enter" })).toBe(true);
  });

  it("gives the selected row the tab stop, else the first rendered row", async () => {
    const user = await renderRows();
    expect(rowOf("AAPL").tabIndex).toBe(0);
    expect(rowOf("MSFT").tabIndex).toBe(-1);
    await user.click(screen.getByRole("rowheader", { name: "NVDA" }));
    expect(rowOf("NVDA").tabIndex).toBe(0);
    expect(rowOf("AAPL").tabIndex).toBe(-1);
  });

  it("keeps one tab stop when the selected row has scrolled out of the window", async () => {
    listMock.mockResolvedValueOnce(list(generated(3000), { matchCount: 3000 }));
    render(<Host initialSelected="SYM0000" />);
    await screen.findByText("SYM0000");
    expect(rowOf("SYM0000").tabIndex).toBe(0);
    scrollToRow(1500);
    expect(rowOf("SYM0000")).toBeNull();
    const stops = stockRows().filter((row) => row.tabIndex === 0);
    expect(stops).toHaveLength(1);
    expect(stops[0]).toBe(stockRows()[0]);
  });

  it("leaves the arrow keys to a host control inside an extra column", async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValueOnce(list(THREE));
    render(
      <Host
        initialSelected="AAPL"
        extraColumns={[
          {
            id: "note",
            header: "Note",
            cell: (row) => <input aria-label={`Note ${row.symbol}`} />,
          },
        ]}
      />,
    );
    await screen.findByText("AAPL");
    screen.getByRole("textbox", { name: "Note AAPL" }).focus();
    await user.keyboard("{ArrowDown}");
    expect(selectedSymbols()).toEqual(["AAPL"]);
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Note AAPL" }));
  });

  it("focuses an arrow-selected row once, not on every later render", async () => {
    const user = await renderRows();
    await user.click(screen.getByRole("rowheader", { name: "AAPL" }));
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(rowOf("MSFT"));
    listMock.mockResolvedValueOnce(list(THREE));
    const button = sortButton(SORT.byPercentile("value"));
    await user.click(button);
    expect(document.activeElement).toBe(button);
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(table()).not.toHaveAttribute("aria-busy", "true"));
    expect(document.activeElement).toBe(button);
  });

  // The three timing tests drive the keys and clicks with fireEvent, which waits on
  // nothing, so the faked clock moves only when the test advances it.
  it("notifies onInspect once, 150 ms after the last of a burst of arrow presses", async () => {
    const onInspect = vi.fn();
    listMock.mockResolvedValueOnce(list(generated(10)));
    render(<Host onInspect={onInspect} initialSelected="SYM0000" />);
    await screen.findByText("SYM0000");
    vi.useFakeTimers();
    expect(INSPECT_DEBOUNCE_MS).toBe(150);
    const press = (symbol: string): void => {
      rowOf(symbol).focus();
      fireEvent.keyDown(rowOf(symbol), { key: "ArrowDown" });
    };
    press("SYM0000");
    advance(50);
    press("SYM0001");
    advance(50);
    press("SYM0002");
    expect(selectedSymbols()).toEqual(["SYM0003"]);
    expect(document.activeElement).toBe(rowOf("SYM0003"));
    expect(onInspect).not.toHaveBeenCalled();
    advance(149);
    expect(onInspect).not.toHaveBeenCalled();
    advance(1);
    expect(onInspect).toHaveBeenCalledTimes(1);
    expect(onInspect).toHaveBeenCalledWith("SYM0003");
    advance(1000);
    expect(onInspect).toHaveBeenCalledTimes(1);
  });

  it("notifies onInspect after a click selection, never for checking or an unchanged selection", async () => {
    const onInspect = vi.fn();
    listMock.mockResolvedValueOnce(list(THREE));
    render(<Host onInspect={onInspect} />);
    await screen.findByText("AAPL");
    vi.useFakeTimers();
    const hostSelected = (): string => screen.getByTestId("host-selected").textContent ?? "";
    fireEvent.click(checkboxOf("AAPL"));
    advance(1000);
    expect(onInspect).not.toHaveBeenCalled();
    expect(hostSelected()).toBe("");
    fireEvent.click(screen.getByRole("rowheader", { name: "MSFT" }));
    expect(hostSelected()).toBe("MSFT");
    advance(149);
    expect(onInspect).not.toHaveBeenCalled();
    advance(1);
    expect(onInspect).toHaveBeenCalledWith("MSFT");
    expect(onInspect).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("rowheader", { name: "MSFT" }));
    advance(1000);
    expect(onInspect).toHaveBeenCalledTimes(1);
  });

  it("clears a pending onInspect on unmount", async () => {
    const onInspect = vi.fn();
    listMock.mockResolvedValueOnce(list(THREE));
    const { unmount } = render(<Host onInspect={onInspect} />);
    await screen.findByText("AAPL");
    vi.useFakeTimers();
    fireEvent.click(screen.getByRole("rowheader", { name: "AAPL" }));
    unmount();
    advance(1000);
    expect(onInspect).not.toHaveBeenCalled();
  });

  it("scrolls a row into the window before focusing it: ten ArrowDowns from the last visible row", async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValueOnce(list(generated(3000), { matchCount: 3000 }));
    render(<Host />);
    await screen.findByText("SYM0000");
    scrollToRow(1500);
    const lastVisible = `SYM${1500 + VIEWPORT_ROWS - 1}`;
    await user.click(screen.getByRole("rowheader", { name: lastVisible }));
    expect(document.activeElement).toBe(rowOf(lastVisible));
    for (let press = 0; press < 10; press += 1) {
      await user.keyboard("{ArrowDown}");
    }
    const target = `SYM${1500 + VIEWPORT_ROWS - 1 + 10}`;
    expect(selectedSymbols()).toEqual([target]);
    expect(document.activeElement).toBe(rowOf(target));
    expect(rowOf(target).tabIndex).toBe(0);
    expect(scroller().scrollTop).toBe(
      scrollTopToReveal(
        1500 + VIEWPORT_ROWS - 1 + 10,
        scrollTopToReveal(1500 + VIEWPORT_ROWS + 8, 1500 * ROW_HEIGHT_PX),
      ),
    );
    expect(stockRows().length).toBeLessThanOrEqual(MAX_RENDERED);
  });

  it("keeps checked symbols in the host across a sort, a refresh and a scope change that replaces every row", async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValueOnce(list(THREE));
    const { rerender } = render(<Host />);
    await screen.findByText("AAPL");
    await user.click(checkboxOf("AAPL"));
    await user.click(checkboxOf("NVDA"));
    expect(hostChecked()).toBe("AAPL,NVDA");

    listMock.mockResolvedValueOnce(list([stock("NVDA"), stock("MSFT"), stock("AAPL")]));
    await user.click(sortButton(SORT.byPercentile("value")));
    await waitFor(() =>
      expect(stockRows().map((row) => row.dataset.symbol)).toEqual(["NVDA", "MSFT", "AAPL"]),
    );
    expect(hostChecked()).toBe("AAPL,NVDA");
    expect(checkboxOf("AAPL").checked).toBe(true);
    expect(checkboxOf("NVDA").checked).toBe(true);

    listMock.mockResolvedValueOnce(list(THREE));
    rerender(<Host refreshKey={1} />);
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(3));
    await waitFor(() =>
      expect(stockRows().map((row) => row.dataset.symbol)).toEqual(["AAPL", "MSFT", "NVDA"]),
    );
    expect(hostChecked()).toBe("AAPL,NVDA");

    listMock.mockResolvedValueOnce(list([stock("TSLA"), stock("AMZN")]));
    rerender(<Host refreshKey={1} query={{ ...DEFAULT_RESEARCH_QUERY, scope: "u-9" }} />);
    await screen.findByText("TSLA");
    expect(screen.queryByText("AAPL")).toBeNull();
    // Absent symbols are not unchecked by the table.
    expect(hostChecked()).toBe("AAPL,NVDA");
    expect(checkboxOf("TSLA").checked).toBe(false);
  });

  it("keeps the selected row marked by symbol across a reload that keeps it", async () => {
    const user = await renderRows();
    await user.click(screen.getByRole("rowheader", { name: "MSFT" }));
    listMock.mockResolvedValueOnce(list([stock("MSFT"), stock("AAPL")]));
    await user.click(sortButton(SORT.bySymbol));
    await waitFor(() =>
      expect(stockRows().map((row) => row.dataset.symbol)).toEqual(["MSFT", "AAPL"]),
    );
    expect(selectedSymbols()).toEqual(["MSFT"]);
    expect(rowOf("MSFT").tabIndex).toBe(0);
  });
});

// T008, the remainder: extraColumns placement (Open Gap 1, DEC-0159 as amended by E4-F02).
describe("T008: extraColumns render by placement", () => {
  const extraColumns: NonNullable<ResultsTableProps["extraColumns"]> = [
    {
      id: "memberSince",
      header: "Member since",
      align: "right",
      placement: "afterName",
      cell: (row) => `since ${row.symbol}`,
    },
    { id: "trailing", header: "Trailing", cell: (row) => `trail ${row.symbol}` },
  ];

  it("adds two headers and two cells per row, Member since after Name and Trailing last", async () => {
    listMock.mockResolvedValueOnce(list([stock("AAPL"), stock("MSFT")]));
    render(<Host extraColumns={extraColumns} />);
    await screen.findByText("AAPL");
    expect(headerCells().map(headerText)).toEqual([
      "",
      RESULTS.columns.symbol,
      RESULTS.columns.name,
      "Member since",
      FACTOR_LABELS.value,
      FACTOR_LABELS.growth,
      FACTOR_LABELS.momentum,
      "Trailing",
    ]);
    expect(headerOf("Member since")).toHaveClass("text-right");
    expect(headerOf("Trailing")).toHaveClass("text-left");
    for (const symbol of ["AAPL", "MSFT"]) {
      const cells = Array.from(rowOf(symbol).children) as HTMLElement[];
      expect(cells).toHaveLength(8);
      expect(cells[2]).toHaveTextContent(`${symbol} Incorporated`);
      expect(cells[3]).toHaveTextContent(`since ${symbol}`);
      expect(cells[3]).toHaveClass("text-right");
      expect(cells[4].querySelector("[data-testid='factor-percentile']")).not.toBeNull();
      expect(cells[7]).toHaveTextContent(`trail ${symbol}`);
    }
    // Nothing else changes: the seven sort buttons and the checkbox names stand.
    expect(screen.getAllByRole("button", { name: /^Sort by/ })).toHaveLength(7);
    expect(checkboxOf("AAPL")).toBeInTheDocument();
  });

  it("renders two entries with the same placement in array order and counts them in the no-match span", async () => {
    const two: NonNullable<ResultsTableProps["extraColumns"]> = [
      { id: "a", header: "Alpha", placement: "afterName", cell: () => "a" },
      { id: "b", header: "Beta", placement: "afterName", cell: () => "b" },
    ];
    listMock.mockResolvedValueOnce(list([stock("AAPL")]));
    const { unmount } = render(<Host extraColumns={two} />);
    await screen.findByText("AAPL");
    expect(headerCells().map(headerText).slice(2, 5)).toEqual([
      RESULTS.columns.name,
      "Alpha",
      "Beta",
    ]);
    unmount();

    listMock.mockResolvedValueOnce(list([], { matchCount: 0 }));
    render(<Host extraColumns={two} />);
    await screen.findByText(NO_MATCH_BODY);
    const cell = document.querySelector("tbody td") as HTMLTableCellElement;
    expect(cell.colSpan).toBe(8);
  });

  it("carries no aria-sort while the body shows a first-page error over kept rows", async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValueOnce(list([stock("AAPL")]));
    render(<Host />);
    await screen.findByText("AAPL");
    listMock.mockRejectedValueOnce(apiError("internal_error"));
    await user.click(sortButton(SORT.bySymbol));
    await screen.findByRole("button", { name: RESULTS.tryAgain });
    for (const header of headerCells()) {
      expect(header).not.toHaveAttribute("aria-sort");
    }
    expect(table()).not.toHaveAttribute("aria-rowcount");
    listMock.mockRejectedValueOnce(apiError("internal_error"));
    await user.click(sortButton(SORT.byPercentile("value")));
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(3));
    for (const header of headerCells()) {
      expect(header).not.toHaveAttribute("aria-sort");
    }
  });
});
