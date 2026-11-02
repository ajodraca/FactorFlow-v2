import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { JSX } from "react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ClassificationApiError,
  addUniverseMembers,
  createUniverse,
  getClassificationSummary,
  getStockEvidence,
  listClassificationSets,
  listClassifications,
  listUniverses,
} from "../../api/classification-client";
import type {
  ClassificationList,
  ClassificationListParams,
  ClassificationSummary,
  CurrentSet,
  FactorCell,
  FactorSummary,
  LaterSet,
  StockEvidence,
  StockRow,
  UniverseDetail,
  UniverseList,
} from "../../api/classification-types";
import { fetchHealth, listAcquisitionRuns } from "../../api/client";
import type { AcquisitionRun, HealthResponse, RunState } from "../../api/types";
import { HealthProvider } from "../../app/status-region";
import {
  CELL,
  DIALOGS,
  FILTERS,
  NOTICES,
  REGIONS,
  RESULTS,
  SCORE_SET,
  SELECTION,
  SHELL_ROUTES,
  SORT,
} from "./copy";
import { formatTimestamp } from "./format";
import ResearchScreen from "./index";
import { universePath } from "./notices";

vi.mock("../../api/classification-client", async () => {
  const actual = await vi.importActual<typeof import("../../api/classification-client")>(
    "../../api/classification-client",
  );
  return {
    ...actual,
    listClassifications: vi.fn(),
    getClassificationSummary: vi.fn(),
    listClassificationSets: vi.fn(),
    getStockEvidence: vi.fn(),
    createUniverse: vi.fn(),
    listUniverses: vi.fn(),
    addUniverseMembers: vi.fn(),
  };
});

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return { ...actual, fetchHealth: vi.fn(), listAcquisitionRuns: vi.fn() };
});

const listMock = vi.mocked(listClassifications);
const summaryMock = vi.mocked(getClassificationSummary);
const setsMock = vi.mocked(listClassificationSets);
const evidenceMock = vi.mocked(getStockEvidence);
const createMock = vi.mocked(createUniverse);
const universesMock = vi.mocked(listUniverses);
const addMock = vi.mocked(addUniverseMembers);
const healthMock = vi.mocked(fetchHealth);
const runsMock = vi.mocked(listAcquisitionRuns);

// --- Fixtures (classification-api section 2.7; ingestion-api section 11) ---

function cell(percentile = "61"): FactorCell {
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

/** AAPL, MSFT and NVDA first, then fillers, `count` rows in all. */
function rows(count = 50): StockRow[] {
  const named = ["AAPL", "MSFT", "NVDA"].map(stock);
  const fillers = Array.from({ length: Math.max(0, count - named.length) }, (_, index) =>
    stock(`Z${String(index).padStart(3, "0")}`),
  );
  return [...named, ...fillers].slice(0, count);
}

function factor(): FactorSummary {
  return { qualifiedCount: 2846, ranked: true, minPeerSetSize: 30 };
}

const FACTORS = { value: factor(), growth: factor(), momentum: factor() };

function currentSet(setId: string, day: number): CurrentSet {
  const date = `2026-10-${day}`;
  return {
    setId,
    classificationDate: date,
    runId: `run-of-${setId}`,
    runStartedAt: `${date}T22:30:00Z`,
    runOutcome: "succeeded",
    state: "complete",
    startedAt: `${date}T22:40:00Z`,
    endedAt: `${date}T22:46:00Z`,
    latestTradingDay: date,
    activeInstruments: 2846,
    notCurrent: false,
  };
}

const SET_1 = currentSet("s-1", 15);
const SET_2 = currentSet("s-2", 16);

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
    set: SET_1,
    later: null,
    factors: FACTORS,
    matchCount: stocks.length,
    stocks,
    unknownSymbols: [],
    nextCursor: null,
    ...overrides,
  };
}

function summary(set: CurrentSet | null, later: LaterSet | null): ClassificationSummary {
  return { neverClassified: set === null, set, later, factors: FACTORS, stocksCurrent: null };
}

function health(): HealthResponse {
  return {
    status: "ok",
    database: "reachable",
    credential_present: true,
    schema_version: 4,
    most_recent_run: null,
  } as HealthResponse;
}

const UNIVERSES: UniverseList = {
  universes: [
    {
      universeId: "u1",
      name: "Tech",
      lifecycle: "active",
      memberCount: 4,
      createdAt: "2026-10-01T15:00:00Z",
      retiredAt: null,
    },
  ],
  activeCount: 1,
  retiredCount: 0,
  nextCursor: null,
};

function evidence(symbol: string): StockEvidence {
  return {
    symbol,
    name: `${symbol} Incorporated`,
    lifecycle: "active",
    set: SET_1,
    factors: { value: cell("84"), growth: cell("61"), momentum: cell("27") },
    inputs: [],
    memberships: [],
  };
}

function savedUniverse(name: string, memberCount: number): UniverseDetail {
  return { universeId: "u-9", name, memberCount } as UniverseDetail;
}

function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
} {
  let resolve: (value: T) => void = () => undefined;
  let reject: (reason: unknown) => void = () => undefined;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

/** First-page reads answered by `page`; a later page ends the result. */
function listAnswers(page: (params: ClassificationListParams) => ClassificationList): void {
  listMock.mockImplementation(async (params = {}) =>
    params.cursor === undefined ? page(params) : list([], { nextCursor: null }),
  );
}

// --- Rendering --------------------------------------------------------------

/** The location as text, read the way E4-S5's test host reads it. */
function LocationProbe(): JSX.Element {
  const location = useLocation();
  return <span data-testid="location">{`${location.pathname}${location.search}`}</span>;
}

/** A back button: `useNavigate()(-1)`, as the browser's Back does. */
function BackProbe(): JSX.Element {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(-1)}>
      back
    </button>
  );
}

function screenAt(entries: string[], index?: number): JSX.Element {
  return (
    <MemoryRouter initialEntries={entries} initialIndex={index ?? entries.length - 1}>
      <HealthProvider>
        <ResearchScreen />
        <LocationProbe />
        <BackProbe />
      </HealthProvider>
    </MemoryRouter>
  );
}

async function flush(ms = 0): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

/** Lets every read issued on mount settle, and the reads they trigger. */
async function settle(): Promise<void> {
  for (let round = 0; round < 4; round += 1) {
    await flush();
  }
}

function setupUser(): ReturnType<typeof userEvent.setup> {
  // No delay between steps: time moves only when a test advances it.
  return userEvent.setup({ delay: null, advanceTimers: vi.advanceTimersByTime });
}

function row(symbol: string): HTMLElement {
  return screen.getByRole("rowheader", { name: symbol }).closest("tr") as HTMLElement;
}

function checkbox(symbol: string): HTMLElement {
  return screen.getByRole("checkbox", { name: CELL.selectRow(symbol) });
}

function asOfLine(): HTMLElement {
  return screen.getByTestId("as-of-line");
}

function follows(earlier: Element, later: Element): boolean {
  return Boolean(earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING);
}

function location(): string {
  return screen.getByTestId("location").textContent ?? "";
}

const FULL_URL =
  "/research?scope=u1&value.measure=percentile&value.direction=atLeast&value.value=80&momentum.measure=standardisedScore&momentum.direction=atMost&momentum.value=1.5&hide_incomplete=true&symbol=AA&sort=growth_percentile&order=desc";

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: false });
  // Testing Library's async wrapper (which user-event's actions run in) waits
  // a zero timeout after each action and advances fake timers only when it
  // sees Jest's; this gives it vitest's, so no action waits on a frozen clock.
  vi.stubGlobal("jest", { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) });
  vi.setSystemTime(new Date("2026-10-16T22:52:00Z"));
  for (const mock of [
    listMock,
    summaryMock,
    setsMock,
    evidenceMock,
    createMock,
    universesMock,
    addMock,
    healthMock,
    runsMock,
  ]) {
    mock.mockReset();
  }
  healthMock.mockResolvedValue(health());
  universesMock.mockResolvedValue(UNIVERSES);
  summaryMock.mockResolvedValue(summary(SET_1, null));
  evidenceMock.mockImplementation(async (symbol) => evidence(symbol));
  runsMock.mockResolvedValue({ runs: [], nextCursor: null });
  listAnswers(() => list(rows()));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// Implements TC-COMP-145 (T003): DAC-E4-S9-3, DAC-E4-3, AC-16.
describe("TC-COMP-145: reload and back restore the screen's state from the URL", () => {
  async function expectRestored(): Promise<void> {
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
    const filters = screen.getByRole("region", { name: REGIONS.filters });
    expect(within(filters).getByRole("textbox", { name: FILTERS.findStock })).toHaveValue("AA");
    expect(within(filters).getByRole("checkbox", { name: FILTERS.hideIncomplete })).toBeChecked();
    expect(within(filters).getByRole("combobox", { name: "Measure for value" })).toHaveValue(
      "percentile",
    );
    expect(within(filters).getByRole("combobox", { name: "Direction for value" })).toHaveValue(
      "atLeast",
    );
    expect(within(filters).getByRole("textbox", { name: "Value threshold" })).toHaveValue("80");
    expect(within(filters).getByRole("combobox", { name: "Measure for momentum" })).toHaveValue(
      "standardisedScore",
    );
    expect(within(filters).getByRole("combobox", { name: "Direction for momentum" })).toHaveValue(
      "atMost",
    );
    expect(
      within(filters).getByRole("textbox", { name: "Value threshold for momentum" }),
    ).toHaveValue("1.5");
    expect(within(filters).getByRole("combobox", { name: /^Look in: / })).toHaveValue("u1");
    expect(asOfLine()).toHaveTextContent(SCORE_SET.sortedBy(SCORE_SET.sortLabels.growth));
  }

  it("restores every key on load and again on a reload, reading no browser storage", async () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem");
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const first = render(screenAt([FULL_URL]));
    await settle();
    await expectRestored();
    const firstCall = listMock.mock.calls[0]?.[0];

    first.unmount();
    listMock.mockClear();
    render(screenAt([FULL_URL]));
    await settle();
    await expectRestored();
    expect(listMock.mock.calls[0]?.[0]).toEqual(firstCall);
    expect(getItem).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
  });

  it("returns to the earlier query on back navigation", async () => {
    const user = setupUser();
    render(screenAt(["/research", FULL_URL]));
    await settle();
    await expectRestored();

    const threshold = screen.getByRole("textbox", { name: "Value threshold" });
    await user.clear(threshold);
    await user.type(threshold, "90");
    await user.tab();
    await settle();
    expect(location()).toContain("value.value=90");
    expect(listMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ valuePercentileMin: "90" }),
    );

    listMock.mockClear();
    await user.click(screen.getByRole("button", { name: "back" }));
    await settle();
    expect(location()).toBe(FULL_URL);
    expect(screen.getByRole("textbox", { name: "Value threshold" })).toHaveValue("80");
    expect(listMock).toHaveBeenCalledTimes(1);
    expect(listMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ valuePercentileMin: "80", momentumScoreMax: "1.5" }),
    );
  });
});

// T005 (screen level): TC-COMP-099, DAC-E4-S9-5, AC-12.
describe("TC-COMP-099: the footnote appears once across the whole screen", () => {
  it("is one occurrence with a stock selected, the inspector's own footnote not counting", async () => {
    const user = setupUser();
    render(screenAt(["/research"]));
    await settle();
    await user.click(row("MSFT"));
    await flush(150);
    await settle();

    const inspector = screen.getByRole("region", { name: REGIONS.selectedStock });
    expect(within(inspector).getByText(SELECTION.footnote)).toBeInTheDocument();
    const notes = screen.getAllByText(CELL.coverageStatement);
    expect(notes).toHaveLength(1);
    expect(
      screen.getByRole("region", { name: REGIONS.results }).contains(notes[0] as HTMLElement),
    ).toBe(true);
  });
});

// T008: AC-20, AC-21, DAC-E4-4.
describe("Refresh once when a new set completes", () => {
  const SCOPED_URL =
    "/research?scope=u1&value.measure=percentile&value.direction=atLeast&value.value=80&growth.measure=percentile&growth.direction=atMost&growth.value=90&symbol=A&sort=growth_percentile&order=desc";

  async function populatedWithSelection(url: string): Promise<ReturnType<typeof setupUser>> {
    const user = setupUser();
    summaryMock.mockResolvedValue(summary(SET_1, BUILDING));
    listAnswers(() => list(rows(), { later: BUILDING }));
    render(screenAt([url]));
    await settle();
    await user.click(row("MSFT"));
    await user.click(checkbox("AAPL"));
    await user.click(checkbox("NVDA"));
    await settle();
    expect(row("MSFT")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("region", { name: REGIONS.selection })).toHaveTextContent(
      SELECTION.selected(2),
    );
    return user;
  }

  it("reloads the first page once, dimmed until it arrives, keeping every filter, selection and check", async () => {
    await populatedWithSelection(SCOPED_URL);
    expect(screen.getByTestId("not-current-banner")).toBeInTheDocument();
    expect(within(asOfLine()).getByText(SCORE_SET.updating)).toBeInTheDocument();
    expect(asOfLine()).toHaveTextContent(
      SCORE_SET.checked(formatTimestamp("2026-10-16T22:52:00.000Z", { seconds: true })),
    );
    const before = listMock.mock.calls.length;
    const firstParams = listMock.mock.calls[0]?.[0];

    const held = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(held.promise);
    summaryMock.mockResolvedValue(summary(SET_2, null));
    await flush(10_000);
    await flush();

    expect(listMock).toHaveBeenCalledTimes(before + 1);
    expect(listMock).toHaveBeenLastCalledWith(firstParams);
    expect(screen.queryByTestId("not-current-banner")).toBeNull();
    expect(within(asOfLine()).queryByText(SCORE_SET.updating)).toBeNull();
    // The new set is named only once its rows are on screen.
    expect(asOfLine()).toHaveTextContent(formatTimestamp(SET_1.endedAt));
    const body = screen.getAllByRole("rowgroup")[1] as HTMLElement;
    expect(body).toHaveClass("opacity-60");
    expect(row("MSFT")).toBeInTheDocument();

    await act(async () => {
      held.resolve(list(rows(), { set: SET_2 }));
    });
    await settle();
    expect(asOfLine()).toHaveTextContent(formatTimestamp(SET_2.endedAt));
    expect(asOfLine()).not.toHaveTextContent(formatTimestamp(SET_1.endedAt));
    const announcement = SCORE_SET.scoresUpdatedTo(
      formatTimestamp(SET_2.endedAt),
      formatTimestamp(SET_2.runStartedAt),
    );
    expect(screen.getAllByText(announcement)).toHaveLength(1);
    expect(screen.getByText(announcement).closest("output")).toHaveAttribute("aria-live", "polite");
    expect(row("MSFT")).toHaveAttribute("aria-selected", "true");
    expect(checkbox("AAPL")).toBeChecked();
    expect(checkbox("NVDA")).toBeChecked();
    expect(screen.getByRole("region", { name: REGIONS.selection })).toHaveTextContent(
      SELECTION.selected(2),
    );
    expect(location()).toBe(SCOPED_URL);

    const reads = summaryMock.mock.calls.length;
    await flush(30_000);
    expect(listMock).toHaveBeenCalledTimes(before + 1);
    expect(summaryMock).toHaveBeenCalledTimes(reads);
  });

  it("does not reload for a summary reporting the same set", async () => {
    await populatedWithSelection(SCOPED_URL);
    const before = listMock.mock.calls.length;
    await flush(10_000);
    await flush(10_000);
    expect(summaryMock.mock.calls.length).toBeGreaterThanOrEqual(3);
    expect(listMock).toHaveBeenCalledTimes(before);
  });

  it("does not reload for a failed attempt, which shows the critical banner", async () => {
    await populatedWithSelection(SCOPED_URL);
    const before = listMock.mock.calls.length;
    summaryMock.mockResolvedValue(summary(SET_1, FAILED));
    await flush(10_000);
    await settle();
    expect(listMock).toHaveBeenCalledTimes(before);
    const banner = screen.getByTestId("not-current-banner");
    expect(within(banner).getByText(SCORE_SET.scoreUpdateFailed)).toHaveAttribute(
      "data-variant",
      "status-critical",
    );
    expect(banner).toHaveTextContent("Factor engine could not read prices");
  });

  it("keeps the banner and rows after a failed poll, and Try again reads once", async () => {
    const user = await populatedWithSelection(SCOPED_URL);
    summaryMock.mockRejectedValue(new TypeError("Failed to fetch"));
    await flush(10_000);
    await settle();
    expect(asOfLine()).toHaveTextContent(SCORE_SET.couldNotCheck);
    expect(screen.getByTestId("not-current-banner")).toBeInTheDocument();
    expect(row("MSFT")).toBeInTheDocument();

    const reads = summaryMock.mock.calls.length;
    summaryMock.mockResolvedValue(summary(SET_1, BUILDING));
    await user.click(within(asOfLine()).getByRole("button", { name: RESULTS.tryAgain }));
    await settle();
    expect(summaryMock).toHaveBeenCalledTimes(reads + 1);
    expect(asOfLine()).not.toHaveTextContent(SCORE_SET.couldNotCheck);
  });

  it("saves with the list's set id across the refresh, never the summary's", async () => {
    const SCOPE_FREE_URL =
      "/research?value.measure=percentile&value.direction=atLeast&value.value=80&growth.measure=percentile&growth.direction=atMost&growth.value=90&symbol=A&sort=growth_percentile&order=desc";
    const user = setupUser();
    summaryMock.mockResolvedValue(summary(SET_1, BUILDING));
    listAnswers(() => list(rows(), { later: BUILDING, matchCount: 120, nextCursor: "c1" }));
    render(screenAt([SCOPE_FREE_URL]));
    await settle();
    expect(screen.getByRole("button", { name: RESULTS.saveThese(120) })).toBeInTheDocument();

    const held = deferred<ClassificationList>();
    listMock.mockReturnValueOnce(held.promise);
    summaryMock.mockResolvedValue(summary(SET_2, null));
    await flush(10_000);
    await flush();

    createMock.mockRejectedValueOnce(
      new ClassificationApiError("the set changed", "req-1", {
        code: "classification_set_changed",
        operation: "create-universe",
        resource: "universe",
      }),
    );
    await user.click(screen.getByRole("button", { name: RESULTS.saveThese(120) }));
    await user.type(screen.getByRole("textbox", { name: DIALOGS.name }), "Tech leaders");
    await user.click(screen.getByRole("button", { name: DIALOGS.save }));
    await settle();
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenNthCalledWith(1, expect.objectContaining({ setId: "s-1" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("alert")).toHaveTextContent(DIALOGS.setChanged);
    expect(within(dialog).queryByRole("button", { name: DIALOGS.save })).toBeNull();
    await user.click(within(dialog).getByRole("button", { name: DIALOGS.reviewNewResult }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(createMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      held.resolve(list(rows(), { set: SET_2, matchCount: 118, nextCursor: "c1" }));
    });
    await settle();
    createMock.mockResolvedValueOnce(savedUniverse("Tech leaders 2", 118));
    await user.click(screen.getByRole("button", { name: RESULTS.saveThese(118) }));
    await user.type(screen.getByRole("textbox", { name: DIALOGS.name }), "Tech leaders 2");
    await user.click(screen.getByRole("button", { name: DIALOGS.save }));
    await settle();
    expect(createMock).toHaveBeenNthCalledWith(2, expect.objectContaining({ setId: "s-2" }));
    expect(createMock).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

// T009: AC-9, AC-16, DAC-E4-4.
describe("Screen wiring: selection, inspector, tray, dialogs and notices", () => {
  it("(a) reads the selected stock once, 150 ms after the selection settles", async () => {
    const user = setupUser();
    render(screenAt(["/research"]));
    await settle();

    await user.click(row("AAPL"));
    await flush(149);
    expect(evidenceMock).not.toHaveBeenCalled();
    await flush(1);
    expect(evidenceMock).toHaveBeenCalledTimes(1);
    expect(evidenceMock).toHaveBeenLastCalledWith("AAPL");

    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}");
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}");
    await flush(150);
    await settle();
    expect(evidenceMock).toHaveBeenCalledTimes(2);
    const tenth = rows()[10]?.symbol as string;
    expect(evidenceMock).toHaveBeenLastCalledWith(tenth);
    expect(row(tenth)).toHaveAttribute("aria-selected", "true");
  });

  it("(b) keeps checked and selected rows apart, by symbol, across sort, threshold and scope", async () => {
    const user = setupUser();
    render(screenAt(["/research"]));
    await settle();

    await user.click(checkbox("AAPL"));
    await user.click(checkbox("MSFT"));
    const tray = screen.getByRole("region", { name: REGIONS.selection });
    expect(tray).toHaveTextContent(SELECTION.selected(2));
    expect(within(tray).getByRole("link", { name: SELECTION.compareSideBySide })).toHaveAttribute(
      "href",
      "/research/compare?symbols=AAPL,MSFT",
    );
    expect(row("AAPL")).toHaveAttribute("aria-selected", "false");

    await user.click(row("NVDA"));
    expect(checkbox("NVDA")).not.toBeChecked();
    expect(row("NVDA")).toHaveAttribute("aria-selected", "true");

    await user.click(screen.getByRole("button", { name: SORT.byPercentile("value") }));
    await settle();
    const threshold = screen.getByRole("textbox", { name: "Value threshold" });
    await user.type(threshold, "10");
    await user.tab();
    await settle();
    await user.selectOptions(screen.getByRole("combobox", { name: /^Look in: / }), "u1");
    await settle();
    expect(location()).toContain("scope=u1");
    expect(location()).toContain("value.value=10");
    expect(location()).toContain("sort=value_percentile");
    expect(row("NVDA")).toHaveAttribute("aria-selected", "true");
    expect(checkbox("AAPL")).toBeChecked();
    expect(checkbox("MSFT")).toBeChecked();
    expect(screen.getByRole("region", { name: REGIONS.selection })).toHaveTextContent(
      SELECTION.selected(2),
    );

    await user.click(checkbox("MSFT"));
    const blocked = screen.getByRole("button", { name: SELECTION.compareSideBySide });
    expect(blocked).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText(SELECTION.compareBlocked)).toBeInTheDocument();
  });

  it("(c) opens Add to universe… with the checked symbols and notifies once on success", async () => {
    const user = setupUser();
    addMock.mockResolvedValue({ added: ["MSFT", "AAPL"], alreadyMember: [] });
    render(screenAt(["/research"]));
    await settle();
    await user.click(checkbox("MSFT"));
    await user.click(checkbox("AAPL"));

    const addAction = screen.getByRole("button", { name: SELECTION.addToUniverse });
    await user.click(addAction);
    await settle();
    expect(screen.getByRole("dialog", { name: DIALOGS.addTitle(2) })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: DIALOGS.add }));
    await settle();

    expect(addMock).toHaveBeenCalledWith("u1", ["MSFT", "AAPL"]);
    expect(screen.queryByRole("dialog")).toBeNull();
    const notice = screen.getByRole("link", { name: DIALOGS.added(2, "Tech", 0) });
    expect(notice).toHaveAttribute("href", universePath("u1"));
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: SELECTION.addToUniverse }),
    );
    expect(checkbox("MSFT")).toBeChecked();
    expect(checkbox("AAPL")).toBeChecked();
  });

  it("(d) stacks the Add and Save notices in one region, and Dismiss removes only its own", async () => {
    const user = setupUser();
    addMock.mockResolvedValue({ added: ["AAPL", "MSFT"], alreadyMember: [] });
    createMock.mockResolvedValue(savedUniverse("Value picks", 50));
    render(screenAt(["/research"]));
    await settle();

    await user.click(checkbox("AAPL"));
    await user.click(checkbox("MSFT"));
    await user.click(screen.getByRole("button", { name: SELECTION.addToUniverse }));
    await settle();
    await user.click(screen.getByRole("button", { name: DIALOGS.add }));
    await settle();
    await user.click(screen.getByRole("button", { name: RESULTS.saveThese(50) }));
    await user.type(screen.getByRole("textbox", { name: DIALOGS.name }), "Value picks");
    await user.click(screen.getByRole("button", { name: DIALOGS.save }));
    await settle();

    const added = screen.getByRole("link", { name: DIALOGS.added(2, "Tech", 0) });
    const saved = screen.getByRole("link", { name: DIALOGS.saved(50, "Value picks") });
    const region = added.closest("output") as HTMLElement;
    expect(region).not.toBeNull();
    expect(saved.closest("output")).toBe(region);
    const regions = screen
      .getAllByRole("status")
      .filter((status) => status.querySelector("[data-variant='success']") !== null);
    expect(regions).toEqual([region]);
    // The screen's live regions: the notices, the table's count and the as-of line's.
    const statuses = screen.getAllByRole("status");
    expect(statuses).toHaveLength(3);
    expect(statuses).toContain(region);
    expect(statuses).toContain(screen.getByTestId("as-of-line-status"));
    expect(
      statuses.filter((status) => status.textContent === RESULTS.stocksMatch(50)),
    ).toHaveLength(1);

    await user.click(
      within(region).getAllByRole("button", { name: NOTICES.dismiss })[0] as HTMLElement,
    );
    expect(screen.queryByRole("link", { name: DIALOGS.added(2, "Tech", 0) })).toBeNull();
    expect(
      screen.getByRole("link", { name: DIALOGS.saved(50, "Value picks") }),
    ).toBeInTheDocument();
  });

  it("(e) offers Save for the server's count without a scope, and not under one", async () => {
    const user = setupUser();
    listAnswers((params) =>
      list(rows(3), { matchCount: params.universeId ? 4 : 12, nextCursor: "c1" }),
    );
    createMock.mockResolvedValue(savedUniverse("Dozen", 12));
    render(screenAt(["/research"]));
    await settle();

    await user.click(screen.getByRole("button", { name: RESULTS.saveThese(12) }));
    await user.type(screen.getByRole("textbox", { name: DIALOGS.name }), "Dozen");
    await user.click(screen.getByRole("button", { name: DIALOGS.save }));
    await settle();
    expect(screen.getByRole("link", { name: DIALOGS.saved(12, "Dozen") })).toHaveAttribute(
      "href",
      universePath("u-9"),
    );

    await user.selectOptions(screen.getByRole("combobox", { name: /^Look in: / }), "u1");
    await settle();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(RESULTS.stocksMatch(4));
    expect(screen.queryByRole("button", { name: /^Save these/ })).toBeNull();
  });

  it("(f) opens Earlier sets over the screen and closes it without disturbing it", async () => {
    const user = setupUser();
    setsMock.mockResolvedValue({ sets: [], nextCursor: null });
    render(screenAt(["/research"]));
    await settle();
    await user.click(row("NVDA"));
    await user.click(checkbox("AAPL"));
    const reads = listMock.mock.calls.length;

    await user.click(within(asOfLine()).getByRole("button", { name: SCORE_SET.earlierSetsAction }));
    await settle();
    expect(screen.getByRole("dialog", { name: SCORE_SET.earlierSetsTitle })).toBeInTheDocument();
    expect(setsMock).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: SCORE_SET.close }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(
      within(asOfLine()).getByRole("button", { name: SCORE_SET.earlierSetsAction }),
    );
    expect(row("NVDA")).toHaveAttribute("aria-selected", "true");
    expect(checkbox("AAPL")).toBeChecked();
    expect(listMock).toHaveBeenCalledTimes(reads);
  });

  it("(g) keeps a selection the result no longer holds, in the inspector only", async () => {
    const user = setupUser();
    listAnswers((params) => list(params.symbol === "A" ? [stock("AAPL")] : rows()));
    render(screenAt(["/research"]));
    await settle();
    await user.click(row("MSFT"));
    await flush(150);
    await settle();

    const find = screen.getByRole("textbox", { name: FILTERS.findStock });
    await user.type(find, "a{Enter}");
    await settle();
    expect(screen.queryByRole("rowheader", { name: "MSFT" })).toBeNull();
    expect(
      screen.getAllByRole("row").filter((tr) => tr.getAttribute("aria-selected") === "true"),
    ).toHaveLength(0);
    const inspector = screen.getByRole("region", { name: REGIONS.selectedStock });
    expect(inspector).toHaveTextContent("MSFT");
    expect(evidenceMock).toHaveBeenCalledTimes(1);
  });

  it("(h) renders the table from the list when the first summary read fails", async () => {
    summaryMock.mockRejectedValue(new TypeError("Failed to fetch"));
    render(screenAt(["/research"]));
    await settle();
    expect(row("AAPL")).toBeInTheDocument();
    expect(asOfLine()).toHaveTextContent(SCORE_SET.couldNotCheck);
    expect(within(asOfLine()).getByRole("button", { name: RESULTS.tryAgain })).toBeInTheDocument();
  });

  it("(i) clears every filter from the nothing-found body, keeping the sort", async () => {
    const user = setupUser();
    listAnswers((params) => (params.symbol === "QQ" ? list([], { matchCount: 0 }) : list(rows())));
    render(
      screenAt([
        "/research?scope=u1&value.measure=percentile&value.direction=atLeast&value.value=80&hide_incomplete=true&symbol=QQ&sort=value_percentile&order=desc",
      ]),
    );
    await settle();
    const results = screen.getByRole("region", { name: REGIONS.results });
    await user.click(within(results).getByRole("button", { name: FILTERS.clearFilters }));
    await settle();
    expect(location()).toBe("/research?sort=value_percentile&order=desc");
    expect(row("AAPL")).toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByRole("heading", { level: 1 }));
  });

  it("(j) counts the followed stocks in Look in from the list's set", async () => {
    listAnswers(() => list(rows(), { set: { ...SET_1, activeInstruments: 2900 } }));
    render(screenAt(["/research"]));
    await settle();
    expect(
      screen.getByRole("option", { name: FILTERS.allFollowedStocksOption(2900) }),
    ).toBeInTheDocument();
  });

  it("calls useNotices and mounts the notice region once, with no fetch, timer or storage of its own", () => {
    const source = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), "index.tsx"),
      "utf-8",
    );
    expect(source.split("useNotices(").length - 1).toBe(1);
    expect(source.split("<NoticeRegion").length - 1).toBe(1);
    expect(source.split("useScoreSetPoll(").length - 1).toBe(1);
    expect(source.split("useResearchQuery(").length - 1).toBe(1);
    expect(source).not.toMatch(/\bfetch\(|setTimeout|setInterval|localStorage|sessionStorage/);
    expect(source).not.toMatch(/window\.location|dangerouslySetInnerHTML/);
    expect(source).not.toContain(RESULTS.noMatch);
    expect(source).not.toContain(RESULTS.neverScored);
  });
});

// --- The never-populated body (T001, T007) ----------------------------------

const NEVER_BUILDING: LaterSet = {
  setId: "s-1",
  state: "building",
  startedAt: "2026-10-15T22:40:00Z",
  endedAt: null,
  failureReason: null,
  runId: "r0",
  runStartedAt: "2026-10-15T22:30:00Z",
};

const NEVER_FAILED: LaterSet = {
  ...NEVER_BUILDING,
  state: "failed",
  endedAt: "2026-10-15T23:03:00Z",
  failureReason: "Factor engine could not read prices",
};

function neverPopulated(later: LaterSet | null): ClassificationList {
  return list([], { neverClassified: true, set: null, later, matchCount: 0 });
}

function acquisitionRun(state: RunState, overrides: Partial<AcquisitionRun> = {}): AcquisitionRun {
  const ended = !["requested", "running", "cancelling"].includes(state);
  return {
    runId: "r1",
    state,
    historyDepthYears: 5,
    requestedAt: "2026-10-15T22:28:00Z",
    startedAt: "2026-10-15T22:30:00Z",
    endedAt: ended ? "2026-10-15T23:10:00Z" : null,
    instrumentsNamed: 10,
    instrumentsWritten: 10,
    instrumentsFailed: 0,
    failureReason: state === "failed" ? "Provider refused the credential" : null,
    ...overrides,
  };
}

function healthWith(latest: { run_id: string; state: RunState } | null): HealthResponse {
  return {
    ...health(),
    most_recent_run: latest === null ? null : { ...latest, ended_at: null },
  } as HealthResponse;
}

function neverStore(later: LaterSet | null, latest: AcquisitionRun | null): void {
  listAnswers(() => neverPopulated(later));
  summaryMock.mockResolvedValue(summary(null, later));
  runsMock.mockResolvedValue({ runs: latest === null ? [] : [latest], nextCursor: null });
}

function body(): HTMLElement {
  return screen.getByTestId("never-populated-body");
}

const STARTED = formatTimestamp("2026-10-15T22:30:00Z");
const ENDED = formatTimestamp("2026-10-15T23:10:00Z");

// Implements TC-COMP-185 (T001): DAC-E4-S9-1, DAC-E4-2, AC-22.
describe("TC-COMP-185: the never-populated body is distinct from the no-match state", () => {
  function expectNoTable(): void {
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryAllByRole("row")).toHaveLength(0);
    expect(screen.queryByTestId("as-of-line")).toBeNull();
    expect(screen.queryByText(/Scores from/)).toBeNull();
    expect(screen.queryByRole("button", { name: /^Save these/ })).toBeNull();
    expect(screen.queryByText(RESULTS.noMatch)).toBeNull();
    expect(within(body()).queryByRole("button", { name: FILTERS.clearFilters })).toBeNull();
  }

  it("states that nothing is scored, the first set building, and the latest download", async () => {
    neverStore(NEVER_BUILDING, acquisitionRun("running"));
    render(screenAt(["/research"]));
    await settle();

    const parts = body().children;
    expect(parts[0]?.textContent).toBe(RESULTS.neverScored);
    const badge = within(body()).getByText(SCORE_SET.updating);
    expect(badge).toHaveAttribute("data-variant", "status-active");
    const building = RESULTS.firstSetBuilding(formatTimestamp(NEVER_BUILDING.runStartedAt));
    expect(building).toBe(
      "The first set of scores is being produced from the download started 2026-10-15 17:30 CDT.",
    );
    expect(body()).toHaveTextContent(building);
    const latest = screen.getByTestId("latest-download");
    expect(latest.textContent).toBe(RESULTS.latestDownloadRunning(STARTED));
    expect(
      within(latest).getByRole("link", { name: SCORE_SET.openDownload(STARTED) }),
    ).toHaveAttribute("href", SHELL_ROUTES.download("r1"));
    expect(within(body()).getByRole("link", { name: RESULTS.openDataHealth })).toHaveAttribute(
      "href",
      SHELL_ROUTES.dataHealth,
    );
    expect(follows(badge, latest)).toBe(true);
    expect(within(body()).queryByRole("button", { name: RESULTS.tryAgain })).toBeNull();
    expectNoTable();
  });

  it("shows a failed first set's reason, offering nothing to retry", async () => {
    neverStore(NEVER_FAILED, acquisitionRun("running"));
    render(screenAt(["/research"]));
    await settle();

    expect(within(body()).getByText(SCORE_SET.scoreUpdateFailed)).toHaveAttribute(
      "data-variant",
      "status-critical",
    );
    expect(body()).toHaveTextContent(
      RESULTS.firstSetFailed(
        formatTimestamp(NEVER_FAILED.endedAt as string),
        "Factor engine could not read prices",
      ),
    );
    expect(within(body()).queryByRole("button")).toBeNull();
    expectNoTable();
  });

  it("states only that nothing is scored, and the download, while no set has started", async () => {
    neverStore(null, acquisitionRun("running"));
    render(screenAt(["/research"]));
    await settle();

    expect(body().children[0]?.textContent).toBe(RESULTS.neverScored);
    expect(within(body()).queryByText(SCORE_SET.updating)).toBeNull();
    expect(within(body()).queryByText(SCORE_SET.scoreUpdateFailed)).toBeNull();
    expect(screen.getByTestId("latest-download")).toBeInTheDocument();
    expectNoTable();
  });

  it("is a different body from nothing found under a filter", async () => {
    listAnswers(() => list([], { matchCount: 0 }));
    render(screenAt(["/research?value.measure=percentile&value.direction=atLeast&value.value=99"]));
    await settle();
    const results = screen.getByRole("region", { name: REGIONS.results });
    expect(within(results).getByText(RESULTS.noMatch)).toBeInTheDocument();
    expect(within(results).getByRole("button", { name: FILTERS.clearFilters })).toBeInTheDocument();
    expect(results).not.toHaveTextContent(RESULTS.neverScored);
    expect(within(results).queryByText(SCORE_SET.updating)).toBeNull();
    expect(screen.queryByTestId("latest-download")).toBeNull();
    expect(screen.queryByTestId("never-populated-body")).toBeNull();
  });
});

// T007: AC-20, AC-22, DAC-E4-2, DAC-E4-S9-1; DEC-0155, DEC-0171.
describe("Never-populated details", () => {
  it("(a) reads one sentence per download state, its start time always the link", async () => {
    const cases: [AcquisitionRun, string][] = [
      [
        acquisitionRun("requested", { startedAt: null }),
        RESULTS.latestDownloadRunning(formatTimestamp("2026-10-15T22:28:00Z")),
      ],
      [acquisitionRun("running"), RESULTS.latestDownloadRunning(STARTED)],
      [acquisitionRun("cancelling"), RESULTS.latestDownloadCancelling(STARTED)],
      [acquisitionRun("succeeded"), RESULTS.latestDownloadComplete(STARTED, ENDED)],
      [acquisitionRun("partial"), RESULTS.latestDownloadPartial(STARTED, ENDED)],
      [
        acquisitionRun("failed"),
        RESULTS.latestDownloadFailed(STARTED, ENDED, "Provider refused the credential"),
      ],
      [acquisitionRun("cancelled"), RESULTS.latestDownloadCancelled(STARTED, ENDED)],
      [acquisitionRun("abandoned"), RESULTS.latestDownloadAbandoned(STARTED, ENDED)],
    ];
    expect(RESULTS.latestDownloadCancelling("T")).toBe(
      "The latest download, started T, is Cancelling",
    );
    expect(RESULTS.latestDownloadPartial("T", "U")).toBe(
      "The latest download, started T, ended Partial at U",
    );
    expect(RESULTS.latestDownloadCancelled("T", "U")).toBe(
      "The latest download, started T, ended Cancelled at U",
    );
    expect(RESULTS.latestDownloadAbandoned("T", "U")).toBe(
      "The latest download, started T, ended Abandoned at U",
    );
    for (const [latest, sentence] of cases) {
      neverStore(NEVER_BUILDING, latest);
      const view = render(screenAt(["/research"]));
      await settle();
      const line = screen.getByTestId("latest-download");
      expect(line.textContent).toBe(sentence);
      const started = formatTimestamp(latest.startedAt ?? latest.requestedAt);
      const link = within(line).getByRole("link", { name: SCORE_SET.openDownload(started) });
      expect(link).toHaveAttribute("href", SHELL_ROUTES.download("r1"));
      expect(link.textContent).toBe(started);
      if (latest.state !== "succeeded") {
        expect(line.textContent).not.toContain("ended Complete");
      }
      expect(runsMock).toHaveBeenLastCalledWith({ limit: 1 });
      view.unmount();
    }
  });

  it("(b) reads the latest download again only when the download or the first set changes", async () => {
    neverStore(NEVER_BUILDING, acquisitionRun("running"));
    healthMock.mockResolvedValue(healthWith({ run_id: "r1", state: "running" }));
    render(screenAt(["/research"]));
    await settle();
    expect(runsMock).toHaveBeenCalledTimes(1);

    // 10-second polls with nothing changed: no further read.
    await flush(10_000);
    await flush(10_000);
    await settle();
    expect(runsMock).toHaveBeenCalledTimes(1);

    // The 30-second health poll reports the download ended.
    runsMock.mockResolvedValue({ runs: [acquisitionRun("succeeded")], nextCursor: null });
    healthMock.mockResolvedValue(healthWith({ run_id: "r1", state: "succeeded" }));
    await flush(10_000);
    await settle();
    expect(runsMock).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId("latest-download").textContent).toBe(
      RESULTS.latestDownloadComplete(STARTED, ENDED),
    );

    // The first set fails: read again.
    summaryMock.mockResolvedValue(summary(null, NEVER_FAILED));
    await flush(10_000);
    await settle();
    expect(runsMock).toHaveBeenCalledTimes(3);
    await flush(30_000);
    await settle();
    expect(runsMock).toHaveBeenCalledTimes(3);
  });

  it("(b) does not read again when the shell's health first arrives", async () => {
    neverStore(NEVER_BUILDING, acquisitionRun("running"));
    const firstHealth = deferred<HealthResponse>();
    healthMock.mockReturnValueOnce(firstHealth.promise);
    render(screenAt(["/research"]));
    await settle();
    expect(screen.getByTestId("latest-download")).toBeInTheDocument();
    expect(runsMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      firstHealth.resolve(healthWith({ run_id: "r1", state: "running" }));
    });
    await settle();
    expect(runsMock).toHaveBeenCalledTimes(1);
  });

  it("(b) shows the newest read's download when an older read lands late", async () => {
    neverStore(NEVER_BUILDING, acquisitionRun("running"));
    healthMock.mockResolvedValue(healthWith({ run_id: "r1", state: "running" }));
    render(screenAt(["/research"]));
    await settle();

    const older = deferred<{ runs: AcquisitionRun[]; nextCursor: string | null }>();
    runsMock
      .mockReturnValueOnce(older.promise)
      .mockResolvedValueOnce({ runs: [acquisitionRun("failed")], nextCursor: null });
    healthMock.mockResolvedValue(healthWith({ run_id: "r1", state: "cancelling" }));
    await flush(30_000);
    await settle();
    summaryMock.mockResolvedValue(summary(null, NEVER_FAILED));
    await flush(10_000);
    await settle();
    expect(runsMock).toHaveBeenCalledTimes(3);
    const failedLine = RESULTS.latestDownloadFailed(
      STARTED,
      ENDED,
      "Provider refused the credential",
    );
    expect(screen.getByTestId("latest-download").textContent).toBe(failedLine);

    await act(async () => {
      older.resolve({ runs: [acquisitionRun("cancelling")], nextCursor: null });
    });
    await settle();
    expect(screen.getByTestId("latest-download").textContent).toBe(failedLine);
  });

  it("(c) omits the line when a later read fails, rather than keep an old state", async () => {
    neverStore(NEVER_BUILDING, acquisitionRun("running"));
    healthMock.mockResolvedValue(healthWith({ run_id: "r1", state: "running" }));
    render(screenAt(["/research"]));
    await settle();
    expect(screen.getByTestId("latest-download")).toBeInTheDocument();

    runsMock.mockRejectedValue(new TypeError("Failed to fetch"));
    summaryMock.mockResolvedValue(summary(null, NEVER_FAILED));
    await flush(10_000);
    await settle();
    expect(runsMock).toHaveBeenCalledTimes(2);
    expect(screen.queryByTestId("latest-download")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("(c) omits the line, and shows no error, with no download or a failed read", async () => {
    neverStore(NEVER_BUILDING, null);
    const view = render(screenAt(["/research"]));
    await settle();
    expect(screen.queryByTestId("latest-download")).toBeNull();
    expect(body().children[0]?.textContent).toBe(RESULTS.neverScored);
    expect(within(body()).getByText(SCORE_SET.updating)).toBeInTheDocument();
    expect(within(body()).getByRole("link", { name: RESULTS.openDataHealth })).toBeInTheDocument();
    view.unmount();

    neverStore(NEVER_BUILDING, null);
    runsMock.mockRejectedValue(new TypeError("Failed to fetch"));
    render(screenAt(["/research"]));
    await settle();
    expect(screen.queryByTestId("latest-download")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(body()).not.toHaveTextContent("Failed to fetch");
    expect(within(body()).getByRole("link", { name: RESULTS.openDataHealth })).toBeInTheDocument();
  });

  it("(d) takes the first set's state from later, never from the download", async () => {
    neverStore(NEVER_FAILED, acquisitionRun("running"));
    render(screenAt(["/research"]));
    await settle();
    expect(within(body()).getByText(SCORE_SET.scoreUpdateFailed)).toBeInTheDocument();
    expect(within(body()).queryByText(SCORE_SET.updating)).toBeNull();
  });

  it("(e) leaves the Filters pane live, commits Find a stock on Enter, and the inspector empty", async () => {
    const user = setupUser();
    neverStore(NEVER_BUILDING, acquisitionRun("running"));
    render(screenAt(["/research"]));
    await settle();

    const filters = screen.getByRole("region", { name: REGIONS.filters });
    for (const control of [
      ...within(filters).getAllByRole("textbox"),
      ...within(filters).getAllByRole("combobox"),
      ...within(filters).getAllByRole("checkbox"),
    ]) {
      expect(control).not.toBeDisabled();
      expect(control).not.toHaveAttribute("aria-disabled", "true");
      expect(control.closest("[inert]")).toBeNull();
    }
    const find = within(filters).getByRole("textbox", { name: FILTERS.findStock });
    await user.type(find, "aa");
    expect(location()).toBe("/research");
    await user.keyboard("{Enter}");
    await settle();
    expect(location()).toBe("/research?symbol=AA");
    expect(
      within(screen.getByRole("region", { name: REGIONS.selectedStock })).getByText(
        SELECTION.inspectorEmpty,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: REGIONS.selection })).toBeNull();
  });

  it("(f) refreshes into the populated table when the first set completes, without a reload", async () => {
    neverStore(NEVER_BUILDING, acquisitionRun("succeeded"));
    render(screenAt(["/research"]));
    await settle();
    expect(body()).toBeInTheDocument();

    listAnswers(() => list(rows()));
    summaryMock.mockResolvedValue(summary(SET_1, null));
    await flush(10_000);
    await settle();
    expect(screen.queryByTestId("never-populated-body")).toBeNull();
    expect(row("AAPL")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(RESULTS.stocksMatch(50));
    expect(location()).toBe("/research");
  });

  it("(g) offers Try again after a failed poll, then refreshes when it finds the first set", async () => {
    const user = setupUser();
    neverStore(NEVER_BUILDING, acquisitionRun("succeeded"));
    render(screenAt(["/research"]));
    await settle();
    const status = within(body()).getByRole("status");
    expect(status.textContent).toBe("");

    summaryMock.mockRejectedValue(new TypeError("Failed to fetch"));
    await flush(10_000);
    await settle();
    expect(body().children[0]?.textContent).toBe(RESULTS.neverScored);
    expect(within(body()).getByText(SCORE_SET.updating)).toBeInTheDocument();
    expect(status.textContent).toBe(SCORE_SET.couldNotCheck);
    const tryAgain = within(body()).getByRole("button", { name: RESULTS.tryAgain });
    expect(status.contains(tryAgain)).toBe(false);
    expect(tryAgain).toHaveClass("rounded", "border", "border-border", "px-2", "py-1", "text-xs");
    const building = within(body()).getByText(SCORE_SET.updating);
    expect(follows(building, tryAgain)).toBe(true);
    expect(follows(tryAgain, screen.getByTestId("latest-download"))).toBe(true);

    const reads = summaryMock.mock.calls.length;
    await flush(30_000);
    expect(summaryMock).toHaveBeenCalledTimes(reads);

    summaryMock.mockResolvedValue(summary(SET_1, null));
    listAnswers(() => list(rows()));
    await user.click(tryAgain);
    await settle();
    expect(summaryMock).toHaveBeenCalledTimes(reads + 1);
    expect(screen.queryByText(SCORE_SET.couldNotCheck)).toBeNull();
    expect(screen.queryByTestId("never-populated-body")).toBeNull();
    expect(row("AAPL")).toBeInTheDocument();
  });

  it("(g) offers Try again when the first summary read itself fails", async () => {
    const user = setupUser();
    neverStore(NEVER_BUILDING, acquisitionRun("running"));
    summaryMock.mockRejectedValue(new TypeError("Failed to fetch"));
    render(screenAt(["/research"]));
    await settle();
    expect(within(body()).getByRole("status").textContent).toBe(SCORE_SET.couldNotCheck);
    expect(within(body()).getByText(SCORE_SET.updating)).toBeInTheDocument();

    const reads = summaryMock.mock.calls.length;
    await user.click(within(body()).getByRole("button", { name: RESULTS.tryAgain }));
    await settle();
    expect(summaryMock).toHaveBeenCalledTimes(reads + 1);
  });
});
