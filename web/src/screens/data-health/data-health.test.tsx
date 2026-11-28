import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  ApiUnreachableError,
  fetchHealth,
  getHistoryDepth,
  listAcquisitionRuns,
  listInstruments,
  retireInstrument,
  startAcquisitionRun,
} from "../../api/client";
import type { AcquisitionRun, DataType, HealthResponse, RunState } from "../../api/types";
import { HealthProvider } from "../../app/health";
import { LAYOUT } from "../../app/layout";
import {
  fetchAttention,
  fetchDataHealth,
  fetchProblems,
  fetchScoreSummary,
} from "../../app/shell-client";
import { ShellProvider } from "../../app/shell-context";
import type {
  Attention,
  DataHealth,
  Failure,
  LatestDownload,
  LatestTerminalDownload,
  ProblemRow,
  ScoreSummary,
} from "../../app/shell-types";
import {
  FOLLOW_FIRST,
  NO_DATA_YET,
  OPEN_SETUP,
  START_FIRST_DOWNLOAD,
  downloadForFollowed,
} from "./copy";
import DataHealthScreen from "./index";

vi.mock("../../app/shell-client", async (importActual) => ({
  ...(await importActual<typeof import("../../app/shell-client")>()),
  fetchAttention: vi.fn(),
  fetchScoreSummary: vi.fn(),
  fetchDataHealth: vi.fn(),
  fetchProblems: vi.fn(),
}));

vi.mock("../../api/client", async (importActual) => ({
  ...(await importActual<typeof import("../../api/client")>()),
  fetchHealth: vi.fn(),
  listAcquisitionRuns: vi.fn(),
  listInstruments: vi.fn(),
  getHistoryDepth: vi.fn(),
  startAcquisitionRun: vi.fn(),
  retireInstrument: vi.fn(),
}));

const attentionMock = vi.mocked(fetchAttention);
const summaryMock = vi.mocked(fetchScoreSummary);
const healthReadMock = vi.mocked(fetchDataHealth);
const problemsMock = vi.mocked(fetchProblems);
const apiHealthMock = vi.mocked(fetchHealth);
const runsMock = vi.mocked(listAcquisitionRuns);
const instrumentsMock = vi.mocked(listInstruments);
const depthMock = vi.mocked(getHistoryDepth);
const startMock = vi.mocked(startAcquisitionRun);
const retireMock = vi.mocked(retireInstrument);

/** The display-vocabulary terms DAC-E7-3 forbids in anything the owner reads. */
const TERMS = /\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i;

const INTERNAL = new ApiError("instrument table said no", "req-9f3", { code: "internal_error" });
const UNREACHABLE = new ApiUnreachableError("fetch failed");

const fetchSpy = vi.fn();

function HEALTH(present: boolean): HealthResponse {
  return {
    status: "ok",
    database: "reachable",
    credential_present: present,
    schema_version: 3,
    most_recent_run: null,
  };
}

function ATT(over: Partial<Attention> = {}): Attention {
  return {
    checked_at: "2026-10-30T19:03:00Z",
    followed_count: 12,
    prices_as_of: "2026-10-29",
    credential_present: true,
    problems: { stock_count: 0, symbols: [], newest_completed_at: null },
    latest_download: {
      run_id: "r-9",
      state: "succeeded",
      requested_at: "2026-10-30T13:59:00Z",
      started_at: "2026-10-30T14:00:00Z",
      ended_at: "2026-10-30T16:30:00Z",
      progress: { done: 12, total: 12 },
    },
    latest_terminal_download: {
      run_id: "r-9",
      state: "succeeded",
      ended_at: "2026-10-30T16:30:00Z",
      failure_reason: null,
    },
    items: [],
    ...over,
  };
}

function FAIL(dataType: DataType): Failure {
  return {
    data_type: dataType,
    outcome: "failed",
    reason: "[unavailable] gateway timeout",
    attempts: 2,
    completed_at: "2026-10-30T18:20:00Z",
    run_id: "r-7",
  };
}

function NF(dataType: DataType): Failure {
  return {
    data_type: dataType,
    outcome: "not_found",
    reason: "no such ticker",
    attempts: 1,
    completed_at: "2026-10-30T18:20:00Z",
    run_id: "r-7",
  };
}

function ROW(symbol: string, failures: Failure[], retryable: boolean): ProblemRow {
  return { symbol, failures, retryable };
}

function DH(over: Partial<DataHealth> = {}): DataHealth {
  return {
    checked_at: "2026-10-30T19:03:12Z",
    never_acquired: false,
    followed_count: 12,
    affected_count: 0,
    checks: {
      daily_prices: {
        status: "ok",
        absent_count: 0,
        gap_stock_count: 0,
        behind_count: 0,
        latest_session: "2026-10-29",
        gap_detection: { available: true, reason: null },
        exception_count: 0,
        exception_symbols: [],
      },
      company_financials: {
        status: "ok",
        absent_count: 0,
        problem_count: 0,
        as_of: "2026-10-30T18:00:00Z",
        exception_count: 0,
        exception_symbols: [],
      },
    },
    problems: { rows: [], next_cursor: null },
    ...over,
  };
}

const SUMMARY: ScoreSummary = {
  never_classified: false,
  set: {
    set_id: "s-1",
    classification_date: "2026-10-30",
    run_id: "r-9",
    run_started_at: "2026-10-30T14:00:00Z",
    run_outcome: "succeeded",
    state: "complete",
    started_at: "2026-10-30T16:00:00Z",
    ended_at: "2026-10-30T16:45:00Z",
    latest_trading_day: "2026-10-29",
    active_instruments: 12,
    not_current: false,
  },
  later: null,
  factors: {} as ScoreSummary["factors"],
  stocks_current: { current_count: 12, followed_count: 12 },
};

const SUMMARY_SET = SUMMARY.set as NonNullable<ScoreSummary["set"]>;
const DAILY_PRICES = DH().checks.daily_prices as NonNullable<DataHealth["checks"]["daily_prices"]>;

function RUN(over: Partial<AcquisitionRun> = {}): AcquisitionRun {
  return {
    runId: "r-9",
    state: "succeeded",
    historyDepthYears: 5,
    requestedAt: "2026-10-30T13:59:00Z",
    startedAt: "2026-10-30T14:00:00Z",
    endedAt: "2026-10-30T16:30:00Z",
    instrumentsNamed: 12,
    instrumentsWritten: 12,
    instrumentsFailed: 0,
    failureReason: null,
    ...over,
  };
}

function LATEST(state: RunState, over: Partial<LatestDownload> = {}): LatestDownload {
  return {
    run_id: "r-1",
    state,
    requested_at: "2026-10-30T18:59:00Z",
    started_at: "2026-10-30T19:00:00Z",
    ended_at: null,
    progress: { done: 3, total: 12 },
    ...over,
  };
}

function TERMINAL(
  state: LatestTerminalDownload["state"],
  failureReason: string | null = null,
): LatestTerminalDownload {
  return { run_id: "r-9", state, ended_at: "2026-10-30T16:30:00Z", failure_reason: failureReason };
}

function defer<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function standing(
  over: {
    attention?: Attention;
    dh?: DataHealth;
    active?: number;
    runs?: AcquisitionRun[];
  } = {},
) {
  attentionMock.mockResolvedValue(over.attention ?? ATT());
  healthReadMock.mockResolvedValue(over.dh ?? DH());
  summaryMock.mockResolvedValue(SUMMARY);
  apiHealthMock.mockResolvedValue(HEALTH(true));
  runsMock.mockResolvedValue({ runs: over.runs ?? [RUN()], nextCursor: null });
  instrumentsMock.mockResolvedValue({
    rows: [],
    activeCount: over.active ?? 12,
    retiredCount: 1,
    nextCursor: null,
  });
  depthMock.mockResolvedValue({ years: 5, updatedAt: "2026-10-01T12:00:00Z" });
  problemsMock.mockResolvedValue({ rows: [], next_cursor: null });
}

beforeEach(() => {
  for (const mock of [
    attentionMock,
    summaryMock,
    healthReadMock,
    problemsMock,
    apiHealthMock,
    runsMock,
    instrumentsMock,
    depthMock,
    startMock,
    retireMock,
    fetchSpy,
  ]) {
    mock.mockReset();
  }
  vi.stubGlobal("fetch", fetchSpy);
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "Date"],
  });
  vi.setSystemTime(new Date("2026-10-30T19:03:12Z"));
  standing();
});

afterEach(() => {
  expect(fetchSpy).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

async function flush() {
  await act(() => vi.advanceTimersByTimeAsync(0));
}

async function renderScreen() {
  const view = render(
    <MemoryRouter initialEntries={["/data"]}>
      <HealthProvider>
        <ShellProvider>
          <DataHealthScreen />
        </ShellProvider>
      </HealthProvider>
    </MemoryRouter>,
  );
  await flush();
  return view;
}

/** `user-event` waits on a real timer under vitest's fake clock, so clicks are dispatched directly. */
async function click(element: Element) {
  await act(async () => {
    fireEvent.click(element);
    await vi.advanceTimersByTimeAsync(0);
  });
}

function region(name: string) {
  return screen.getByRole("region", { name });
}

function queryRegion(name: string) {
  return screen.queryByRole("region", { name });
}

function labelsOf(element: Element): string[] {
  return Array.from(element.querySelectorAll("[aria-label], [aria-labelledby]")).map(
    (el) => el.getAttribute("aria-label") ?? "",
  );
}

/** Everything the owner can read or hear: text, accessible names, referenced descriptions. */
function visibleAndAccessibleText(): string {
  const parts: string[] = [document.body.textContent ?? ""];
  for (const el of document.body.querySelectorAll("*")) {
    for (const attr of ["aria-label", "title"]) {
      const value = el.getAttribute(attr);
      if (value !== null) parts.push(value);
    }
    for (const attr of ["aria-labelledby", "aria-describedby"]) {
      for (const id of (el.getAttribute(attr) ?? "").split(/\s+/).filter(Boolean)) {
        parts.push(document.getElementById(id)?.textContent ?? "");
      }
    }
  }
  return parts.join("\n");
}

const BADGE = '[data-variant^="status-"]';

// Implements TC-COMP-151
describe("never_acquired after a download ended (TC-COMP-151, DAC-E6-7, AC-21, AC-24)", () => {
  beforeEach(() => {
    standing({
      attention: ATT({
        latest_terminal_download: TERMINAL("failed", "provider_unavailable"),
        problems: { stock_count: 3, symbols: ["AAA", "BBB", "CCC"], newest_completed_at: null },
      }),
      dh: DH({
        never_acquired: true,
        affected_count: 3,
        checks: { daily_prices: null, company_financials: null },
        problems: {
          rows: [
            ROW("AAA", [FAIL("prices")], true),
            ROW("BBB", [FAIL("prices")], true),
            ROW("CCC", [FAIL("fundamentals")], true),
          ],
          next_cursor: null,
        },
      }),
      runs: [RUN({ state: "failed", instrumentsWritten: 0, instrumentsFailed: 12 })],
    });
  });

  it("renders the verdict, Needs fixing and Recent downloads, with the checks null", async () => {
    await renderScreen();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Is the data good enough to trust?",
    );
    expect(document.querySelector('[data-variant="status-critical"]')?.textContent).toBe("No");
    expect(screen.getByTestId("verdict-sentence").textContent).toContain(
      ", and the last download failed.",
    );
    expect(within(region("Needs fixing · 3")).getAllByRole("listitem")).toHaveLength(3);
    expect(within(region("Recent downloads")).getByRole("table")).toBeTruthy();
    expect(within(region("Recent downloads")).getByText("Failed")).toBeTruthy();
  });

  it("shows the two check cards' null state, never a passed check, never the empty card", async () => {
    await renderScreen();
    for (const name of ["Daily prices", "Company financials"]) {
      const card = region(name);
      expect(
        card.querySelector('[data-variant^="status-"], [data-variant="coverage-unknown"]'),
      ).toBeNull();
      const hidden = within(card).getAllByText("no data stored yet");
      expect(hidden).toHaveLength(2);
      for (const el of hidden) {
        expect(el.className).toContain("sr-only");
      }
      const dashes = Array.from(card.querySelectorAll('[aria-hidden="true"]')).filter(
        (el) => el.textContent === "—",
      );
      expect(dashes.length).toBeGreaterThanOrEqual(2);
    }
    const text = document.body.textContent ?? "";
    for (const passed of [
      "No missing prices or gaps",
      "All financials present",
      "All 12 stocks have prices",
      "All 12 stocks have financials",
    ]) {
      expect(text).not.toContain(passed);
    }
    expect(screen.queryByRole("heading", { name: NO_DATA_YET })).toBeNull();
    expect(queryRegion("Factor scores")).not.toBeNull();
    expect(queryRegion("What you follow")).not.toBeNull();
  });
});

// Implements TC-COMP-175
describe("Never-downloaded empty card (TC-COMP-175, DAC-E6-S5-1, DAC-E6-6, AC-21)", () => {
  it("(a) offers Open setup when no stock is followed, and lets the other regions give way", async () => {
    standing({
      attention: ATT({ followed_count: 0, latest_download: null, latest_terminal_download: null }),
      dh: DH({
        followed_count: 0,
        never_acquired: true,
        checks: { daily_prices: null, company_financials: null },
      }),
      active: 0,
    });
    await renderScreen();
    const card = region(NO_DATA_YET);
    expect(within(card).getByRole("heading", { level: 2 }).textContent).toBe(NO_DATA_YET);
    expect(within(card).getByText(FOLLOW_FIRST)).toBeTruthy();
    const link = within(card).getByRole("link", { name: OPEN_SETUP });
    expect(link.getAttribute("href")).toBe("/setup");
    expect(link.getAttribute("data-variant")).toBe("default");
    expect(within(card).queryByRole("button", { name: START_FIRST_DOWNLOAD })).toBeNull();
    expect(document.querySelector(BADGE)).toBeNull();
    expect(screen.queryByTestId("verdict-sentence")).toBeNull();
    expect(document.querySelector("header")?.textContent).not.toContain("checked");
    for (const name of ["Daily prices", "Company financials", "Factor scores", "What you follow"]) {
      expect(queryRegion(name)).toBeNull();
    }
    // DEC-0405: the lower regions mount while attention loads and read once; nothing
    // reads after the empty state settles, and neither region is rendered.
    expect(queryRegion("Recent downloads")).toBeNull();
    const instrumentReads = instrumentsMock.mock.calls.length;
    const runReads = runsMock.mock.calls.length;
    await act(() => vi.advanceTimersByTimeAsync(600_000));
    expect(instrumentsMock.mock.calls.length).toBe(instrumentReads);
    expect(runsMock.mock.calls.length).toBe(runReads);
    expect(document.body.textContent).not.toContain("Needs fixing");
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Full coverage table" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Download now" })).toBeTruthy();
  });

  it("(b) offers Start the first download with the count from attention while the aggregate is pending", async () => {
    standing({
      attention: ATT({ followed_count: 12, latest_download: null, latest_terminal_download: null }),
    });
    healthReadMock.mockReturnValue(defer<DataHealth>().promise);
    startMock.mockResolvedValue({ runId: "r-10", state: "requested", queuedBehind: null });
    await renderScreen();
    const card = region(NO_DATA_YET);
    expect(within(card).getByText(downloadForFollowed("12")).textContent).toBe(
      "Download data for your 12 followed stocks to see whether it can be trusted.",
    );
    const button = within(card).getByRole("button", { name: START_FIRST_DOWNLOAD });
    expect(button.getAttribute("data-variant")).toBe("default");
    expect(within(card).queryByRole("link", { name: OPEN_SETUP })).toBeNull();
    const before = attentionMock.mock.calls.length;
    await click(button);
    await flush();
    expect(startMock).toHaveBeenCalledTimes(1);
    expect(startMock).toHaveBeenCalledWith();
    expect(attentionMock.mock.calls.length).toBe(before + 1);
  });

  it("(c) formats a large count", async () => {
    standing({
      attention: ATT({
        followed_count: 1236,
        latest_download: null,
        latest_terminal_download: null,
      }),
    });
    await renderScreen();
    expect(within(region(NO_DATA_YET)).getByText(downloadForFollowed("1,236"))).toBeTruthy();
  });

  it("(c2) offers the first download for a single followed stock", async () => {
    standing({
      attention: ATT({ followed_count: 1, latest_download: null, latest_terminal_download: null }),
      active: 1,
    });
    await renderScreen();
    const card = region(NO_DATA_YET);
    expect(within(card).getByText(downloadForFollowed("1"))).toBeTruthy();
    expect(within(card).getByRole("button", { name: START_FIRST_DOWNLOAD })).toBeTruthy();
    expect(within(card).queryByRole("link", { name: OPEN_SETUP })).toBeNull();
  });

  it("(d) shows a running first download's progress beneath the card", async () => {
    standing({
      attention: ATT({
        latest_download: LATEST("running"),
        latest_terminal_download: null,
      }),
      runs: [RUN({ runId: "r-1", state: "running", endedAt: null, instrumentsWritten: 3 })],
    });
    await renderScreen();
    const card = region(NO_DATA_YET);
    const recent = region("Recent downloads");
    expect(card.compareDocumentPosition(recent) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    expect(within(recent).getByRole("progressbar", { name: "3 of 12 stocks" })).toBeTruthy();
    expect(within(recent).getByText("3 of 12 stocks")).toBeTruthy();
    expect(queryRegion("What you follow")).toBeNull();
  });

  it("(e) shows Needs fixing only while the count is above zero", async () => {
    const running = ATT({ latest_download: LATEST("running"), latest_terminal_download: null });
    standing({
      attention: running,
      dh: DH({
        affected_count: 1,
        problems: { rows: [ROW("FBXX", [NF("reference")], false)], next_cursor: null },
      }),
    });
    const { unmount } = await renderScreen();
    const needs = region("Needs fixing · 1");
    expect(within(needs).getAllByRole("listitem")).toHaveLength(1);
    expect(
      region(NO_DATA_YET).compareDocumentPosition(needs) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
    unmount();
    standing({ attention: running, dh: DH({ affected_count: 0 }) });
    await renderScreen();
    expect(document.body.textContent).not.toContain("Needs fixing");
  });

  it.each([
    ["followed stocks", ATT({ latest_download: null, latest_terminal_download: null })],
    [
      "no followed stocks",
      ATT({ followed_count: 0, latest_download: null, latest_terminal_download: null }),
    ],
    [
      "a running first download",
      ATT({ latest_download: LATEST("running"), latest_terminal_download: null }),
    ],
  ])("(f) never shows a check as passed with %s", async (_name, attention) => {
    standing({
      attention,
      runs: [RUN({ state: "running", endedAt: null })],
      dh: DH({
        affected_count: 1,
        problems: { rows: [ROW("FBXX", [NF("reference")], false)], next_cursor: null },
      }),
    });
    await renderScreen();
    expect(document.querySelector('[data-variant="status-good"]')).toBeNull();
    const text = document.body.textContent ?? "";
    for (const passed of ["No missing prices or gaps", "All financials present", "Yes."]) {
      expect(text).not.toContain(passed);
    }
  });
});

// Implements TC-COMP-176
describe("Aggregate refresh rule (TC-COMP-176, DAC-E6-S5-2, DAC-E6-15, AC-28)", () => {
  const FBXX = DH({
    affected_count: 1,
    problems: { rows: [ROW("FBXX", [NF("reference")], false)], next_cursor: null },
  });

  it("(a) reads the aggregate once while attention keeps polling", async () => {
    standing({ dh: FBXX });
    await renderScreen();
    expect(healthReadMock).toHaveBeenCalledTimes(1);
    await act(() => vi.advanceTimersByTimeAsync(600_000));
    expect(attentionMock.mock.calls.length).toBeGreaterThanOrEqual(10);
    expect(healthReadMock).toHaveBeenCalledTimes(1);
  });

  it("(b) reads once more after a successful stop following", async () => {
    standing({ dh: FBXX });
    retireMock.mockResolvedValue({ lifecycle: "retired", retiredAt: "2026-10-30T19:10:00Z" });
    await renderScreen();
    await click(screen.getByRole("button", { name: "Stop following FBXX" }));
    await click(within(screen.getByRole("dialog")).getByRole("button", { name: "Stop following" }));
    await flush();
    expect(healthReadMock).toHaveBeenCalledTimes(2);
    expect(retireMock).toHaveBeenCalledTimes(1);
    expect(retireMock).toHaveBeenCalledWith("FBXX");
    await act(() => vi.advanceTimersByTimeAsync(600_000));
    expect(healthReadMock).toHaveBeenCalledTimes(2);
  });

  it("(c) leaves the terminal transition to the hook: one read for one transition", async () => {
    standing({ dh: FBXX });
    attentionMock
      .mockResolvedValueOnce(ATT())
      .mockResolvedValueOnce(
        ATT({
          latest_download: LATEST("running"),
          latest_terminal_download: TERMINAL("succeeded"),
        }),
      )
      .mockResolvedValue(ATT());
    await renderScreen();
    await act(() => vi.advanceTimersByTimeAsync(61_000));
    await act(() => vi.advanceTimersByTimeAsync(11_000));
    // Stepped, so React renders the running answer before the terminal one arrives.
    expect(healthReadMock).toHaveBeenCalledTimes(2);
    await act(() => vi.advanceTimersByTimeAsync(600_000));
    expect(healthReadMock).toHaveBeenCalledTimes(2);
  });

  it("(d) Try again is a read, and only that", async () => {
    standing();
    healthReadMock.mockRejectedValueOnce(INTERNAL).mockResolvedValue(DH());
    await renderScreen();
    const before = attentionMock.mock.calls.length;
    await click(within(region("Daily prices")).getByRole("button", { name: "Try again" }));
    await flush();
    expect(healthReadMock).toHaveBeenCalledTimes(2);
    expect(attentionMock.mock.calls.length).toBe(before);
  });
});

// Implements TC-COMP-177
// Implements TC-COMP-155 (whole screen)
describe("Eight states per region (TC-COMP-177, TC-COMP-155, DAC-E6-S5-3, DAC-E6-17, AC-24)", () => {
  it("(a) loading: every read pending", async () => {
    for (const mock of [
      attentionMock,
      summaryMock,
      healthReadMock,
      runsMock,
      instrumentsMock,
      depthMock,
    ]) {
      mock.mockReturnValue(defer<never>().promise);
    }
    await renderScreen();
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Full coverage table" })).toBeTruthy();
    expect(document.querySelector("header [aria-busy='true']")).not.toBeNull();
    for (const name of ["Needs fixing", "Recent downloads", "What you follow"]) {
      expect(region(name).querySelector("[aria-busy='true']")).not.toBeNull();
    }
    for (const name of ["Daily prices", "Company financials", "Factor scores"]) {
      expect(region(name).closest('[aria-busy="true"]')).not.toBeNull();
    }
    expect(document.querySelector(BADGE)).toBeNull();
    expect(screen.queryByRole("heading", { name: NO_DATA_YET })).toBeNull();
  });

  it("(a2) loading on attention alone keeps the check cards as skeletons", async () => {
    attentionMock.mockReturnValue(defer<never>().promise);
    await renderScreen();
    for (const name of ["Daily prices", "Company financials", "Factor scores"]) {
      const card = region(name);
      expect(card.closest('[aria-busy="true"]')).not.toBeNull();
      expect(card.querySelector(BADGE)).toBeNull();
    }
  });

  it("(b) empty, never populated: exactly one such region", async () => {
    standing({ attention: ATT({ latest_download: null, latest_terminal_download: null }) });
    await renderScreen();
    expect(screen.getAllByRole("region", { name: NO_DATA_YET })).toHaveLength(1);
  });

  it("(c) empty, nothing found", async () => {
    await renderScreen();
    expect(screen.getByTestId("verdict-sentence").textContent).toContain(
      "Yes. None of the 12 followed stocks needs attention.",
    );
    const needs = region("Needs fixing · 0");
    expect(within(needs).getByText("Nothing needs fixing.")).toBeTruthy();
    expect(needs.textContent).toContain("Last complete download 2026-10-30 09:00 CDT");
    expect(region("Daily prices").querySelector('[data-variant="status-good"]')?.textContent).toBe(
      "No missing prices or gaps",
    );
  });

  it("(d) partial", async () => {
    standing({
      attention: ATT({ latest_terminal_download: TERMINAL("partial") }),
      dh: DH({
        affected_count: 2,
        checks: {
          daily_prices: {
            status: "exceptions",
            absent_count: 2,
            gap_stock_count: 0,
            behind_count: 0,
            latest_session: "2026-10-29",
            gap_detection: { available: true, reason: null },
            exception_count: 2,
            exception_symbols: ["AAA", "BBB"],
          },
          company_financials: DH().checks.company_financials,
        },
        problems: {
          rows: [ROW("AAA", [FAIL("prices")], true), ROW("BBB", [FAIL("prices")], true)],
          next_cursor: null,
        },
      }),
      runs: [RUN({ state: "partial", instrumentsWritten: 10, instrumentsFailed: 2 })],
    });
    await renderScreen();
    const verdict = document.querySelector(`header ${BADGE}`);
    expect(verdict?.textContent).toBe("Mostly yes");
    expect(verdict?.getAttribute("data-variant")).toBe("status-warning");
    const prices = region("Daily prices");
    expect(prices.querySelector('[data-variant="status-warning"]')?.textContent).toBe(
      "Needs attention",
    );
    expect(prices.textContent).toContain("Prices to 2026-10-29");
    expect(prices.textContent).toContain("AAA, BBB");
    const recent = region("Recent downloads");
    expect(recent.querySelector('[data-variant="status-warning"]')?.textContent).toBe("Partial");
    expect(recent.textContent).toContain("10 of 12 stocks, 2 failed");
  });

  it("(e) stale: scores render it, the check cards record it as not rendered", async () => {
    summaryMock.mockResolvedValue({ ...SUMMARY, set: { ...SUMMARY_SET, not_current: true } });
    standing({
      dh: DH({
        checks: {
          daily_prices: { ...DAILY_PRICES, latest_session: "2026-09-01" },
          company_financials: DH().checks.company_financials,
        },
      }),
    });
    summaryMock.mockResolvedValue({ ...SUMMARY, set: { ...SUMMARY_SET, not_current: true } });
    await renderScreen();
    expect(
      region("Factor scores").querySelector('[data-variant="status-warning"]')?.textContent,
    ).toBe("Not reflecting the latest download");
    for (const name of ["Daily prices", "Company financials"]) {
      expect(region(name).textContent).not.toMatch(/stale|out of date|not current/i);
    }
    expect(region("Daily prices").querySelector('[data-variant="status-good"]')?.textContent).toBe(
      "No missing prices or gaps",
    );
    expect(region("Daily prices").textContent).toContain("FactorFlow has no trading calendar");
  });

  it("(f) unavailable: a failed attention read keeps the cards from their own reads", async () => {
    attentionMock.mockRejectedValue(INTERNAL);
    apiHealthMock.mockRejectedValue(UNREACHABLE);
    summaryMock.mockResolvedValue({ kind: "not_served" });
    healthReadMock.mockResolvedValue(
      DH({
        checks: {
          daily_prices: {
            ...DAILY_PRICES,
            status: "exceptions",
            gap_stock_count: null,
            gap_detection: { available: false, reason: "fewer_than_two_instruments_with_data" },
          },
          company_financials: DH().checks.company_financials,
        },
      }),
    );
    await renderScreen();
    expect(document.querySelector("header")?.textContent).toContain(
      "Couldn't read what needs attention: FactorFlow hit an unexpected problem.",
    );
    expect(
      region("Daily prices").querySelector('[data-variant="coverage-unknown"]')?.textContent,
    ).toBe("Gaps not determinable");
    expect(
      region("Factor scores").querySelector('[data-variant="coverage-unknown"]')?.textContent,
    ).toBe("Not determinable");
    expect(region("Factor scores").textContent).toContain("FactorFlow can't read scores yet.");
    expect(
      region("What you follow").querySelector('[data-variant="coverage-unknown"]')?.textContent,
    ).toBe("Not determinable");
    expect(screen.queryByRole("heading", { name: NO_DATA_YET })).toBeNull();
    const dhBefore = healthReadMock.mock.calls.length;
    const attBefore = attentionMock.mock.calls.length;
    await click(
      within(document.querySelector("header") as HTMLElement).getByRole("button", {
        name: "Try again",
      }),
    );
    await flush();
    expect(attentionMock.mock.calls.length).toBe(attBefore + 1);
    expect(healthReadMock.mock.calls.length).toBe(dhBefore);
  });

  it("(g) error: every region keeps its title and says what failed, with no leak", async () => {
    healthReadMock.mockRejectedValue(INTERNAL);
    runsMock.mockRejectedValue(INTERNAL);
    instrumentsMock.mockRejectedValue(INTERNAL);
    await renderScreen();
    const sentence = "Couldn't read the data health checks: FactorFlow hit an unexpected problem.";
    for (const name of ["Daily prices", "Company financials"]) {
      expect(within(region(name)).getByRole("heading", { level: 2 })).toBeTruthy();
      expect(region(name).textContent).toContain(sentence);
      expect(within(region(name)).getByRole("button", { name: "Try again" })).toBeTruthy();
    }
    expect(region("Needs fixing").textContent).toContain(sentence);
    expect(region("Recent downloads").textContent).toContain(
      "Couldn't read recent downloads: FactorFlow hit an unexpected problem.",
    );
    expect(region("What you follow").textContent).toContain(
      "Couldn't read what you follow: FactorFlow hit an unexpected problem.",
    );
    expect(document.querySelector("header")?.textContent).toContain(sentence);
    const text = document.body.textContent ?? "";
    expect(text).not.toContain("req-9f3");
    expect(text).not.toContain("instrument table said no");
    const before = healthReadMock.mock.calls.length;
    const attBefore = attentionMock.mock.calls.length;
    const sumBefore = summaryMock.mock.calls.length;
    await click(within(region("Company financials")).getByRole("button", { name: "Try again" }));
    await flush();
    expect(healthReadMock.mock.calls.length).toBe(before + 1);
    expect(attentionMock.mock.calls.length).toBe(attBefore);
    expect(summaryMock.mock.calls.length).toBe(sumBefore);
  });

  it("(h) unreachable is the shell's: recorded as not applicable by the screen's types", async () => {
    // The screen's `StateRegion` call names `unreachable` only as `notApplicable`; `tsc` enforces it.
    await renderScreen();
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
  });
});

describe("Layout and wiring (AC-11, AC-26, owner-shell 2.1, data-health-ui 10)", () => {
  it("(a) caps the width at the layout key", async () => {
    await renderScreen();
    const root = (screen.getByRole("heading", { level: 1 }).closest("header") as HTMLElement)
      .parentElement as HTMLElement;
    expect(root.style.maxWidth).toBe(LAYOUT.contentMaxWidth);
    expect(root.style.maxWidth).toBe("1180px");
  });

  it("(b) holds the three checks in a four-column grid with the fourth column empty", async () => {
    await renderScreen();
    const grid = region("Daily prices").parentElement as HTMLElement;
    expect(grid.className).toContain("grid-cols-4");
    expect(
      Array.from(grid.children).map(
        (c) => within(c as HTMLElement).getByRole("heading").textContent,
      ),
    ).toEqual(["Daily prices", "Company financials", "Factor scores"]);
    expect(region("Company financials").parentElement).toBe(grid);
    expect(region("Factor scores").parentElement).toBe(grid);
  });

  it("(c) orders the regions", async () => {
    await renderScreen();
    const header = document.querySelector("header") as HTMLElement;
    const grid = region("Daily prices").parentElement as HTMLElement;
    const needs = region("Needs fixing · 0");
    const recent = region("Recent downloads");
    const follow = region("What you follow");
    const precedes = (a: Element, b: Element) =>
      (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
    expect(precedes(header, grid)).toBe(true);
    expect(precedes(grid, needs)).toBe(true);
    expect(precedes(needs, recent)).toBe(true);
    expect(precedes(recent, follow)).toBe(true);
    expect(recent.parentElement).toBe(follow.parentElement);
    expect((recent.parentElement as HTMLElement).className).toContain("grid-cols-2");
  });

  it("(d) retries the scores read alone", async () => {
    summaryMock.mockRejectedValueOnce(INTERNAL).mockResolvedValue(SUMMARY);
    await renderScreen();
    const att = attentionMock.mock.calls.length;
    const dh = healthReadMock.mock.calls.length;
    const sum = summaryMock.mock.calls.length;
    await click(within(region("Factor scores")).getByRole("button", { name: "Try again" }));
    await flush();
    expect(summaryMock.mock.calls.length).toBe(sum + 1);
    expect(attentionMock.mock.calls.length).toBe(att);
    expect(healthReadMock.mock.calls.length).toBe(dh);
  });

  it("(e) shows one set of header actions", async () => {
    await renderScreen();
    const header = document.querySelector("header") as HTMLElement;
    expect(within(header).getAllByRole("link", { name: "Full coverage table" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Download now" })).toHaveLength(1);
  });
});

// Implements TC-COMP-179
describe("Display vocabulary in every state (TC-COMP-179, DAC-E6-S5-5, AC-19)", () => {
  it("(b) the term pattern is not vacuous", () => {
    for (const term of ["one run", "Retired", "Provider credential"]) {
      expect(term).toMatch(TERMS);
    }
    for (const fine of [
      "Download",
      "downloads",
      "run_id",
      "fewer_than_two_instruments_with_data",
    ]) {
      expect(fine).not.toMatch(TERMS);
    }
  });

  const scenarios: [string, () => void][] = [
    ["the full screen", () => standing()],
    [
      "every read pending",
      () => {
        for (const mock of [
          attentionMock,
          summaryMock,
          healthReadMock,
          runsMock,
          instrumentsMock,
          depthMock,
        ]) {
          mock.mockReturnValue(defer<never>().promise);
        }
      },
    ],
    [
      "a partial download",
      () =>
        standing({
          attention: ATT({ latest_terminal_download: TERMINAL("partial") }),
          dh: DH({
            affected_count: 1,
            checks: {
              daily_prices: {
                ...DAILY_PRICES,
                status: "exceptions",
                exception_count: 1,
                exception_symbols: ["AAA"],
              },
              company_financials: DH().checks.company_financials,
            },
            problems: { rows: [ROW("AAA", [FAIL("prices")], true)], next_cursor: null },
          }),
          runs: [RUN({ state: "partial", instrumentsWritten: 10, instrumentsFailed: 2 })],
        }),
    ],
    [
      "scores not reflecting the latest download",
      () => {
        standing();
        summaryMock.mockResolvedValue({ ...SUMMARY, set: { ...SUMMARY_SET, not_current: true } });
      },
    ],
    [
      "attention and health unavailable",
      () => {
        standing();
        attentionMock.mockRejectedValue(INTERNAL);
        apiHealthMock.mockRejectedValue(UNREACHABLE);
        summaryMock.mockResolvedValue({ kind: "not_served" });
        healthReadMock.mockResolvedValue(
          DH({
            checks: {
              daily_prices: {
                ...DAILY_PRICES,
                status: "exceptions",
                gap_stock_count: null,
                gap_detection: { available: false, reason: "fewer_than_two_instruments_with_data" },
              },
              company_financials: DH().checks.company_financials,
            },
          }),
        );
      },
    ],
    [
      "the empty card with followed stocks",
      () => standing({ attention: ATT({ latest_download: null, latest_terminal_download: null }) }),
    ],
    [
      "the empty card with none followed",
      () =>
        standing({
          attention: ATT({
            followed_count: 0,
            latest_download: null,
            latest_terminal_download: null,
          }),
          active: 0,
        }),
    ],
    [
      "a running first download",
      () =>
        standing({
          attention: ATT({ latest_download: LATEST("running"), latest_terminal_download: null }),
          runs: [RUN({ state: "running", endedAt: null })],
        }),
    ],
    [
      "a failed first download",
      () => {
        standing({
          attention: ATT({ latest_terminal_download: TERMINAL("failed", "provider_unavailable") }),
          dh: DH({
            never_acquired: true,
            affected_count: 1,
            checks: { daily_prices: null, company_financials: null },
            problems: { rows: [ROW("AAA", [FAIL("prices")], true)], next_cursor: null },
          }),
          runs: [RUN({ state: "failed", instrumentsWritten: 0, instrumentsFailed: 12 })],
        });
      },
    ],
    [
      "every read failing",
      () => {
        standing();
        attentionMock.mockRejectedValue(INTERNAL);
        healthReadMock.mockRejectedValue(INTERNAL);
        summaryMock.mockRejectedValue(INTERNAL);
        runsMock.mockRejectedValue(INTERNAL);
        instrumentsMock.mockRejectedValue(INTERNAL);
        apiHealthMock.mockRejectedValue(UNREACHABLE);
      },
    ],
  ];

  it.each(scenarios)("(a) %s never names a forbidden term", async (_name, setup) => {
    setup();
    await renderScreen();
    expect(visibleAndAccessibleText()).not.toMatch(TERMS);
  });

  it("(a) the stop-following dialog names none either", async () => {
    standing({
      dh: DH({
        affected_count: 1,
        problems: { rows: [ROW("FBXX", [NF("reference")], false)], next_cursor: null },
      }),
    });
    await renderScreen();
    await click(screen.getByRole("button", { name: "Stop following FBXX" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(visibleAndAccessibleText()).not.toMatch(TERMS);
  });

  it("(c) the empty card uses this story's strings", async () => {
    standing({ attention: ATT({ latest_download: null, latest_terminal_download: null }) });
    await renderScreen();
    const card = region(NO_DATA_YET);
    expect(within(card).getByRole("heading").textContent).toBe(NO_DATA_YET);
    expect(within(card).getByText(downloadForFollowed("12"))).toBeTruthy();
    expect(within(card).getByRole("button").textContent).toBe(START_FIRST_DOWNLOAD);
  });

  it("(c) the setup card uses this story's strings", async () => {
    standing({
      attention: ATT({ followed_count: 0, latest_download: null, latest_terminal_download: null }),
      active: 0,
    });
    await renderScreen();
    const card = region(NO_DATA_YET);
    expect(within(card).getByText(FOLLOW_FIRST)).toBeTruthy();
    expect(within(card).getByRole("link").textContent).toBe(OPEN_SETUP);
  });
});

// Implements TC-COMP-180
describe("Statuses carry words and shape (TC-COMP-180, DAC-E6-S5-6, AC-20)", () => {
  it("(a) every badge has its word and exactly one hidden shape", async () => {
    standing({
      attention: ATT({ latest_terminal_download: TERMINAL("partial") }),
      dh: DH({
        affected_count: 2,
        problems: {
          rows: [ROW("AAA", [FAIL("prices")], true), ROW("FBXX", [NF("reference")], false)],
          next_cursor: null,
        },
      }),
      runs: [
        RUN({ runId: "r-4" }),
        RUN({ runId: "r-3", state: "partial", instrumentsWritten: 10, instrumentsFailed: 2 }),
        RUN({ runId: "r-2", state: "abandoned" }),
        RUN({ runId: "r-1", state: "failed", instrumentsWritten: 0, instrumentsFailed: 12 }),
      ],
    });
    await renderScreen();
    const badges = Array.from(document.querySelectorAll(BADGE));
    expect(badges.length).toBeGreaterThan(4);
    const words = badges.map((b) => (b.textContent ?? "").trim());
    for (const word of ["Complete", "Partial", "Interrupted", "Failed", "Not found"]) {
      expect(words).toContain(word);
    }
    for (const badge of badges) {
      expect((badge.textContent ?? "").trim()).not.toBe("");
      expect(badge.querySelectorAll("svg")).toHaveLength(1);
      expect(badge.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
      expect(labelsOf(badge).filter((l) => l !== "")).toEqual([]);
    }
  });

  it("(b) an undeterminable value has a description", async () => {
    attentionMock.mockRejectedValue(INTERNAL);
    apiHealthMock.mockRejectedValue(UNREACHABLE);
    summaryMock.mockResolvedValue({ kind: "not_served" });
    await renderScreen();
    const unknown = Array.from(document.querySelectorAll('[data-variant="coverage-unknown"]'));
    expect(unknown.length).toBeGreaterThan(0);
    for (const el of unknown) {
      expect(el).toHaveAccessibleDescription(expect.stringMatching(/\S/));
    }
  });

  it("(c) null check tiers carry no badge", async () => {
    standing({
      dh: DH({ never_acquired: true, checks: { daily_prices: null, company_financials: null } }),
    });
    await renderScreen();
    for (const name of ["Daily prices", "Company financials"]) {
      const card = region(name);
      expect(card.querySelector(`${BADGE}, [data-variant="coverage-unknown"]`)).toBeNull();
      const dashes = Array.from(card.querySelectorAll('[aria-hidden="true"]')).filter(
        (el) => el.textContent === "—",
      );
      expect(dashes.length).toBeGreaterThanOrEqual(2);
      const hidden = within(card).getAllByText("no data stored yet");
      expect(hidden).toHaveLength(2);
      for (const el of hidden) {
        expect(el.className).toContain("sr-only");
      }
    }
  });

  it("(d) colour never stands alone", async () => {
    standing({ attention: ATT({ latest_terminal_download: TERMINAL("failed") }) });
    await renderScreen();
    for (const el of document.querySelectorAll("*")) {
      if (/\b(text|bg|border)-status-/.test(el.getAttribute("class") ?? "")) {
        expect(el.matches(BADGE) || el.closest(BADGE) !== null).toBe(true);
      }
    }
  });
});

describe("copy.ts, empty card strings (DAC-E6-6)", () => {
  it("holds the exact strings", () => {
    expect(NO_DATA_YET).toBe("No data has been downloaded yet.");
    expect(START_FIRST_DOWNLOAD).toBe("Start the first download");
    expect(FOLLOW_FIRST).toBe("Follow some stocks first.");
    expect(OPEN_SETUP).toBe("Open setup");
  });

  it("formats the follow count into the sentence it is given", () => {
    expect(downloadForFollowed("12")).toBe(
      "Download data for your 12 followed stocks to see whether it can be trusted.",
    );
    expect(downloadForFollowed("1,236")).toBe(
      "Download data for your 1,236 followed stocks to see whether it can be trusted.",
    );
  });

  it("uses no DAC-E7-3 term", () => {
    for (const value of [
      NO_DATA_YET,
      START_FIRST_DOWNLOAD,
      FOLLOW_FIRST,
      OPEN_SETUP,
      downloadForFollowed("12"),
    ]) {
      expect(value).not.toMatch(TERMS);
    }
  });

  it("does not swap the two headline strings", () => {
    expect(NO_DATA_YET).not.toBe(FOLLOW_FIRST);
  });
});

describe("Hand-off hardening (DAC-E6-S5-1 to -6, DAC-E6-15)", () => {
  it("frames the empty card with the default card, plain headings and set paragraphs", async () => {
    standing({ attention: ATT({ latest_download: null, latest_terminal_download: null }) });
    await renderScreen();
    const section = region(NO_DATA_YET);
    expect(section.firstElementChild?.getAttribute("data-variant")).toBe("default");
    expect(within(section).getByRole("heading").className).not.toMatch(/status-/);
    const sentence = within(section).getByText(downloadForFollowed("12"));
    expect(sentence.className).toContain("text-base");
    expect(sentence.parentElement?.className).toContain("items-start");
  });

  it("styles the setup branch's paragraph and action the same way", async () => {
    standing({
      attention: ATT({ followed_count: 0, latest_download: null, latest_terminal_download: null }),
      active: 0,
    });
    await renderScreen();
    expect(within(region(NO_DATA_YET)).getByText(FOLLOW_FIRST).className).toContain("text-base");
  });

  it("gives each check card its own result line and the follow count", async () => {
    await renderScreen();
    expect(region("Daily prices").textContent).toContain("All 12 stocks have prices to 2026-10-29");
    expect(region("Company financials").textContent).toContain("All 12 stocks have financials");
  });

  it("shows skeleton lines in both check cards while the aggregate loads", async () => {
    healthReadMock.mockReturnValue(defer<DataHealth>().promise);
    await renderScreen();
    for (const name of ["Daily prices", "Company financials"]) {
      expect(region(name).querySelector("[aria-busy='true']")).not.toBeNull();
    }
  });

  it("replaces a loaded check card with the failure when the next read fails", async () => {
    attentionMock
      .mockResolvedValueOnce(ATT())
      .mockResolvedValueOnce(
        ATT({
          latest_download: LATEST("running"),
          latest_terminal_download: TERMINAL("succeeded"),
        }),
      )
      .mockResolvedValue(ATT());
    healthReadMock.mockResolvedValueOnce(DH()).mockRejectedValue(INTERNAL);
    await renderScreen();
    expect(region("Daily prices").textContent).toContain("All 12 stocks have prices");
    await act(() => vi.advanceTimersByTimeAsync(61_000));
    await act(() => vi.advanceTimersByTimeAsync(11_000));
    for (const name of ["Daily prices", "Company financials"]) {
      expect(region(name).textContent).toContain("Couldn't read the data health checks");
      expect(region(name).textContent).not.toContain("stocks have");
    }
  });

  it("keeps Needs fixing out of the empty state while the aggregate loads or fails", async () => {
    const empty = ATT({ latest_download: null, latest_terminal_download: null });
    standing({ attention: empty });
    healthReadMock.mockReturnValue(defer<DataHealth>().promise);
    const first = await renderScreen();
    expect(document.body.textContent).not.toContain("Needs fixing");
    first.unmount();
    standing({ attention: empty });
    healthReadMock.mockRejectedValue(INTERNAL);
    await renderScreen();
    expect(document.body.textContent).not.toContain("Needs fixing");
  });

  it("retries the aggregate alone from the verdict's own Try again", async () => {
    healthReadMock.mockRejectedValue(INTERNAL);
    await renderScreen();
    const att = attentionMock.mock.calls.length;
    const sum = summaryMock.mock.calls.length;
    const dh = healthReadMock.mock.calls.length;
    const header = document.querySelector("header") as HTMLElement;
    await click(within(header).getByRole("button", { name: "Try again" }));
    expect(healthReadMock.mock.calls.length).toBe(dh + 1);
    expect(attentionMock.mock.calls.length).toBe(att);
    expect(summaryMock.mock.calls.length).toBe(sum);
  });

  it("centres the screen and aligns the lower pair to the top", async () => {
    await renderScreen();
    const header = document.querySelector("header") as HTMLElement;
    expect((header.parentElement as HTMLElement).className).toContain("mx-auto");
    expect((region("Recent downloads").parentElement as HTMLElement).className).toContain(
      "items-start",
    );
  });
});
