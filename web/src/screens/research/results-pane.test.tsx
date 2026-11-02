import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type JSX, useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUniverse, listClassifications } from "../../api/classification-client";
import type {
  ClassificationList,
  ClassificationSummary,
  CurrentSet,
  FactorCell,
  FactorName,
  FactorSummary,
  LaterSet,
  StockRow,
} from "../../api/classification-types";
import { DEFAULT_RESEARCH_QUERY, type ResearchQuery } from "../../api/research-query";
import { CELL, DIALOGS, FILTERS, REGIONS, RESULTS, SCORE_SET, SELECTION } from "./copy";
import { formatTimestamp } from "./format";
import { type ResearchResult, ResultsPane, type ResultsPaneProps } from "./results-pane";

vi.mock("../../api/classification-client", async () => {
  const actual = await vi.importActual<typeof import("../../api/classification-client")>(
    "../../api/classification-client",
  );
  return { ...actual, listClassifications: vi.fn(), createUniverse: vi.fn() };
});

const listMock = vi.mocked(listClassifications);
const createMock = vi.mocked(createUniverse);

// --- Fixtures (classification-api section 2.7) -----------------------------

function cell(overrides: Partial<FactorCell> = {}): FactorCell {
  return {
    status: "classified",
    score: "0.50",
    percentile: "61",
    reasonCode: null,
    reasonInput: null,
    reasonDetail: null,
    restatedPossible: false,
    ...overrides,
  };
}

function notClassified(reasonCode: FactorCell["reasonCode"]): FactorCell {
  return cell({ status: "not_classified", score: null, percentile: null, reasonCode });
}

function stock(symbol: string, factors: Partial<Record<FactorName, FactorCell>> = {}): StockRow {
  return {
    symbol,
    name: `${symbol} Incorporated`,
    lifecycle: "active",
    factors: {
      value: factors.value ?? cell(),
      growth: factors.growth ?? cell(),
      momentum: factors.momentum ?? cell(),
    },
  };
}

function generated(count: number): StockRow[] {
  return Array.from({ length: count }, (_, index) => stock(`S${String(index).padStart(4, "0")}`));
}

function factor(overrides: Partial<FactorSummary> = {}): FactorSummary {
  return { qualifiedCount: 2846, ranked: true, minPeerSetSize: 30, ...overrides };
}

const FACTORS = { value: factor(), growth: factor(), momentum: factor() };

function currentSet(setId: string, endedAt: string, runStartedAt: string): CurrentSet {
  return {
    setId,
    classificationDate: endedAt.slice(0, 10),
    runId: `run-of-${setId}`,
    runStartedAt,
    runOutcome: "succeeded",
    state: "complete",
    startedAt: runStartedAt,
    endedAt,
    latestTradingDay: endedAt.slice(0, 10),
    activeInstruments: 2846,
    notCurrent: false,
  };
}

const SET = currentSet("s-1", "2026-10-15T22:46:00Z", "2026-10-15T22:30:00Z");
const OTHER_SET = currentSet("s-2", "2026-10-16T22:48:00Z", "2026-10-16T22:30:00Z");

const BUILDING: LaterSet = {
  setId: "s-2",
  state: "building",
  startedAt: "2026-10-16T22:40:00Z",
  endedAt: null,
  failureReason: null,
  runId: "run-of-s-2",
  runStartedAt: "2026-10-16T22:30:00Z",
};

const FAILED: LaterSet = {
  ...BUILDING,
  state: "failed",
  endedAt: "2026-10-16T23:03:00Z",
  failureReason: "Factor engine could not read prices",
};

function list(
  stocks: StockRow[],
  overrides: Partial<Omit<ClassificationList, "stocks">> = {},
): ClassificationList {
  return {
    neverClassified: false,
    set: SET,
    later: null,
    factors: FACTORS,
    matchCount: stocks.length,
    stocks,
    unknownSymbols: [],
    nextCursor: null,
    ...overrides,
  };
}

function neverPopulated(later: LaterSet | null = null): ClassificationList {
  return list([], { neverClassified: true, set: null, later, matchCount: 0 });
}

function summary(set: CurrentSet | null, later: LaterSet | null): ClassificationSummary {
  return {
    neverClassified: set === null,
    set,
    later,
    factors: FACTORS,
    stocksCurrent: null,
  };
}

/**
 * Answers each first-page read with the next of `firstPages` (the last one
 * repeats) and any later-page read with no further rows, as the API does at
 * the end of a result.
 */
function respond(...firstPages: ClassificationList[]): void {
  const queue = [...firstPages];
  let last = queue[0] as ClassificationList;
  listMock.mockImplementation(async (params) => {
    if (params?.cursor !== undefined) {
      return { ...last, stocks: [], nextCursor: null };
    }
    last = (queue.length > 1 ? queue.shift() : queue[0]) as ClassificationList;
    return last;
  });
}

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((onResolve) => {
    resolve = onResolve;
  });
  return { promise, resolve };
}

const THRESHOLD_QUERY: ResearchQuery = {
  ...DEFAULT_RESEARCH_QUERY,
  sentences: { value: { measure: "percentile", direction: "atLeast", value: "80" } },
};

type HostProps = Partial<Omit<ResultsPaneProps, "result" | "onResult">> & {
  /** Overrides the result the table reports, to drive a source independently of the list. */
  resultOverride?: ResearchResult | null;
};

/** The screen's role in miniature: it holds the first-page result the table reports. */
function Host({ resultOverride, ...overrides }: HostProps): JSX.Element {
  const [result, setResult] = useState<ResearchResult | null>(null);
  const props: ResultsPaneProps = {
    query: DEFAULT_RESEARCH_QUERY,
    onQueryChange: () => undefined,
    onClear: () => undefined,
    refreshKey: 0,
    result: resultOverride === undefined ? result : resultOverride,
    onResult: setResult,
    summary: null,
    checkedAt: null,
    pollFailed: false,
    onTryAgain: () => undefined,
    announcement: null,
    selected: null,
    onSelect: () => undefined,
    checked: [],
    onCheckedChange: () => undefined,
    onAddToUniverse: () => undefined,
    onOpenEarlierSets: () => undefined,
    onNotify: () => undefined,
    ...overrides,
  };
  return <ResultsPane {...props} />;
}

function renderPane(props: HostProps = {}): { rerender: (next: HostProps) => void } {
  const view = render(
    <MemoryRouter>
      <Host {...props} />
    </MemoryRouter>,
  );
  return {
    rerender: (next) =>
      view.rerender(
        <MemoryRouter>
          <Host {...next} />
        </MemoryRouter>,
      ),
  };
}

function resultsSection(): HTMLElement {
  return screen.getByRole("region", { name: REGIONS.results });
}

function follows(earlier: Element, later: Element): boolean {
  return Boolean(earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING);
}

async function settled(): Promise<void> {
  await waitFor(() => expect(listMock).toHaveBeenCalled());
  await act(async () => {
    await Promise.resolve();
  });
}

const SOURCE = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "results-pane.tsx"),
  "utf-8",
);

beforeEach(() => {
  listMock.mockReset();
  createMock.mockReset();
});

// Implements TC-COMP-144 (T002): DAC-E4-S9-2, DAC-E4-3, AC-16.
describe("TC-COMP-144: the heading shows the server's matchCount", () => {
  it("reads 3000 with 50 rows loaded, then 12 for a changed query, never the row count", async () => {
    respond(
      list(generated(50), { matchCount: 3000, nextCursor: "c1" }),
      list(generated(3), { matchCount: 12, nextCursor: "c2" }),
    );
    const view = renderPane();

    const heading = await screen.findByRole("heading", {
      level: 1,
      name: RESULTS.stocksMatch(3000),
    });
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(heading.textContent).not.toContain("50");
    expect(screen.getAllByRole("row").length).toBeLessThan(3000);

    view.rerender({ query: { ...DEFAULT_RESEARCH_QUERY, symbol: "S" } });
    await screen.findByRole("heading", { level: 1, name: RESULTS.stocksMatch(12) });
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("reads the zero sentence for a populated store with no match", async () => {
    listMock.mockResolvedValueOnce(list([], { matchCount: 0 }));
    renderPane({ query: THRESHOLD_QUERY });
    await screen.findByRole("heading", { level: 1, name: RESULTS.stocksMatch(0) });
  });

  it("reads the screen title while loading and in the never-populated state", async () => {
    const first = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(first.promise);
    renderPane();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(RESULTS.screenTitle);
    expect(RESULTS.screenTitle).toBe("Research");

    await act(async () => {
      first.resolve(neverPopulated());
    });
    expect(screen.getByText(RESULTS.neverScored)).toBeInTheDocument();
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(RESULTS.screenTitle);
    expect(heading.textContent).not.toContain(RESULTS.stocksMatch(0));
  });
});

// Implements TC-COMP-099 (T005): DAC-E4-S9-5, AC-12.
describe("TC-COMP-099: the absence-judges-presence footnote appears once", () => {
  it("renders once in the Results section, after the table and before the tray", async () => {
    respond(list(generated(5), { matchCount: 3000, nextCursor: "c1" }));
    renderPane({ checked: ["S0000", "S0001"] });
    await screen.findByRole("heading", { level: 1, name: RESULTS.stocksMatch(3000) });

    const notes = screen.getAllByText(CELL.coverageStatement);
    expect(notes).toHaveLength(1);
    const note = notes[0] as HTMLElement;
    expect(note).toHaveClass("text-xs", "text-muted-foreground");
    expect(resultsSection().contains(note)).toBe(true);
    expect(follows(screen.getByRole("table"), note)).toBe(true);
    const tray = screen.getByRole("region", { name: REGIONS.selection });
    expect(follows(note, tray)).toBe(true);
  });

  it("renders for a single match", async () => {
    respond(list(generated(1)));
    renderPane();
    await screen.findByRole("heading", { level: 1, name: RESULTS.stocksMatch(1) });
    expect(screen.getAllByText(CELL.coverageStatement)).toHaveLength(1);
  });

  it("stays one after a sort and after a refresh", async () => {
    listMock.mockResolvedValue(list(generated(5)));
    const view = renderPane();
    await screen.findByText(CELL.coverageStatement);

    const sorted: ResearchQuery = {
      ...DEFAULT_RESEARCH_QUERY,
      sort: { key: "value_percentile", order: "desc" },
    };
    view.rerender({ query: sorted });
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
    expect(screen.getAllByText(CELL.coverageStatement)).toHaveLength(1);

    view.rerender({ query: sorted, refreshKey: 1 });
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(3));
    expect(screen.getAllByText(CELL.coverageStatement)).toHaveLength(1);
  });

  it("is absent in the never-populated and nothing-found states", async () => {
    listMock.mockResolvedValueOnce(neverPopulated());
    const view = renderPane();
    await screen.findByText(RESULTS.neverScored);
    expect(screen.queryByText(CELL.coverageStatement)).toBeNull();

    listMock.mockResolvedValueOnce(list([], { matchCount: 0 }));
    view.rerender({ query: THRESHOLD_QUERY });
    await screen.findByText(RESULTS.noMatch);
    expect(screen.queryByText(CELL.coverageStatement)).toBeNull();
  });
});

// T006: AC-11, AC-14, AC-20, AC-21, DAC-E4-4, DAC-E4-S9-1; DEC-0170, DEC-0274.
describe("Results pane states and props", () => {
  it("(a) orders banner, heading, as-of line, Save, table, footnote, then the tray", async () => {
    listMock.mockResolvedValue(list(generated(5), { later: BUILDING }));
    renderPane({ summary: summary(SET, BUILDING), checked: ["S0000"] });
    const heading = await screen.findByRole("heading", {
      level: 1,
      name: RESULTS.stocksMatch(5),
    });

    const section = resultsSection();
    expect(section.tagName).toBe("SECTION");
    const banner = within(section).getByTestId("not-current-banner");
    const line = within(section).getByTestId("as-of-line");
    const save = within(section).getByRole("button", { name: RESULTS.saveThese(5) });
    const table = within(section).getByRole("table");
    const note = within(section).getByText(CELL.coverageStatement);
    const tray = within(section).getByRole("region", { name: REGIONS.selection });
    const order = [banner, heading, line, save, table, note, tray];
    order.slice(1).forEach((element, index) => {
      expect(follows(order[index] as Element, element)).toBe(true);
    });
    expect(tray).toHaveClass("bg-foreground", "text-background");
    expect(heading).toHaveClass("text-lg");
    // The banner is a full-width card above the header, not inside it (UX design 1.2).
    expect(banner.parentElement).toBe(section);
    expect(heading.parentElement?.contains(banner)).toBe(false);
  });

  it("(a) ends the as-of line with Earlier sets…, which asks the host to open the dialog", async () => {
    const user = userEvent.setup();
    const onOpenEarlierSets = vi.fn();
    respond(list(generated(3)));
    renderPane({ onOpenEarlierSets });
    const line = await screen.findByTestId("as-of-line");
    await user.click(within(line).getByRole("button", { name: SCORE_SET.earlierSetsAction }));
    expect(onOpenEarlierSets).toHaveBeenCalledTimes(1);
  });

  it("(b) keeps the current rows under a building set's warning banner and Updating mark", async () => {
    listMock.mockResolvedValue(list(generated(5), { later: BUILDING }));
    renderPane({
      summary: summary(SET, BUILDING),
      checkedAt: "2026-10-16T22:52:10Z",
    });
    await screen.findByRole("heading", { level: 1, name: RESULTS.stocksMatch(5) });

    const banner = screen.getByTestId("not-current-banner");
    expect(within(banner).getByText(SCORE_SET.notReflecting)).toHaveAttribute(
      "data-variant",
      "status-warning",
    );
    expect(follows(banner, screen.getByRole("heading", { level: 1 }))).toBe(true);
    const line = screen.getByTestId("as-of-line");
    expect(within(line).getByText(SCORE_SET.updating)).toBeInTheDocument();
    expect(line).toHaveTextContent(
      SCORE_SET.checked(formatTimestamp("2026-10-16T22:52:10Z", { seconds: true })),
    );
    expect(screen.getByRole("rowheader", { name: /S0000/ })).toBeInTheDocument();
  });

  it("(b) shows a failed attempt's recorded reason over the kept rows, offering no retry", async () => {
    listMock.mockResolvedValue(list(generated(5), { later: FAILED }));
    renderPane({ summary: summary(SET, FAILED) });
    await screen.findByRole("heading", { level: 1, name: RESULTS.stocksMatch(5) });

    const banner = screen.getByTestId("not-current-banner");
    expect(within(banner).getByText(SCORE_SET.scoreUpdateFailed)).toHaveAttribute(
      "data-variant",
      "status-critical",
    );
    expect(banner).toHaveTextContent("Factor engine could not read prices");
    expect(screen.getByRole("rowheader", { name: /S0000/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /retry|try again/i })).toBeNull();
    expect(within(banner).queryByRole("button")).toBeNull();
    expect(within(banner).queryByRole("link")).toBeNull();
  });

  it("(c) names the list's set on the as-of line, whatever set the summary reports", async () => {
    listMock.mockResolvedValue(list(generated(5)));
    renderPane({ summary: summary(OTHER_SET, null) });
    await screen.findByRole("heading", { level: 1, name: RESULTS.stocksMatch(5) });

    const line = screen.getByTestId("as-of-line");
    expect(line).toHaveTextContent(formatTimestamp(SET.endedAt));
    expect(line).not.toHaveTextContent(formatTimestamp(OTHER_SET.endedAt));
    expect(screen.queryByTestId("not-current-banner")).toBeNull();
  });

  it("(c) reads the banner's later from the summary, and from the list only while no summary exists", async () => {
    listMock.mockResolvedValue(list(generated(5), { later: BUILDING }));
    const view = renderPane({ summary: null });
    await screen.findByRole("heading", { level: 1, name: RESULTS.stocksMatch(5) });
    // First summary poll pending: the list result's `later` governs.
    expect(screen.getByTestId("not-current-banner")).toHaveTextContent(SCORE_SET.notReflecting);
    expect(within(screen.getByTestId("as-of-line")).getByText(SCORE_SET.updating)).toBeVisible();

    // A summary reporting no later set clears the banner and Updating at once.
    view.rerender({ summary: summary(SET, null) });
    expect(screen.queryByTestId("not-current-banner")).toBeNull();
    expect(within(screen.getByTestId("as-of-line")).queryByText(SCORE_SET.updating)).toBeNull();

    // A summary's later shows even when the list's does not carry one.
    listMock.mockResolvedValue(list(generated(5)));
    view.rerender({ summary: summary(SET, FAILED), refreshKey: 1 });
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
    expect(screen.getByTestId("not-current-banner")).toHaveTextContent(SCORE_SET.scoreUpdateFailed);
  });

  it("(c) renders the line's final-height skeleton while neither read has arrived", async () => {
    listMock.mockReturnValueOnce(deferred<ClassificationList>().promise);
    renderPane();
    expect(screen.getByTestId("as-of-line-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("as-of-line")).toBeNull();
  });

  it("(c) keeps the skeleton until the first page arrives, unless nothing has been scored (DEC-0276)", async () => {
    const first = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(first.promise);
    const view = renderPane({ summary: summary(OTHER_SET, null) });
    expect(screen.getByTestId("as-of-line-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("as-of-line")).toBeNull();

    view.rerender({ summary: summary(null, BUILDING) });
    expect(screen.queryByTestId("as-of-line-skeleton")).toBeNull();
    expect(screen.queryByTestId("as-of-line")).toBeNull();

    view.rerender({ summary: summary(OTHER_SET, null) });
    await act(async () => {
      first.resolve(list(generated(3)));
    });
    expect(screen.queryByTestId("as-of-line-skeleton")).toBeNull();
    expect(screen.getByTestId("as-of-line")).toHaveTextContent(formatTimestamp(SET.endedAt));
  });

  it("(c) saves with the list's set id, never the summary's", async () => {
    const user = userEvent.setup();
    respond(list(generated(5), { matchCount: 120, nextCursor: "c1" }));
    createMock.mockResolvedValue({ universeId: "u-9", name: "Tech", memberCount: 120 } as Awaited<
      ReturnType<typeof createUniverse>
    >);
    const onNotify = vi.fn();
    renderPane({ summary: summary(OTHER_SET, null), onNotify });

    await user.click(await screen.findByRole("button", { name: RESULTS.saveThese(120) }));
    await user.type(screen.getByRole("textbox", { name: DIALOGS.name }), "Tech");
    await user.click(screen.getByRole("button", { name: DIALOGS.save }));
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith(expect.objectContaining({ setId: SET.setId }));
    // The pane hands Save the screen's onNotify: the one notice region reports it.
    await waitFor(() => expect(onNotify).toHaveBeenCalledTimes(1));
    expect(onNotify).toHaveBeenCalledWith(
      expect.objectContaining({ message: DIALOGS.saved(120, "Tech") }),
    );
  });

  it("(d) offers Save for the server's count, and nothing under a scope or before any set", async () => {
    respond(
      list(generated(5), { matchCount: 120, nextCursor: "c1" }),
      list(generated(5), { matchCount: 7 }),
      neverPopulated(),
    );
    const view = renderPane();
    await screen.findByRole("button", { name: RESULTS.saveThese(120) });

    view.rerender({ query: { ...DEFAULT_RESEARCH_QUERY, scope: "u1" } });
    await screen.findByRole("heading", { level: 1, name: RESULTS.stocksMatch(7) });
    expect(screen.queryByRole("button", { name: /^Save these/ })).toBeNull();

    view.rerender({ query: { ...DEFAULT_RESEARCH_QUERY, symbol: "Z" } });
    await screen.findByText(RESULTS.neverScored);
    expect(screen.queryByRole("button", { name: /^Save these/ })).toBeNull();
  });

  it("(d) states the incomplete count only when the first page is the whole result (DEC-0274)", async () => {
    const user = userEvent.setup();
    const incomplete = (symbol: string, code: FactorCell["reasonCode"]): StockRow =>
      stock(symbol, { growth: notClassified(code) });
    const rows = [
      incomplete("AAA", "input_missing"),
      incomplete("BBB", "input_outdated"),
      incomplete("CCC", "input_not_computable"),
      incomplete("DDD", "not_enough_stocks"),
      stock("EEE"),
    ];
    respond(
      list(rows),
      list(rows, { matchCount: 61 }),
      list(rows, { matchCount: 60, nextCursor: "c1" }),
    );
    const view = renderPane();
    await user.click(await screen.findByRole("button", { name: RESULTS.saveThese(5) }));
    expect(screen.getByRole("dialog")).toHaveTextContent(DIALOGS.includingIncomplete(5, 3));
    await user.click(screen.getByRole("button", { name: DIALOGS.cancel }));

    // More matches than the page holds, with no cursor: still omitted rather than guessed.
    view.rerender({ query: { ...DEFAULT_RESEARCH_QUERY, symbol: "Q" } });
    await user.click(await screen.findByRole("button", { name: RESULTS.saveThese(61) }));
    expect(screen.getByRole("dialog").textContent).not.toMatch(/including/);
    await user.click(screen.getByRole("button", { name: DIALOGS.cancel }));

    // More pages remain: the clause is omitted rather than guessed.
    view.rerender({ query: THRESHOLD_QUERY });
    await user.click(await screen.findByRole("button", { name: RESULTS.saveThese(60) }));
    expect(screen.getByRole("dialog").textContent).not.toMatch(/including/);
  });

  it("(e) renders the nothing-found body with Clear filters, focusing the heading after it", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    listMock.mockResolvedValue(list([], { matchCount: 0 }));
    renderPane({ query: THRESHOLD_QUERY, onClear });

    const body = await screen.findByText(RESULTS.noMatch);
    expect(screen.queryByText(RESULTS.neverScored)).toBeNull();
    const clear = screen.getByRole("button", { name: FILTERS.clearFilters });
    expect(clear).toHaveAttribute("data-variant", "ghost");
    expect(body.parentElement?.contains(clear)).toBe(true);
    await user.click(clear);
    expect(onClear).toHaveBeenCalledTimes(1);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveAttribute("tabindex", "-1");
    expect(document.activeElement).toBe(heading);
  });

  it("(e) treats zero matches under the default query as nothing found", async () => {
    listMock.mockResolvedValue(list([], { matchCount: 0 }));
    renderPane();
    await screen.findByText(RESULTS.noMatch);
    expect(screen.getByRole("button", { name: FILTERS.clearFilters })).toBeInTheDocument();
    expect(screen.queryByText(RESULTS.neverScored)).toBeNull();
  });

  it("(e) keeps the never-populated body apart from the nothing-found one", async () => {
    listMock.mockResolvedValue(neverPopulated());
    renderPane();
    await screen.findByText(RESULTS.neverScored);
    expect(screen.queryByText(RESULTS.noMatch)).toBeNull();
    expect(screen.queryByRole("button", { name: FILTERS.clearFilters })).toBeNull();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByTestId("as-of-line")).toBeNull();
  });

  it("(f) writes each body's sentence in one place only", () => {
    expect(SOURCE.split("RESULTS.noMatch").length - 1).toBe(1);
    expect(SOURCE.split("RESULTS.neverScored").length - 1).toBe(1);
    expect(SOURCE).not.toContain(RESULTS.noMatch);
    expect(SOURCE).not.toContain(RESULTS.neverScored);
  });

  it("(g) holds no markup injection, browser storage or date formatting of its own", () => {
    expect(SOURCE).not.toContain("dangerouslySetInnerHTML");
    expect(SOURCE).not.toMatch(/localStorage|sessionStorage/);
    expect(SOURCE).not.toMatch(/new Date|Intl\.|toLocale/);
    expect(SOURCE).not.toMatch(/\bfetch\(/);
  });

  it("(h) always names the sort on the as-of line, by symbol or the factor, without a direction", async () => {
    const cases: [ResearchQuery["sort"], string][] = [
      [null, SCORE_SET.sortLabels.symbol],
      [{ key: "symbol", order: "desc" }, SCORE_SET.sortLabels.symbol],
      [{ key: "value_percentile", order: "asc" }, SCORE_SET.sortLabels.value],
      [{ key: "value_score", order: "desc" }, SCORE_SET.sortLabels.value],
      [{ key: "growth_percentile", order: "desc" }, SCORE_SET.sortLabels.growth],
      [{ key: "momentum_score", order: "asc" }, SCORE_SET.sortLabels.momentum],
    ];
    expect(SCORE_SET.sortLabels).toEqual({
      symbol: "symbol",
      value: "value",
      growth: "growth",
      momentum: "momentum",
    });
    listMock.mockResolvedValue(list(generated(3)));
    const view = renderPane();
    for (const [sort, label] of cases) {
      view.rerender({ query: { ...DEFAULT_RESEARCH_QUERY, sort } });
      await settled();
      const line = await screen.findByTestId("as-of-line");
      await waitFor(() => expect(line).toHaveTextContent(SCORE_SET.sortedBy(label)));
      // The clause is the label alone: no measure and no direction follow it.
      const clause = line.textContent?.match(/sorted by (.+?) Earlier sets…/)?.[1];
      expect(clause).toBe(label);
    }
  });

  it("passes the checked rows to the tray and its Add action to the host", async () => {
    const user = userEvent.setup();
    const onAddToUniverse = vi.fn();
    listMock.mockResolvedValue(list(generated(3)));
    renderPane({ checked: ["S0001", "S0000"], onAddToUniverse });
    const tray = await screen.findByRole("region", { name: REGIONS.selection });
    expect(tray).toHaveTextContent(SELECTION.selected(2));
    await user.click(within(tray).getByRole("button", { name: SELECTION.addToUniverse }));
    expect(onAddToUniverse).toHaveBeenCalledWith(["S0001", "S0000"]);
  });
});
