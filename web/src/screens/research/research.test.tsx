import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { JSX } from "react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ClassificationApiError,
  createUniverse,
  getClassificationSummary,
  getStockEvidence,
  listClassificationSets,
  listClassifications,
  listUniverses,
} from "../../api/classification-client";
import type {
  ClassificationList,
  ClassificationSummary,
  CurrentSet,
  FactorCell,
  FactorSummary,
  LaterSet,
  StockEvidence,
  StockRow,
} from "../../api/classification-types";
import { fetchHealth, listAcquisitionRuns } from "../../api/client";
import type { AcquisitionRun, HealthResponse, RunState } from "../../api/types";
import { CELL, DIALOGS, FILTERS, REGIONS, RESULTS, SCORE_SET, SELECTION, SORT } from "./copy";
import { formatTimestamp } from "./format";
import ResearchScreen from "./index";

vi.mock("../../api/classification-client", async () => {
  const actual = await vi.importActual<typeof import("../../api/classification-client")>(
    "../../api/classification-client",
  );
  return {
    ...actual,
    listClassifications: vi.fn(),
    getClassificationSummary: vi.fn(),
    getStockEvidence: vi.fn(),
    listClassificationSets: vi.fn(),
    listUniverses: vi.fn(),
    createUniverse: vi.fn(),
    addUniverseMembers: vi.fn(),
  };
});

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return { ...actual, listAcquisitionRuns: vi.fn(), fetchHealth: vi.fn() };
});

const listMock = vi.mocked(listClassifications);
const summaryMock = vi.mocked(getClassificationSummary);
const evidenceMock = vi.mocked(getStockEvidence);
const setsMock = vi.mocked(listClassificationSets);
const universesMock = vi.mocked(listUniverses);
const createMock = vi.mocked(createUniverse);
const runsMock = vi.mocked(listAcquisitionRuns);
const healthMock = vi.mocked(fetchHealth);

// --- Fixtures (classification-api section 2.7) ---------------------------------

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

function factorSummary(): FactorSummary {
  return { qualifiedCount: 2846, ranked: true, minPeerSetSize: 30 };
}

function currentSet(setId: string, endedAt = "2026-10-15T22:46:00Z"): CurrentSet {
  return {
    setId,
    classificationDate: "2026-10-15",
    runId: "run-1",
    runStartedAt: "2026-10-15T22:30:00Z",
    runOutcome: "succeeded",
    state: "complete",
    startedAt: "2026-10-15T22:40:00Z",
    endedAt,
    latestTradingDay: "2026-10-15",
    activeInstruments: 2846,
    notCurrent: false,
  };
}

const SET1 = currentSet("s-1");
const SET2 = currentSet("s-2", "2026-10-16T22:46:00Z");

const BUILDING: LaterSet = {
  setId: "s-9",
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
    set: SET1,
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

function never(later: LaterSet | null): ClassificationList {
  return list([], { neverClassified: true, set: null, matchCount: 0, later });
}

function evidence(symbol: string): StockEvidence {
  return {
    symbol,
    name: `${symbol} Incorporated`,
    lifecycle: "active",
    set: SET1,
    factors: { value: cell("84"), growth: cell("61"), momentum: cell("27") },
    inputs: [],
    memberships: [],
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

function download(state: RunState, overrides: Partial<AcquisitionRun> = {}): AcquisitionRun {
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

const THREE = [stock("AAPL"), stock("MSFT"), stock("NVDA")];

const FULL_URL =
  "/research?scope=u1&value.measure=percentile&value.direction=atLeast&value.value=80&momentum.measure=standardisedScore&momentum.direction=atMost&momentum.value=1.5&hide_incomplete=true&symbol=AA&sort=growth_percentile&order=desc";

// --- Rendering ---------------------------------------------------------------

function Probe(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output data-testid="search">{location.search.replace(/^\?/, "")}</output>
      <button type="button" onClick={() => navigate(-1)}>
        probe back
      </button>
    </>
  );
}

function mount(entries: string[] = ["/research"]): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={entries}>
      <ResearchScreen />
      <Probe />
    </MemoryRouter>,
  );
}

const row = (symbol: string): HTMLElement =>
  document.querySelector(`tbody tr[data-symbol="${symbol}"]`) as HTMLElement;
const h1 = (): HTMLElement => screen.getByRole("heading", { level: 1 });
const search = (): string => screen.getByTestId("search").textContent ?? "";
const footnotes = (): HTMLElement[] => screen.queryAllByText(CELL.coverageStatement);

/** Flushes resolved promises and timers up to `ms` under fake timers. */
async function advance(ms: number): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  for (const mock of [
    listMock,
    summaryMock,
    evidenceMock,
    setsMock,
    universesMock,
    createMock,
    runsMock,
    healthMock,
  ]) {
    mock.mockReset();
  }
  runsMock.mockResolvedValue({ runs: [], nextCursor: null });
  healthMock.mockResolvedValue(health(null));
  universesMock.mockResolvedValue({
    universes: [
      {
        universeId: "u1",
        name: "Tech",
        lifecycle: "active",
        memberCount: 3,
        createdAt: "2026-10-15T17:46:00Z",
        retiredAt: null,
      },
    ],
    activeCount: 1,
    retiredCount: 0,
    nextCursor: null,
  });
  listMock.mockResolvedValue(list(THREE));
  summaryMock.mockResolvedValue(summaryOf(SET1, null));
  evidenceMock.mockImplementation(async (symbol) => evidence(symbol));
  setsMock.mockResolvedValue({ sets: [], nextCursor: null });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// Implements TC-COMP-185 (T001): AC-22, DAC-E4-2, DAC-E4-S9-1.
describe("TC-COMP-185: the never-populated body is distinct from the nothing-found body", () => {
  it("states no stocks have been scored, with the first set's state and the latest download", async () => {
    listMock.mockResolvedValue(never(BUILDING));
    summaryMock.mockResolvedValue(summaryOf(null, BUILDING));
    runsMock.mockResolvedValue({ runs: [download("running")], nextCursor: null });
    mount();
    await screen.findByText(RESULTS.neverScored);
    const body = screen.getByTestId("never-populated");
    expect(within(body).getByText(SCORE_SET.updating)).toHaveAttribute(
      "data-variant",
      "status-active",
    );
    expect(body).toHaveTextContent(
      RESULTS.firstSetBuilding(formatTimestamp(BUILDING.runStartedAt)),
    );
    await within(body).findByTestId("latest-download");
    expect(
      within(body).getByRole("link", { name: formatTimestamp("2026-10-15T22:30:00Z") }),
    ).toHaveAttribute("href", "/runs/r1");
    expect(within(body).getByRole("link", { name: RESULTS.openDataHealth })).toHaveAttribute(
      "href",
      "/runs",
    );
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByText(/Scores from/)).toBeNull();
    expect(screen.queryByRole("button", { name: /Save these/ })).toBeNull();
    expect(screen.queryByText(RESULTS.noMatch)).toBeNull();
    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
    expect(h1()).toHaveTextContent(RESULTS.title);
  });

  it("shows the failed first attempt with its reason and no retry control", async () => {
    listMock.mockResolvedValue(never(FAILED));
    summaryMock.mockResolvedValue(summaryOf(null, FAILED));
    mount();
    await screen.findByText(RESULTS.neverScored);
    expect(screen.getByText(SCORE_SET.scoreUpdateFailed)).toHaveAttribute(
      "data-variant",
      "status-critical",
    );
    expect(screen.getByTestId("never-populated")).toHaveTextContent(
      RESULTS.firstSetFailed(
        formatTimestamp(FAILED.endedAt as string),
        "Factor engine could not read prices",
      ),
    );
    expect(screen.queryByRole("button", { name: /try again/i })).toBeNull();
  });

  it("with no later set neither badge shows and the body still names the latest download", async () => {
    listMock.mockResolvedValue(never(null));
    summaryMock.mockResolvedValue(summaryOf(null, null));
    runsMock.mockResolvedValue({ runs: [download("running")], nextCursor: null });
    mount();
    await screen.findByText(RESULTS.neverScored);
    const body = screen.getByTestId("never-populated");
    await within(body).findByTestId("latest-download");
    expect(within(body).queryByText(SCORE_SET.updating)).toBeNull();
    expect(within(body).queryByText(SCORE_SET.scoreUpdateFailed)).toBeNull();
    expect(screen.queryByRole("button", { name: /try again/i })).toBeNull();
  });

  it("a populated store with a threshold and no match shows only the nothing-found body", async () => {
    listMock.mockResolvedValue(list([], { matchCount: 0 }));
    mount(["/research?value.measure=percentile&value.direction=atLeast&value.value=99"]);
    await screen.findByText(RESULTS.noMatch);
    expect(screen.getAllByRole("button", { name: "Clear filters" }).length).toBeGreaterThan(0);
    expect(screen.queryByText(RESULTS.neverScored)).toBeNull();
    expect(screen.queryByText(SCORE_SET.updating)).toBeNull();
    expect(screen.queryByTestId("latest-download")).toBeNull();
  });
});

// Implements TC-COMP-145 (T003): DAC-E4-3, DAC-E4-S9-3, AC-16.
describe("TC-COMP-145: reload and back restore state from the URL", () => {
  it("restores every URL key into the request, the pane and the sort clause, with no storage use", async () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem");
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    mount([FULL_URL]);
    await screen.findByRole("table");
    expect(listMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        universeId: "u1",
        valuePercentileMin: "80",
        momentumScoreMax: "1.5",
        hideIncomplete: true,
        symbol: "AA",
        sort: "growth_percentile",
        order: "desc",
      }),
    );
    expect(screen.getByRole("textbox", { name: "Find a stock" })).toHaveValue("AA");
    expect(
      screen.getByRole("checkbox", { name: "Hide stocks with an incomplete score" }),
    ).toBeChecked();
    expect(screen.getByRole("textbox", { name: "Value threshold" })).toHaveValue("80");
    expect(screen.getByRole("textbox", { name: "Value threshold for momentum" })).toHaveValue(
      "1.5",
    );
    expect(screen.getByRole("combobox", { name: "Measure for momentum" })).toHaveValue(
      "standardisedScore",
    );
    expect(screen.getByRole("combobox", { name: "Direction for momentum" })).toHaveValue("atMost");
    expect(screen.getByRole("combobox", { name: /^Look in: / })).toHaveValue("u1");
    expect(screen.getByTestId("as-of-line")).toHaveTextContent(SCORE_SET.sortedBy("growth"));
    expect(getItem).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
  });

  it("a reload at the same URL gives the same request and fields", async () => {
    const first = mount([FULL_URL]);
    await screen.findByRole("table");
    const firstCall = listMock.mock.calls[0]?.[0];
    first.unmount();
    listMock.mockClear();
    mount([FULL_URL]);
    await screen.findByRole("table");
    expect(listMock.mock.calls[0]?.[0]).toEqual(firstCall);
    expect(screen.getByRole("textbox", { name: "Find a stock" })).toHaveValue("AA");
  });

  it("back navigation returns the pane and the next request to the earlier query", async () => {
    const user = userEvent.setup();
    mount([
      "/research",
      "/research?value.measure=percentile&value.direction=atLeast&value.value=80",
    ]);
    await screen.findByRole("table");
    expect(screen.getByRole("textbox", { name: "Value threshold" })).toHaveValue("80");
    const threshold = screen.getByRole("textbox", { name: "Value threshold" });
    await user.clear(threshold);
    await user.type(threshold, "90");
    await user.tab();
    await waitFor(() => expect(search()).toContain("value.value=90"));
    await user.click(screen.getByRole("button", { name: "probe back" }));
    await waitFor(() => expect(search()).toContain("value.value=80"));
    expect(screen.getByRole("textbox", { name: "Value threshold" })).toHaveValue("80");
    await waitFor(() =>
      expect(listMock.mock.calls.at(-1)?.[0]).toEqual(
        expect.objectContaining({ valuePercentileMin: "80" }),
      ),
    );
  });
});

// Implements TC-COMP-099 (T005, screen half): DAC-E4-S9-5.
describe("TC-COMP-099: the footnote is one across the whole screen", () => {
  it("stays one with a stock selected, its inspector showing its own different footnote", async () => {
    const user = userEvent.setup();
    mount();
    await screen.findByRole("table");
    await user.click(row("MSFT"));
    await waitFor(() => expect(evidenceMock).toHaveBeenCalled());
    await screen.findByText(/Percentile first/);
    expect(footnotes()).toHaveLength(1);
  });
});

// T007: never-populated details at the screen (AC-20, AC-22, DAC-E4-2; Open Gaps 1 and 7).
describe("never-populated details", () => {
  it("(e) leaves the Filters pane live and commits Find a stock on Enter, not per keystroke", async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValue(never(null));
    summaryMock.mockResolvedValue(summaryOf(null, null));
    mount();
    await screen.findByText(RESULTS.neverScored);
    const filters = screen.getByRole("region", { name: REGIONS.filters });
    for (const control of within(filters).getAllByRole("textbox")) {
      expect(control).not.toBeDisabled();
      expect(control).not.toHaveAttribute("aria-disabled");
    }
    expect(filters).not.toHaveAttribute("inert");
    const find = screen.getByRole("textbox", { name: "Find a stock" });
    await user.type(find, "aa");
    expect(search()).toBe("");
    await user.keyboard("{Enter}");
    await waitFor(() => expect(search()).toContain("symbol=AA"));
    expect(screen.getByText(SELECTION.inspectorEmpty)).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: REGIONS.selection })).toBeNull();
  });
});

describe("polling", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  function setup(): ReturnType<typeof userEvent.setup> {
    return userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  }

  it("(f) a poll that reports the first set refreshes the never-populated body into the table", async () => {
    listMock.mockResolvedValueOnce(never(BUILDING));
    summaryMock.mockResolvedValueOnce(summaryOf(null, BUILDING));
    mount();
    await advance(0);
    expect(screen.getByText(RESULTS.neverScored)).toBeInTheDocument();
    listMock.mockResolvedValue(list(THREE));
    summaryMock.mockResolvedValue(summaryOf(SET1, null));
    await advance(10_000);
    expect(screen.queryByText(RESULTS.neverScored)).toBeNull();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(row("AAPL")).not.toBeNull();
    expect(h1()).toHaveTextContent(RESULTS.stocksMatch(3));
  });

  it("(b) re-reads the latest download when the first set's state changes, and on no other tick", async () => {
    listMock.mockResolvedValue(never(BUILDING));
    summaryMock.mockResolvedValue(summaryOf(null, BUILDING));
    runsMock.mockResolvedValue({ runs: [download("running")], nextCursor: null });
    mount();
    await advance(0);
    expect(runsMock).toHaveBeenCalledTimes(1);
    await advance(20_000);
    expect(runsMock).toHaveBeenCalledTimes(1);
    summaryMock.mockResolvedValue(summaryOf(null, FAILED));
    await advance(10_000);
    expect(runsMock).toHaveBeenCalledTimes(2);
  });

  it("(g) a failed poll in the never-populated state offers Try again, once", async () => {
    const user = setup();
    listMock.mockResolvedValue(never(BUILDING));
    summaryMock.mockResolvedValueOnce(summaryOf(null, BUILDING));
    summaryMock.mockRejectedValueOnce(new Error("down"));
    mount();
    await advance(0);
    const status = screen.getByTestId("never-populated-status");
    expect(status).toBeEmptyDOMElement();
    await advance(10_000);
    expect(status).toHaveTextContent(SCORE_SET.couldNotCheck);
    expect(screen.getByText(SCORE_SET.updating)).toBeInTheDocument();
    const calls = summaryMock.mock.calls.length;
    await advance(30_000);
    expect(summaryMock.mock.calls.length).toBe(calls);
    summaryMock.mockResolvedValue(summaryOf(SET1, null));
    listMock.mockResolvedValue(list(THREE));
    await user.click(screen.getByRole("button", { name: RESULTS.tryAgain }));
    await advance(0);
    expect(summaryMock.mock.calls.length).toBe(calls + 1);
    expect(screen.queryByText(SCORE_SET.couldNotCheck)).toBeNull();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("(g) a summary that fails on mount still offers Try again on the never-populated body", async () => {
    const user = setup();
    listMock.mockResolvedValue(never(BUILDING));
    summaryMock.mockRejectedValueOnce(new Error("down"));
    mount();
    await advance(0);
    expect(screen.getByTestId("never-populated-status")).toHaveTextContent(SCORE_SET.couldNotCheck);
    summaryMock.mockResolvedValue(summaryOf(null, BUILDING));
    await user.click(screen.getByRole("button", { name: RESULTS.tryAgain }));
    await advance(0);
    expect(summaryMock).toHaveBeenCalledTimes(2);
  });

  // T008: AC-20, AC-21, DAC-E4-4.
  it("reloads page one once on completion, preserving sort, filters, selection and checks", async () => {
    const user = setup();
    const url =
      "/research?scope=u1&value.measure=percentile&value.direction=atLeast&value.value=80&symbol=A&sort=growth_percentile&order=desc";
    listMock.mockResolvedValueOnce(list(THREE, { later: BUILDING }));
    summaryMock.mockResolvedValue(summaryOf(SET1, BUILDING));
    mount([url]);
    await advance(0);
    await user.click(row("MSFT"));
    await user.click(within(row("AAPL")).getByRole("checkbox"));
    await user.click(within(row("NVDA")).getByRole("checkbox"));
    expect(screen.getByText(SELECTION.selected(2))).toBeInTheDocument();
    const before = listMock.mock.calls.length;
    const held = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(held.promise);
    summaryMock.mockResolvedValue(summaryOf(SET2, null));
    await advance(10_000);
    expect(listMock.mock.calls.length).toBe(before + 1);
    expect(listMock.mock.calls.at(-1)?.[0]).toEqual(listMock.mock.calls[0]?.[0]);
    // The table is dimmed with its rows kept until the new first page arrives.
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    expect(row("AAPL")).not.toBeNull();
    // The line still names the old set until the new first page arrives.
    expect(screen.getByTestId("as-of-line")).toHaveTextContent("2026-10-15 17:46 CDT");
    expect(screen.queryByTestId("not-current-banner")).toBeNull();
    expect(screen.queryByText(SCORE_SET.updating)).toBeNull();
    await act(async () => {
      held.resolve(list(THREE, { set: SET2 }));
    });
    await advance(0);
    expect(screen.getByTestId("as-of-line")).toHaveTextContent("2026-10-16 17:46 CDT");
    expect(screen.getAllByText(/^Scores updated to /)).toHaveLength(1);
    expect(row("MSFT")).toHaveAttribute("aria-selected", "true");
    expect(within(row("AAPL")).getByRole("checkbox")).toBeChecked();
    expect(within(row("NVDA")).getByRole("checkbox")).toBeChecked();
    expect(screen.getByText(SELECTION.selected(2))).toBeInTheDocument();
    expect(search()).toContain("scope=u1");
    await advance(30_000);
    expect(listMock.mock.calls.length).toBe(before + 1);
  });

  it("an unchanged second summary causes no reload; a failed attempt reloads nothing", async () => {
    listMock.mockResolvedValue(list(THREE, { later: BUILDING }));
    summaryMock.mockResolvedValue(summaryOf(SET1, BUILDING));
    mount();
    await advance(0);
    const before = listMock.mock.calls.length;
    await advance(10_000);
    expect(listMock.mock.calls.length).toBe(before);
    summaryMock.mockResolvedValue(summaryOf(SET1, FAILED));
    await advance(10_000);
    expect(listMock.mock.calls.length).toBe(before);
    expect(screen.getByText(SCORE_SET.scoreUpdateFailed)).toBeInTheDocument();
    expect(screen.getByTestId("not-current-banner")).toHaveTextContent(
      "Factor engine could not read prices",
    );
  });

  it("a poll failure keeps the banner and rows and Try again reads once", async () => {
    const user = setup();
    listMock.mockResolvedValue(list(THREE, { later: BUILDING }));
    summaryMock.mockResolvedValueOnce(summaryOf(SET1, BUILDING));
    summaryMock.mockRejectedValueOnce(new Error("down"));
    mount();
    await advance(0);
    await advance(10_000);
    expect(screen.getAllByText(SCORE_SET.couldNotCheck).length).toBeGreaterThan(0);
    expect(screen.getByTestId("not-current-banner")).toBeInTheDocument();
    expect(row("AAPL")).not.toBeNull();
    const calls = summaryMock.mock.calls.length;
    summaryMock.mockResolvedValue(summaryOf(SET1, BUILDING));
    await user.click(screen.getByRole("button", { name: RESULTS.tryAgain }));
    await advance(0);
    expect(summaryMock.mock.calls.length).toBe(calls + 1);
  });

  it("Save carries the list's set id while the summary already names the new set", async () => {
    const user = setup();
    listMock.mockResolvedValueOnce(list(THREE, { matchCount: 120, later: BUILDING }));
    summaryMock.mockResolvedValue(summaryOf(SET1, BUILDING));
    mount(["/research?sort=growth_percentile&order=desc&symbol=A"]);
    await advance(0);
    expect(screen.getByRole("button", { name: RESULTS.saveThese(120) })).toBeInTheDocument();
    const held = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(held.promise);
    summaryMock.mockResolvedValue(summaryOf(SET2, null));
    await advance(10_000);

    createMock.mockRejectedValueOnce(
      new ClassificationApiError("changed", "req-1", {
        code: "classification_set_changed",
        operation: "create-universe",
        resource: "universe",
      }),
    );
    await user.click(screen.getByRole("button", { name: RESULTS.saveThese(120) }));
    await user.type(screen.getByLabelText("Name"), "Tech leaders");
    await user.click(screen.getByRole("button", { name: DIALOGS.save }));
    await advance(0);
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenNthCalledWith(1, expect.objectContaining({ setId: "s-1" }));
    expect(screen.getByRole("alert")).toHaveTextContent(DIALOGS.setChanged);
    await user.click(screen.getByRole("button", { name: DIALOGS.reviewNewResult }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(createMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      held.resolve(list(THREE, { set: SET2, matchCount: 118 }));
    });
    await advance(0);
    createMock.mockResolvedValueOnce({
      universeId: "u-9",
      name: "Tech leaders 2",
      memberCount: 118,
    } as never);
    await user.click(screen.getByRole("button", { name: RESULTS.saveThese(118) }));
    await user.type(screen.getByLabelText("Name"), "Tech leaders 2");
    await user.click(screen.getByRole("button", { name: DIALOGS.save }));
    await advance(0);
    expect(createMock).toHaveBeenCalledTimes(2);
    expect(createMock).toHaveBeenNthCalledWith(2, expect.objectContaining({ setId: "s-2" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  // T009: AC-9, AC-16, DAC-E4-4.
  it("(a) calls the inspector once, 150 ms after the last selection change", async () => {
    const user = setup();
    listMock.mockResolvedValue(
      list(
        Array.from({ length: 12 }, (_, i) =>
          stock(i === 0 ? "AAPL" : `S${String(i).padStart(2, "0")}`),
        ),
      ),
    );
    mount();
    await advance(0);
    await user.click(row("AAPL"));
    await advance(50);
    expect(evidenceMock).not.toHaveBeenCalled();
    await advance(150);
    expect(evidenceMock).toHaveBeenCalledTimes(1);
    expect(evidenceMock).toHaveBeenCalledWith("AAPL");
    row("AAPL").focus();
    await user.keyboard("{ArrowDown}".repeat(10));
    await advance(150);
    expect(evidenceMock).toHaveBeenCalledTimes(2);
    expect(evidenceMock).toHaveBeenLastCalledWith("S10");
  });

  it("(b) checking two rows shows the tray and the Compare link; one row blocks it", async () => {
    const user = setup();
    mount();
    await advance(0);
    await user.click(within(row("AAPL")).getByRole("checkbox"));
    expect(screen.getByText(SELECTION.compareBlocked)).toBeInTheDocument();
    await user.click(within(row("MSFT")).getByRole("checkbox"));
    expect(screen.getByText(SELECTION.selected(2))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: SELECTION.compareSideBySide })).toHaveAttribute(
      "href",
      "/research/compare?symbols=AAPL,MSFT",
    );
    await user.click(row("NVDA"));
    expect(screen.getByText(SELECTION.selected(2))).toBeInTheDocument();
  });

  it("(b) keeps selected and checked by symbol across a sort and a scope change", async () => {
    const user = setup();
    mount();
    await advance(0);
    await user.click(row("MSFT"));
    await user.click(within(row("AAPL")).getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: SORT.byPercentile("growth") }));
    await advance(0);
    expect(search()).toContain("sort=growth_percentile");
    await user.selectOptions(screen.getByRole("combobox", { name: /^Look in: / }), "u1");
    await advance(0);
    expect(search()).toContain("scope=u1");
    expect(row("MSFT")).toHaveAttribute("aria-selected", "true");
    expect(within(row("AAPL")).getByRole("checkbox")).toBeChecked();
    expect(screen.getByText(SELECTION.selected(1))).toBeInTheDocument();
  });

  it("(b) keeps selected and checked by symbol across a threshold change", async () => {
    const user = setup();
    mount();
    await advance(0);
    await user.click(row("MSFT"));
    await user.click(within(row("AAPL")).getByRole("checkbox"));
    const threshold = screen.getByRole("textbox", { name: "Value threshold" });
    await user.type(threshold, "80");
    await user.tab();
    await advance(0);
    expect(search()).toContain("value.value=80");
    expect(row("MSFT")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(SELECTION.selected(1))).toBeInTheDocument();
  });

  it("(c) Add to universe opens the dialog with the checked symbols, notifies once and keeps the checks", async () => {
    const user = setup();
    const { addUniverseMembers } = await import("../../api/classification-client");
    vi.mocked(addUniverseMembers).mockResolvedValue({
      added: ["AAPL", "MSFT"],
      alreadyMember: [],
    });
    mount();
    await advance(0);
    await user.click(within(row("AAPL")).getByRole("checkbox"));
    await user.click(within(row("MSFT")).getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: SELECTION.addToUniverse }));
    const dialog = await screen.findByRole("dialog");
    await advance(0);
    await user.click(within(dialog).getByRole("button", { name: DIALOGS.add }));
    await advance(0);
    expect(vi.mocked(addUniverseMembers)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(addUniverseMembers).mock.calls[0]).toEqual(["u1", ["AAPL", "MSFT"]]);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getAllByText(DIALOGS.added(2, "Tech", 0))).toHaveLength(1);
    expect(screen.getByText(SELECTION.selected(2))).toBeInTheDocument();
  });

  it("(d)/(e) one notices region stacks Save and Add notices, each dismissed alone", async () => {
    const user = setup();
    listMock.mockResolvedValue(list(THREE, { matchCount: 12 }));
    createMock.mockResolvedValue({
      universeId: "u-9",
      name: "Tech leaders",
      memberCount: 12,
    } as never);
    mount();
    await advance(0);
    expect(screen.getByRole("button", { name: RESULTS.saveThese(12) })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: RESULTS.saveThese(12) }));
    await user.type(screen.getByLabelText("Name"), "Tech leaders");
    await user.click(screen.getByRole("button", { name: DIALOGS.save }));
    await advance(0);
    expect(screen.getByText(DIALOGS.saved(12, "Tech leaders"))).toBeInTheDocument();
    const notices = screen.getAllByRole("status").filter((el) => el.className.includes("fixed"));
    expect(notices).toHaveLength(1);
    await user.click(within(notices[0] as HTMLElement).getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText(DIALOGS.saved(12, "Tech leaders"))).toBeNull();
  });

  it("(e) Save is absent under a universe scope", async () => {
    mount(["/research?scope=u1"]);
    await advance(0);
    expect(screen.queryByRole("button", { name: /Save these/ })).toBeNull();
  });

  it("(f) Earlier sets opens the history dialog and Close leaves the screen unchanged", async () => {
    const user = setup();
    mount();
    await advance(0);
    await user.click(row("MSFT"));
    await user.click(within(row("AAPL")).getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: SCORE_SET.earlierSetsAction }));
    const dialog = await screen.findByRole("dialog", { name: SCORE_SET.earlierSetsTitle });
    await advance(0);
    await user.click(within(dialog).getByRole("button", { name: SCORE_SET.close }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(row("MSFT")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(SELECTION.selected(1))).toBeInTheDocument();
    expect(row("AAPL")).not.toBeNull();
  });

  it("(g) keeps the selection when a filter removes the selected stock", async () => {
    const user = setup();
    mount();
    await advance(0);
    await user.click(row("MSFT"));
    await advance(150);
    listMock.mockResolvedValue(list([stock("AAPL")]));
    const find = screen.getByRole("textbox", { name: "Find a stock" });
    await user.type(find, "AA{Enter}");
    await advance(0);
    expect(row("MSFT")).toBeNull();
    await screen.findByText(/Percentile first/);
    expect(evidenceMock).toHaveBeenCalledTimes(1);
  });

  it("(h) a summary that fails on first load still renders the table, with Try again", async () => {
    const user = setup();
    summaryMock.mockRejectedValueOnce(new Error("down"));
    mount();
    await advance(0);
    expect(row("AAPL")).not.toBeNull();
    expect(screen.getByTestId("as-of-line")).toHaveTextContent(SCORE_SET.couldNotCheck);
    summaryMock.mockResolvedValue(summaryOf(SET1, null));
    await user.click(screen.getByRole("button", { name: RESULTS.tryAgain }));
    await advance(0);
    expect(summaryMock).toHaveBeenCalledTimes(2);
  });
});

describe("screen wiring", () => {
  it("lays the panes out as a wrapping row", async () => {
    const { container } = mount();
    await screen.findByRole("table");
    expect(container.firstElementChild).toHaveClass("flex", "flex-wrap", "gap-4");
  });

  it("gives the Filters pane the followed-stock count from the list result's set", async () => {
    mount();
    await screen.findByRole("table");
    expect(
      screen.getByRole("option", { name: FILTERS.allFollowedStocksOption(2846) }),
    ).toBeInTheDocument();
  });

  it("writes a header sort to the URL", async () => {
    const user = userEvent.setup();
    mount();
    await screen.findByRole("table");
    await user.click(screen.getByRole("button", { name: SORT.byPercentile("growth") }));
    await waitFor(() => expect(search()).toContain("sort=growth_percentile"));
    await waitFor(() =>
      expect(listMock.mock.calls.at(-1)?.[0]).toEqual(
        expect.objectContaining({ sort: "growth_percentile" }),
      ),
    );
  });

  it("Clear filters in the nothing-found body clears the thresholds from the URL", async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValue(list([], { matchCount: 0 }));
    mount([
      "/research?value.measure=percentile&value.direction=atLeast&value.value=99&sort=growth_percentile&order=desc",
    ]);
    await screen.findByText(RESULTS.noMatch);
    const results = screen.getByRole("region", { name: REGIONS.results });
    await user.click(within(results).getByRole("button", { name: "Clear filters" }));
    await waitFor(() => expect(search()).not.toContain("value.value"));
    expect(search()).toContain("sort=growth_percentile");
  });

  it("shows when the last poll checked while a later set builds", async () => {
    listMock.mockResolvedValue(list(THREE, { later: BUILDING }));
    summaryMock.mockResolvedValue(summaryOf(SET1, BUILDING));
    mount();
    await screen.findByRole("table");
    await screen.findByText(/^checked \d{4}-/);
  });
});
