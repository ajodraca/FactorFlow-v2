import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type JSX, useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listClassifications } from "../../api/classification-client";
import type {
  ClassificationList,
  ClassificationSummary,
  CurrentSet,
  FactorCell,
  FactorSummary,
  LaterSet,
  StockRow,
} from "../../api/classification-types";
import { fetchHealth, listAcquisitionRuns } from "../../api/client";
import { DEFAULT_RESEARCH_QUERY, type ResearchQuery } from "../../api/research-query";
import type { AcquisitionRun, HealthResponse, RunState } from "../../api/types";
import { HealthProvider } from "../../app/status-region";
import { CELL, REGIONS, RESULTS, SCORE_SET, SHELL_ROUTES } from "./copy";
import { formatTimestamp } from "./format";
import { ResultsPane, type ResultsPaneProps } from "./results-pane";

vi.mock("../../api/classification-client", async () => {
  const actual = await vi.importActual<typeof import("../../api/classification-client")>(
    "../../api/classification-client",
  );
  return { ...actual, listClassifications: vi.fn(), createUniverse: vi.fn() };
});

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return { ...actual, listAcquisitionRuns: vi.fn(), fetchHealth: vi.fn() };
});

const listMock = vi.mocked(listClassifications);
const runsMock = vi.mocked(listAcquisitionRuns);
const healthMock = vi.mocked(fetchHealth);

// --- Fixtures (classification-api section 2.7) --------------------------------

function cell(percentile: string): FactorCell {
  return {
    status: "classified",
    score: "0.50",
    percentile,
    reasonCode: null,
    reasonInput: null,
    reasonDetail: null,
    restatedPossible: false,
  };
}

function stock(symbol: string): StockRow {
  return {
    symbol,
    name: `${symbol} Incorporated`,
    lifecycle: "active",
    factors: { value: cell("84"), growth: cell("61"), momentum: cell("27") },
  };
}

function rows(count: number): StockRow[] {
  return Array.from({ length: count }, (_, index) => stock(`SYM${String(index).padStart(4, "0")}`));
}

function factorSummary(): FactorSummary {
  return { qualifiedCount: 2846, ranked: true, minPeerSetSize: 30 };
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

const BUILDING: LaterSet = {
  setId: "set-2",
  state: "building",
  startedAt: "2026-10-16T22:40:00Z",
  endedAt: null,
  failureReason: null,
  runId: "run-2",
  runStartedAt: "2026-10-16T22:30:00Z",
};

const FAILED: LaterSet = {
  ...BUILDING,
  state: "failed",
  endedAt: "2026-10-16T22:41:00Z",
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
    factors: { value: factorSummary(), growth: factorSummary(), momentum: factorSummary() },
    matchCount: stocks.length,
    stocks,
    unknownSymbols: [],
    nextCursor: null,
    ...overrides,
  };
}

function summaryOf(set: CurrentSet | null, later: LaterSet | null): ClassificationSummary {
  return {
    neverClassified: set === null,
    set,
    later,
    factors: { value: factorSummary(), growth: factorSummary(), momentum: factorSummary() },
    stocksCurrent: null,
  };
}

function health(run: { run_id: string; state: RunState } | null): HealthResponse {
  return {
    status: "ok",
    database: "reachable",
    credential_present: true,
    schema_version: 1,
    most_recent_run: run === null ? null : { ...run, ended_at: null },
  };
}

function run(state: RunState, overrides: Partial<AcquisitionRun> = {}): AcquisitionRun {
  return {
    runId: "r1",
    state,
    historyDepthYears: 5,
    requestedAt: "2026-10-15T22:29:00Z",
    startedAt: "2026-10-15T22:30:00Z",
    endedAt: null,
    instrumentsNamed: 10,
    instrumentsWritten: 10,
    instrumentsFailed: 0,
    failureReason: null,
    ...overrides,
  };
}

const NEVER = list([], { neverClassified: true, set: null, matchCount: 0, later: BUILDING });

// --- Harness ------------------------------------------------------------------

type PaneOverrides = Partial<ResultsPaneProps> & { initialChecked?: string[] };

function Harness({ initialChecked = [], ...overrides }: PaneOverrides): JSX.Element {
  const [result, setResult] = useState<ResultsPaneProps["result"]>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState<string[]>(initialChecked);
  const props: ResultsPaneProps = {
    query: DEFAULT_RESEARCH_QUERY,
    onQueryChange: () => undefined,
    onClear: () => undefined,
    refreshKey: 0,
    result,
    onResult: (page) => setResult(page),
    summary: null,
    checkedAt: null,
    pollFailed: false,
    onTryAgain: () => undefined,
    announcement: null,
    selected,
    onSelect: setSelected,
    checked,
    onCheckedChange: setChecked,
    onAddToUniverse: () => undefined,
    onOpenEarlierSets: () => undefined,
    onNotify: () => undefined,
    ...overrides,
  };
  return <ResultsPane {...props} />;
}

function renderPane(overrides: PaneOverrides = {}): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <Harness {...overrides} />
    </MemoryRouter>,
  );
}

const h1 = (): HTMLElement => screen.getByRole("heading", { level: 1 });
const resultsSection = (): HTMLElement => screen.getByRole("region", { name: REGIONS.results });
const footnotes = (): HTMLElement[] => screen.queryAllByText(CELL.coverageStatement);

beforeEach(() => {
  listMock.mockReset();
  runsMock.mockReset();
  runsMock.mockResolvedValue({ runs: [], nextCursor: null });
  healthMock.mockReset();
  healthMock.mockResolvedValue(health(null));
});

afterEach(() => {
  vi.useRealTimers();
});

// Implements TC-COMP-144 (T002): DAC-E4-3, DAC-E4-S9-2.
describe("TC-COMP-144: the heading shows the server's matchCount", () => {
  it("reads 3000 for a first page of 50 rows with more to come", async () => {
    listMock.mockResolvedValue(list(rows(50), { matchCount: 3000, nextCursor: "c1" }));
    renderPane();
    await waitFor(() => expect(h1()).toHaveTextContent(RESULTS.stocksMatch(3000)));
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(h1().textContent).not.toContain("50 stocks");
  });

  it("follows the count for a changed query, a short page and a zero count", async () => {
    listMock.mockResolvedValue(list(rows(3), { matchCount: 12, nextCursor: "c1" }));
    const view = renderPane();
    await waitFor(() => expect(h1()).toHaveTextContent(RESULTS.stocksMatch(12)));

    listMock.mockResolvedValue(list(rows(3), { matchCount: 7 }));
    const changed: ResearchQuery = { ...DEFAULT_RESEARCH_QUERY, hideIncomplete: true };
    view.rerender(
      <MemoryRouter>
        <Harness query={changed} />
      </MemoryRouter>,
    );
    await waitFor(() => expect(h1()).toHaveTextContent(RESULTS.stocksMatch(7)));

    listMock.mockResolvedValue(list([], { matchCount: 0 }));
    const empty: ResearchQuery = { ...DEFAULT_RESEARCH_QUERY, symbol: "ZZ" };
    view.rerender(
      <MemoryRouter>
        <Harness query={empty} />
      </MemoryRouter>,
    );
    await waitFor(() => expect(h1()).toHaveTextContent(RESULTS.stocksMatch(0)));
  });

  it("reads the screen title before any result exists", () => {
    listMock.mockReturnValue(new Promise(() => undefined));
    renderPane();
    expect(h1()).toHaveTextContent(RESULTS.title);
    expect(h1().textContent).not.toMatch(/stocks match/);
  });

  it("reads the screen title for a never-populated result", async () => {
    listMock.mockResolvedValue(list([], { neverClassified: true, set: null, matchCount: 0 }));
    renderPane();
    await waitFor(() => expect(listMock).toHaveBeenCalled());
    await act(async () => undefined);
    expect(h1()).toHaveTextContent(RESULTS.title);
    expect(h1().textContent).not.toMatch(/stocks match/);
  });
});

// Implements TC-COMP-099 (T005): DAC-E4-S9-5, AC-12.
describe("TC-COMP-099: the absence-judges-presence footnote appears once", () => {
  it("is one element after the table and before the tray, in the Results section", async () => {
    listMock.mockResolvedValue(list(rows(5)));
    renderPane({ initialChecked: ["SYM0000", "SYM0001"] });
    await screen.findByRole("table");
    expect(footnotes()).toHaveLength(1);
    const footnote = footnotes()[0] as HTMLElement;
    expect(footnote).toHaveClass("text-xs", "text-muted-foreground");
    expect(resultsSection()).toContainElement(footnote);
    const table = within(resultsSection()).getByRole("table");
    const tray = within(resultsSection()).getByRole("region", { name: REGIONS.selection });
    expect(table.compareDocumentPosition(footnote) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(footnote.compareDocumentPosition(tray) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("stays one after a sort, a 3000-row count and a refresh", async () => {
    listMock.mockResolvedValue(list(rows(50), { matchCount: 3000, nextCursor: "c1" }));
    const view = renderPane();
    await screen.findByRole("table");
    expect(footnotes()).toHaveLength(1);
    const sorted: ResearchQuery = {
      ...DEFAULT_RESEARCH_QUERY,
      sort: { key: "growth_percentile", order: "desc" },
    };
    view.rerender(
      <MemoryRouter>
        <Harness query={sorted} refreshKey={1} />
      </MemoryRouter>,
    );
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
    expect(footnotes()).toHaveLength(1);
  });

  it("is present for a single match", async () => {
    listMock.mockResolvedValue(list(rows(1)));
    renderPane();
    await screen.findByRole("table");
    expect(footnotes()).toHaveLength(1);
  });

  it("is absent when nothing is found", async () => {
    listMock.mockResolvedValue(list([], { matchCount: 0 }));
    renderPane();
    await screen.findByText(RESULTS.noMatch);
    expect(footnotes()).toHaveLength(0);
  });
});

// T006: AC-11, AC-14, AC-20, AC-21, DAC-E4-4, DAC-E4-S9-1; Open Gap 1.
describe("results pane states and props", () => {
  it("(a) orders banner, header, table, footnote and tray inside the Results section", async () => {
    listMock.mockResolvedValue(list(rows(3), { later: BUILDING }));
    renderPane({ summary: summaryOf(SET, BUILDING), checkedAt: "2026-10-16T22:45:10Z" });
    await screen.findByRole("table");
    const section = resultsSection();
    const banner = within(section).getByTestId("not-current-banner");
    const heading = within(section).getByRole("heading", { level: 1 });
    const asOf = within(section).getByTestId("as-of-line");
    const table = within(section).getByRole("table");
    const footnote = within(section).getByText(CELL.coverageStatement);
    const follows = (a: Element, b: Element): boolean =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(follows(banner, heading)).toBe(true);
    expect(follows(heading, asOf)).toBe(true);
    expect(follows(asOf, table)).toBe(true);
    expect(follows(table, footnote)).toBe(true);
  });

  it("(a) pins the tray after the footnote on the foreground fill", async () => {
    listMock.mockResolvedValue(list(rows(3)));
    renderPane({ initialChecked: ["SYM0000"] });
    await screen.findByRole("table");
    const tray = within(resultsSection()).getByRole("region", { name: REGIONS.selection });
    expect(tray).toHaveClass("bg-foreground", "text-background");
    const footnote = within(resultsSection()).getByText(CELL.coverageStatement);
    expect(Boolean(footnote.compareDocumentPosition(tray) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(
      true,
    );
  });

  it("(b) a building set shows the warning banner and Updating over the kept rows", async () => {
    listMock.mockResolvedValue(list(rows(3), { later: BUILDING }));
    renderPane({ summary: summaryOf(SET, BUILDING), checkedAt: "2026-10-16T22:45:10Z" });
    await screen.findByRole("table");
    const banner = screen.getByTestId("not-current-banner");
    expect(within(banner).getByText(SCORE_SET.notReflecting)).toHaveAttribute(
      "data-variant",
      "status-warning",
    );
    expect(screen.getByText(SCORE_SET.updating)).toBeInTheDocument();
    expect(screen.getByText(/^checked /)).toBeInTheDocument();
    expect(document.querySelectorAll("tbody tr[data-symbol]").length).toBe(3);
    expect(h1()).toBeInTheDocument();
    expect(banner.compareDocumentPosition(h1()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("(b) a failed set shows the recorded reason and offers no retry", async () => {
    listMock.mockResolvedValue(list(rows(3), { later: FAILED }));
    renderPane({ summary: summaryOf(SET, FAILED) });
    await screen.findByRole("table");
    const banner = screen.getByTestId("not-current-banner");
    expect(within(banner).getByText(SCORE_SET.scoreUpdateFailed)).toHaveAttribute(
      "data-variant",
      "status-critical",
    );
    expect(banner).toHaveTextContent("Factor engine could not read prices");
    expect(screen.queryByRole("button", { name: /retry|try again/i })).toBeNull();
    expect(document.querySelectorAll("tbody tr[data-symbol]").length).toBe(3);
  });

  it("(c) the line's set is the list result's, the banner's later is the summary's", async () => {
    const otherSet: CurrentSet = { ...SET, setId: "set-9", endedAt: "2026-10-14T22:46:00Z" };
    listMock.mockResolvedValue(list(rows(3)));
    renderPane({ summary: summaryOf(otherSet, BUILDING) });
    await screen.findByRole("table");
    const line = screen.getByTestId("as-of-line");
    expect(line).toHaveTextContent("2026-10-15 17:46 CDT");
    expect(line).not.toHaveTextContent("2026-10-14");
    expect(screen.getByTestId("not-current-banner")).toBeInTheDocument();
  });

  it("(c) before the first summary poll the list result's later drives the banner", async () => {
    listMock.mockResolvedValue(list(rows(3), { later: BUILDING }));
    renderPane({ summary: null });
    await screen.findByRole("table");
    expect(screen.getByTestId("not-current-banner")).toBeInTheDocument();
    expect(screen.getByText(SCORE_SET.updating)).toBeInTheDocument();
  });

  it("(c) a summary whose later is null clears the banner and Updating at once", async () => {
    listMock.mockResolvedValue(list(rows(3), { later: BUILDING }));
    renderPane({ summary: summaryOf(SET, null) });
    await screen.findByRole("table");
    expect(screen.queryByTestId("not-current-banner")).toBeNull();
    expect(screen.queryByText(SCORE_SET.updating)).toBeNull();
  });

  it("(c) a pending result with a summary in hand shows no skeleton", () => {
    listMock.mockReturnValue(new Promise(() => undefined));
    renderPane({ summary: summaryOf(SET, null) });
    expect(screen.queryByTestId("as-of-line-skeleton")).toBeNull();
    expect(screen.queryByTestId("as-of-line")).toBeNull();
  });

  it("(c) a never-populated result renders no as-of line and no skeleton", async () => {
    listMock.mockResolvedValue(list([], { neverClassified: true, set: null, matchCount: 0 }));
    renderPane({ summary: summaryOf(null, null) });
    await waitFor(() => expect(listMock).toHaveBeenCalled());
    await act(async () => undefined);
    expect(screen.queryByTestId("as-of-line")).toBeNull();
    expect(screen.queryByTestId("as-of-line-skeleton")).toBeNull();
    expect(screen.queryByRole("button", { name: SCORE_SET.earlierSetsAction })).toBeNull();
  });

  it("(c) hands the checked time, the announcement and the Earlier sets handler to the line", async () => {
    const user = userEvent.setup();
    const onOpenEarlierSets = vi.fn();
    listMock.mockResolvedValue(list(rows(3), { later: BUILDING }));
    renderPane({
      summary: summaryOf(SET, BUILDING),
      checkedAt: "2026-10-16T22:45:10Z",
      announcement: "Scores updated to somewhere",
      onOpenEarlierSets,
    });
    await screen.findByRole("table");
    expect(screen.getByText("Scores updated to somewhere")).toBeInTheDocument();
    expect(screen.getByText(SCORE_SET.checked("2026-10-16 17:45:10 CDT"))).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: SCORE_SET.earlierSetsAction }));
    expect(onOpenEarlierSets).toHaveBeenCalledTimes(1);
  });

  it("(c) with neither result nor summary the line is its skeleton", () => {
    listMock.mockReturnValue(new Promise(() => undefined));
    renderPane();
    expect(screen.getByTestId("as-of-line-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("as-of-line")).toBeNull();
  });

  it("(d) Save carries the list's count and set id, never the summary's", async () => {
    const user = userEvent.setup();
    const { createUniverse } = await import("../../api/classification-client");
    const created = vi.mocked(createUniverse);
    created.mockRejectedValue(new Error("stop after the call"));
    listMock.mockResolvedValue(list(rows(3), { matchCount: 120 }));
    const otherSet: CurrentSet = { ...SET, setId: "set-9" };
    renderPane({ summary: summaryOf(otherSet, null) });
    await screen.findByRole("table");
    await user.click(screen.getByRole("button", { name: RESULTS.saveThese(120) }));
    expect(screen.getByRole("dialog")).not.toHaveTextContent(/including/);
    await user.type(screen.getByLabelText("Name"), "Tech");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(created).toHaveBeenCalledTimes(1));
    expect(created).toHaveBeenCalledWith(expect.objectContaining({ setId: "set-1", name: "Tech" }));
  });

  it("(d) Save is absent under a universe scope", async () => {
    listMock.mockResolvedValue(list(rows(3), { matchCount: 120 }));
    renderPane({ query: { ...DEFAULT_RESEARCH_QUERY, scope: "u1" } });
    await screen.findByRole("table");
    expect(screen.queryByRole("button", { name: RESULTS.saveThese(120) })).toBeNull();
  });

  it("(e) nothing found shows the no-match body, and Clear filters clears then focuses the heading", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    listMock.mockResolvedValue(list([], { matchCount: 0 }));
    renderPane({ query: { ...DEFAULT_RESEARCH_QUERY, hideIncomplete: true }, onClear });
    await screen.findByText(RESULTS.noMatch);
    expect(screen.queryByText(RESULTS.neverScored)).toBeNull();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(h1()).toHaveFocus();
    expect(h1()).toHaveAttribute("tabindex", "-1");
  });

  it("(e) the default query with zero matches on a populated store is the same body", async () => {
    listMock.mockResolvedValue(list([], { matchCount: 0 }));
    renderPane();
    expect(await screen.findByText(RESULTS.noMatch)).toBeInTheDocument();
    expect(screen.queryByTestId("not-current-banner")).toBeNull();
  });

  it.each([
    [null, "symbol"],
    [{ key: "symbol", order: "desc" }, "symbol"],
    [{ key: "value_percentile", order: "asc" }, "value"],
    [{ key: "value_score", order: "desc" }, "value"],
    [{ key: "growth_percentile", order: "desc" }, "growth"],
    [{ key: "growth_score", order: "asc" }, "growth"],
    [{ key: "momentum_percentile", order: "asc" }, "momentum"],
    [{ key: "momentum_score", order: "asc" }, "momentum"],
  ] as const)("(h) sort %j gives the clause 'sorted by %s'", async (sort, label) => {
    listMock.mockResolvedValue(list(rows(3)));
    renderPane({ query: { ...DEFAULT_RESEARCH_QUERY, sort } });
    await screen.findByRole("table");
    const line = screen.getByTestId("as-of-line");
    expect(line).toHaveTextContent(SCORE_SET.sortedBy(label));
    expect(line.textContent).not.toMatch(/ascending|descending/);
  });

  it("(g) the pane source has no storage, location or fetch use (render.test.tsx scans for HTML injection)", () => {
    const source = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), "results-pane.tsx"),
      "utf-8",
    );
    expect(source).not.toMatch(/localStorage|sessionStorage|window\.location|fetch\(/);
  });
});

// Implements TC-COMP-185 (T001, body half) and T007 (a), (c), (d), (g): DAC-E4-2, DAC-E4-S9-1, AC-22.
describe("TC-COMP-185: the never-populated body is distinct from the nothing-found body", () => {
  const body = (): HTMLElement => screen.getByTestId("never-populated");

  it("states that nothing has been scored, the first set's state and the latest download", async () => {
    listMock.mockResolvedValue(NEVER);
    runsMock.mockResolvedValue({ runs: [run("running")], nextCursor: null });
    renderPane({ summary: summaryOf(null, BUILDING) });
    await screen.findByText(RESULTS.neverScored);
    const started = formatTimestamp("2026-10-15T22:30:00Z");
    expect(body()).toHaveTextContent(
      RESULTS.firstSetBuilding(formatTimestamp(BUILDING.runStartedAt)),
    );
    expect(within(body()).getByText(SCORE_SET.updating)).toHaveAttribute(
      "data-variant",
      "status-active",
    );
    await within(body()).findByText(/is Downloading/);
    expect(body()).toHaveTextContent(RESULTS.latestDownloadRunning(started));
    expect(within(body()).getByRole("link", { name: started })).toHaveAttribute("href", "/runs/r1");
    expect(within(body()).getByRole("link", { name: RESULTS.openDataHealth })).toHaveAttribute(
      "href",
      SHELL_ROUTES.dataHealth,
    );
  });

  it("shows no table, row, as-of line, Save, footnote, no-match text or retry control", async () => {
    listMock.mockResolvedValue(NEVER);
    renderPane({ summary: summaryOf(null, BUILDING) });
    await screen.findByText(RESULTS.neverScored);
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryAllByRole("row")).toHaveLength(0);
    expect(screen.queryByText(/Scores from/)).toBeNull();
    expect(screen.queryByRole("button", { name: /Save these/ })).toBeNull();
    expect(footnotes()).toHaveLength(0);
    expect(screen.queryByText(RESULTS.noMatch)).toBeNull();
    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
    expect(screen.queryByRole("button", { name: /try again/i })).toBeNull();
  });

  it("shows Score update failed with the recorded reason when the first attempt failed", async () => {
    listMock.mockResolvedValue({ ...NEVER, later: FAILED });
    renderPane({ summary: summaryOf(null, FAILED) });
    await screen.findByText(RESULTS.neverScored);
    expect(within(body()).getByText(SCORE_SET.scoreUpdateFailed)).toHaveAttribute(
      "data-variant",
      "status-critical",
    );
    expect(body()).toHaveTextContent(
      RESULTS.firstSetFailed(
        formatTimestamp(FAILED.endedAt as string),
        "Factor engine could not read prices",
      ),
    );
    expect(within(body()).queryByText(SCORE_SET.updating)).toBeNull();
    expect(screen.queryByRole("button", { name: /try again/i })).toBeNull();
  });

  it("falls back to the start time and a stated reason for a failed set that recorded neither", async () => {
    const bare: LaterSet = { ...FAILED, endedAt: null, failureReason: null };
    listMock.mockResolvedValue({ ...NEVER, later: bare });
    renderPane({ summary: summaryOf(null, bare) });
    await screen.findByText(RESULTS.neverScored);
    expect(body()).toHaveTextContent(
      RESULTS.firstSetFailed(formatTimestamp(bare.startedAt), SCORE_SET.noReasonRecorded),
    );
  });

  it("shows neither badge when no later set exists", async () => {
    listMock.mockResolvedValue({ ...NEVER, later: null });
    renderPane({ summary: summaryOf(null, null) });
    await screen.findByText(RESULTS.neverScored);
    expect(within(body()).queryByText(SCORE_SET.updating)).toBeNull();
    expect(within(body()).queryByText(SCORE_SET.scoreUpdateFailed)).toBeNull();
  });

  it("uses the list result's later until the first summary poll lands", async () => {
    listMock.mockResolvedValue(NEVER);
    renderPane({ summary: null });
    await screen.findByText(RESULTS.neverScored);
    expect(within(body()).getByText(SCORE_SET.updating)).toBeInTheDocument();
  });

  it("a populated store with no match shows only the nothing-found body", async () => {
    runsMock.mockResolvedValue({ runs: [run("running")], nextCursor: null });
    listMock.mockResolvedValue(list([], { matchCount: 0, later: BUILDING }));
    renderPane({
      query: { ...DEFAULT_RESEARCH_QUERY, symbol: "ZZ" },
      summary: summaryOf(SET, BUILDING),
    });
    await screen.findByText(RESULTS.noMatch);
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
    expect(screen.queryByText(RESULTS.neverScored)).toBeNull();
    expect(screen.queryByTestId("never-populated")).toBeNull();
    expect(runsMock).not.toHaveBeenCalled();
  });

  it("keeps the first set's state when the latest download is running (d)", async () => {
    listMock.mockResolvedValue({ ...NEVER, later: FAILED });
    runsMock.mockResolvedValue({ runs: [run("running")], nextCursor: null });
    renderPane({ summary: summaryOf(null, FAILED) });
    await within(await screen.findByTestId("never-populated")).findByText(/is Downloading/);
    expect(within(body()).queryByText(SCORE_SET.updating)).toBeNull();
    expect(within(body()).getByText(SCORE_SET.scoreUpdateFailed)).toBeInTheDocument();
  });
});

describe("the latest download line", () => {
  const started = formatTimestamp("2026-10-15T22:30:00Z");
  const ended = formatTimestamp("2026-10-15T23:30:00Z");
  const CASES: Array<[string, AcquisitionRun, string]> = [
    [
      "requested",
      run("requested", { startedAt: null }),
      RESULTS.latestDownloadRunning(formatTimestamp("2026-10-15T22:29:00Z")),
    ],
    ["running", run("running"), RESULTS.latestDownloadRunning(started)],
    ["cancelling", run("cancelling"), RESULTS.latestDownloadCancelling(started)],
    [
      "succeeded",
      run("succeeded", { endedAt: "2026-10-15T23:30:00Z" }),
      RESULTS.latestDownloadComplete(started, ended),
    ],
    [
      "partial",
      run("partial", { endedAt: "2026-10-15T23:30:00Z" }),
      RESULTS.latestDownloadPartial(started, ended),
    ],
    [
      "failed",
      run("failed", { endedAt: "2026-10-15T23:30:00Z", failureReason: "Provider refused" }),
      RESULTS.latestDownloadFailed(started, ended, "Provider refused"),
    ],
    [
      "cancelled",
      run("cancelled", { endedAt: "2026-10-15T23:30:00Z" }),
      RESULTS.latestDownloadCancelled(started, ended),
    ],
    [
      "abandoned",
      run("abandoned", { endedAt: "2026-10-15T23:30:00Z" }),
      RESULTS.latestDownloadAbandoned(started, ended),
    ],
  ];

  it.each(CASES)("reads the %s download from copy.ts", async (_state, download, sentence) => {
    listMock.mockResolvedValue({ ...NEVER, later: null });
    runsMock.mockResolvedValue({ runs: [download], nextCursor: null });
    renderPane({ summary: summaryOf(null, null) });
    const line = await screen.findByTestId("latest-download");
    expect(line.textContent).toBe(sentence);
    const link = within(line).getByRole("link");
    expect(link).toHaveAttribute("href", `/runs/${download.runId}`);
    expect(link.textContent).toBe(formatTimestamp(download.startedAt ?? download.requestedAt));
  });

  it("states a reason when a failed download recorded none", async () => {
    listMock.mockResolvedValue({ ...NEVER, later: null });
    runsMock.mockResolvedValue({
      runs: [run("failed", { endedAt: "2026-10-15T23:30:00Z", failureReason: null })],
      nextCursor: null,
    });
    renderPane({ summary: summaryOf(null, null) });
    const line = await screen.findByTestId("latest-download");
    expect(line.textContent).toBe(
      RESULTS.latestDownloadFailed(started, ended, SCORE_SET.noReasonRecorded),
    );
  });

  it("never reads a partial download as Complete", async () => {
    listMock.mockResolvedValue({ ...NEVER, later: null });
    runsMock.mockResolvedValue({
      runs: [run("partial", { endedAt: "2026-10-15T23:30:00Z" })],
      nextCursor: null,
    });
    renderPane({ summary: summaryOf(null, null) });
    const line = await screen.findByTestId("latest-download");
    expect(line.textContent).toContain("ended Partial");
    expect(line.textContent).not.toContain("ended Complete");
  });

  it("asks for the single latest download once on mount", async () => {
    listMock.mockResolvedValue({ ...NEVER, later: null });
    renderPane({ summary: summaryOf(null, null) });
    await screen.findByText(RESULTS.neverScored);
    expect(runsMock).toHaveBeenCalledTimes(1);
    expect(runsMock).toHaveBeenCalledWith({ limit: 1 });
  });

  it("(c) omits the line and keeps the rest when there is no download", async () => {
    listMock.mockResolvedValue({ ...NEVER, later: null });
    renderPane({ summary: summaryOf(null, null) });
    await screen.findByText(RESULTS.neverScored);
    await act(async () => undefined);
    expect(screen.queryByTestId("latest-download")).toBeNull();
    expect(screen.getByRole("link", { name: RESULTS.openDataHealth })).toBeInTheDocument();
  });

  it("(c) omits the line without an error when the read fails", async () => {
    listMock.mockResolvedValue({ ...NEVER, later: null });
    runsMock.mockRejectedValue(new Error("down"));
    renderPane({ summary: summaryOf(null, null) });
    await screen.findByText(RESULTS.neverScored);
    await act(async () => undefined);
    expect(screen.queryByTestId("latest-download")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByTestId("never-populated")).not.toHaveTextContent(/down/);
  });

  it("(b) reads again when the first set's state or download changes, and not otherwise", async () => {
    listMock.mockResolvedValue(NEVER);
    runsMock.mockResolvedValue({ runs: [run("running")], nextCursor: null });
    const view = renderPane({ summary: summaryOf(null, BUILDING) });
    await screen.findByTestId("latest-download");
    expect(runsMock).toHaveBeenCalledTimes(1);

    view.rerender(
      <MemoryRouter>
        <Harness summary={summaryOf(null, BUILDING)} checkedAt="2026-10-16T22:45:10Z" />
      </MemoryRouter>,
    );
    await act(async () => undefined);
    expect(runsMock).toHaveBeenCalledTimes(1);

    runsMock.mockResolvedValue({
      runs: [run("succeeded", { endedAt: "2026-10-15T23:30:00Z" })],
      nextCursor: null,
    });
    view.rerender(
      <MemoryRouter>
        <Harness
          summary={summaryOf(null, {
            ...BUILDING,
            state: "failed",
            endedAt: "2026-10-16T22:41:00Z",
            failureReason: "x",
          })}
        />
      </MemoryRouter>,
    );
    await waitFor(() => expect(runsMock).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(screen.getByTestId("latest-download").textContent).toContain("ended Complete"),
    );

    view.rerender(
      <MemoryRouter>
        <Harness
          summary={summaryOf(null, {
            ...BUILDING,
            state: "failed",
            runId: "run-9",
            endedAt: "2026-10-16T22:41:00Z",
            failureReason: "x",
          })}
        />
      </MemoryRouter>,
    );
    await waitFor(() => expect(runsMock).toHaveBeenCalledTimes(3));
  });

  it("(b) reads again when the shell's health reports the download changed", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    listMock.mockResolvedValue({ ...NEVER, later: null });
    healthMock.mockResolvedValue(health({ run_id: "r1", state: "running" }));
    runsMock.mockResolvedValue({ runs: [run("running")], nextCursor: null });
    render(
      <MemoryRouter>
        <HealthProvider>
          <Harness summary={summaryOf(null, null)} />
        </HealthProvider>
      </MemoryRouter>,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    const initial = runsMock.mock.calls.length;
    expect(initial).toBeGreaterThanOrEqual(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(runsMock).toHaveBeenCalledTimes(initial);

    healthMock.mockResolvedValue(health({ run_id: "r1", state: "succeeded" }));
    runsMock.mockResolvedValue({
      runs: [run("succeeded", { endedAt: "2026-10-15T23:30:00Z" })],
      nextCursor: null,
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(runsMock.mock.calls.length).toBe(initial + 1);
    expect(screen.getByTestId("latest-download").textContent).toContain("ended Complete");
  });

  it("drops the line when a later read fails, and ignores a stale answer from an earlier read", async () => {
    const stale: Array<{
      resolve: (page: { runs: AcquisitionRun[]; nextCursor: string | null }) => void;
      reject: (reason: unknown) => void;
    }> = [];
    listMock.mockResolvedValue(NEVER);
    runsMock.mockImplementationOnce(
      () =>
        new Promise((resolve, reject) => {
          stale.push({ resolve, reject });
        }),
    );
    runsMock.mockImplementationOnce(
      () =>
        new Promise((resolve, reject) => {
          stale.push({ resolve, reject });
        }),
    );
    const view = renderPane({ summary: summaryOf(null, BUILDING) });
    await screen.findByText(RESULTS.neverScored);
    view.rerender(
      <MemoryRouter>
        <Harness summary={summaryOf(null, { ...BUILDING, runId: "run-9" })} />
      </MemoryRouter>,
    );
    await waitFor(() => expect(stale).toHaveLength(2));
    // The newer read answers first; the older read's answer, late, must not replace it.
    await act(async () => {
      stale[1]?.resolve({
        runs: [run("succeeded", { endedAt: "2026-10-15T23:30:00Z" })],
        nextCursor: null,
      });
    });
    await act(async () => {
      stale[0]?.resolve({ runs: [run("running")], nextCursor: null });
    });
    expect(screen.getByTestId("latest-download").textContent).toContain("ended Complete");
    // A later failure of the older read does not clear the newer answer either.
    await act(async () => {
      stale[0]?.reject(new Error("late"));
    });
    expect(screen.getByTestId("latest-download")).toBeInTheDocument();

    runsMock.mockRejectedValueOnce(new Error("down"));
    view.rerender(
      <MemoryRouter>
        <Harness summary={summaryOf(null, { ...BUILDING, runId: "run-10" })} />
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.queryByTestId("latest-download")).toBeNull());
  });

  it("(b) a failed older read arriving late does not clear a newer line", async () => {
    const reads: Array<(reason: unknown) => void> = [];
    listMock.mockResolvedValue(NEVER);
    runsMock.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          reads.push(reject);
        }),
    );
    runsMock.mockResolvedValueOnce({ runs: [run("running")], nextCursor: null });
    const view = renderPane({ summary: summaryOf(null, BUILDING) });
    await screen.findByText(RESULTS.neverScored);
    view.rerender(
      <MemoryRouter>
        <Harness summary={summaryOf(null, { ...BUILDING, runId: "run-9" })} />
      </MemoryRouter>,
    );
    await screen.findByTestId("latest-download");
    await act(async () => {
      reads[0]?.(new Error("late"));
    });
    expect(screen.getByTestId("latest-download")).toBeInTheDocument();
  });

  it("ignores a read that returns after the pane unmounted", async () => {
    let resolve!: (page: { runs: AcquisitionRun[]; nextCursor: string | null }) => void;
    runsMock.mockReturnValue(
      new Promise((res) => {
        resolve = res;
      }),
    );
    listMock.mockResolvedValue({ ...NEVER, later: null });
    renderPane({ summary: summaryOf(null, null) });
    await screen.findByText(RESULTS.neverScored);
    cleanup();
    await act(async () => {
      resolve({ runs: [run("running")], nextCursor: null });
    });
    expect(screen.queryByTestId("latest-download")).toBeNull();
  });
});

// T007 (g): Open Gap 7, DEC-0155 as amended.
describe("poll failure in the never-populated state", () => {
  it("always renders an empty polite status element, with no sentence or button while the poll works", async () => {
    listMock.mockResolvedValue(NEVER);
    renderPane({ summary: summaryOf(null, BUILDING), pollFailed: false });
    await screen.findByText(RESULTS.neverScored);
    const status = screen.getByTestId("never-populated-status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toBeEmptyDOMElement();
    expect(screen.queryByText(SCORE_SET.couldNotCheck)).toBeNull();
    expect(screen.queryByRole("button", { name: RESULTS.tryAgain })).toBeNull();
  });

  it("after a failed poll states it in the status element and offers Try again outside it", async () => {
    const user = userEvent.setup();
    const onTryAgain = vi.fn();
    listMock.mockResolvedValue(NEVER);
    runsMock.mockResolvedValue({ runs: [run("running")], nextCursor: null });
    renderPane({ summary: summaryOf(null, BUILDING), pollFailed: true, onTryAgain });
    await screen.findByTestId("latest-download");
    const status = screen.getByTestId("never-populated-status");
    expect(status).toHaveTextContent(SCORE_SET.couldNotCheck);
    const button = screen.getByRole("button", { name: RESULTS.tryAgain });
    expect(status).not.toContainElement(button);
    const badge = screen.getByText(SCORE_SET.updating);
    const download = screen.getByTestId("latest-download");
    const follows = (a: Element, b: Element): boolean =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(follows(badge, status)).toBe(true);
    expect(follows(button, download)).toBe(true);
    await user.click(button);
    expect(onTryAgain).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole("button", { name: RESULTS.tryAgain })).toHaveLength(1);
  });
});
