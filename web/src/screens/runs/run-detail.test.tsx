import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { JSX } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  cancelAcquisitionRun,
  getAcquisitionRun,
  startAcquisitionRun,
} from "../../api/client";
import type {
  AcquisitionRun,
  DataType,
  OutcomeCounts,
  ResultOutcome,
  RunDetail,
  RunResult,
  RunState,
} from "../../api/types";
import RunDetailScreen from "./detail";
import { ABANDONED_EXPLANATION, RUN_STATE_LABEL } from "./outcome-badge";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return {
    ...actual,
    getAcquisitionRun: vi.fn(),
    cancelAcquisitionRun: vi.fn(),
    startAcquisitionRun: vi.fn(),
  };
});

const getMock = vi.mocked(getAcquisitionRun);
const cancelMock = vi.mocked(cancelAcquisitionRun);
const startMock = vi.mocked(startAcquisitionRun);

const TERMINAL: RunState[] = ["succeeded", "partial", "failed", "cancelled", "abandoned"];

function run(state: RunState, overrides: Partial<AcquisitionRun> = {}): AcquisitionRun {
  const terminal = TERMINAL.includes(state);
  return {
    runId: "r-1",
    state,
    historyDepthYears: 5,
    requestedAt: "2026-09-06T14:00:00Z",
    startedAt: state === "requested" ? null : "2026-09-06T14:00:05Z",
    endedAt: terminal ? "2026-09-06T14:30:00Z" : null,
    instrumentsNamed: 3,
    instrumentsWritten: 2,
    instrumentsFailed: 1,
    failureReason: null,
    ...overrides,
  };
}

function result(
  instrumentId: number,
  symbol: string,
  dataType: DataType,
  outcome: ResultOutcome,
  reason: string | null = null,
): RunResult {
  return {
    instrumentId,
    symbol,
    dataType,
    outcome,
    reason,
    attempts: 1,
    completedAt: "2026-09-06T14:10:00Z",
  };
}

const NO_COUNTS: OutcomeCounts = { written: 0, unchanged: 0, notFound: 0, failed: 0, skipped: 0 };

function detail(
  runValue: AcquisitionRun,
  results: RunResult[] = [],
  options: { nextCursor?: string | null; resultsByOutcome?: OutcomeCounts } = {},
): RunDetail {
  return {
    run: runValue,
    counts: {
      instrumentsNamed: runValue.instrumentsNamed,
      instrumentsWritten: runValue.instrumentsWritten,
      instrumentsFailed: runValue.instrumentsFailed,
      resultsByOutcome: options.resultsByOutcome ?? NO_COUNTS,
    },
    results,
    nextCursor: options.nextCursor ?? null,
  };
}

function LocationProbe(): JSX.Element {
  return <div data-testid="location">{useLocation().pathname}</div>;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={["/runs/r-1"]}>
      <Routes>
        <Route path="/runs/:runId" element={<RunDetailScreen />} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );
}

function expander(symbol: string): HTMLElement {
  return screen.getByRole("button", { name: new RegExp(`data types for ${symbol}$`) });
}

/** The rows an expander controls, through its `aria-controls`. */
function groupOf(symbol: string): HTMLElement {
  const id = expander(symbol).getAttribute("aria-controls");
  const group = id === null ? null : document.getElementById(id);
  if (group === null) {
    throw new Error(`no group for ${symbol}`);
  }
  return group;
}

function summary(): HTMLElement {
  const section = document.querySelector<HTMLElement>('section[data-variant="summary"]');
  if (section === null) {
    throw new Error("no summary");
  }
  return section;
}

const DATA_TYPE_NAMES = ["Reference", "Prices", "Fundamentals", "Corporate actions"];

function dataTypeRowHeaders(container: HTMLElement): string[] {
  return within(container)
    .queryAllByRole("rowheader")
    .map((cell) => cell.textContent ?? "")
    .filter((text) => DATA_TYPE_NAMES.includes(text));
}

const ALL_TYPES: DataType[] = ["corporate_actions", "fundamentals", "prices", "reference"];

beforeEach(() => {
  getMock.mockReset();
  cancelMock.mockReset();
  startMock.mockReset();
});

// Implements TC-COMP-074
describe("Roster at 3000 instruments (DAC-E7-9)", () => {
  const page = Array.from({ length: 50 }, (_, index) => {
    const symbol = `S${String(index + 1).padStart(4, "0")}`;
    return ALL_TYPES.map((dataType) => result(index + 1, symbol, dataType, "written"));
  }).flat();

  it("collapses to one row per instrument and expands to four data types in fixed order", async () => {
    const user = userEvent.setup();
    getMock.mockResolvedValue(
      detail(run("partial", { instrumentsNamed: 3000 }), page, { nextCursor: "c1" }),
    );
    renderScreen();

    const table = await screen.findByRole("table");
    expect(table).toHaveAttribute("data-variant", "expandable");
    const expanders = screen.getAllByRole("button", { name: /^Show data types for / });
    expect(expanders).toHaveLength(50);
    expect(dataTypeRowHeaders(table)).toEqual([]);

    const first = expander("S0001");
    expect(first).toHaveAccessibleName("Show data types for S0001");
    expect(first).toHaveAttribute("aria-expanded", "false");

    await user.click(first);
    expect(expander("S0001")).toHaveAttribute("aria-expanded", "true");
    expect(expander("S0001")).toHaveAccessibleName("Hide data types for S0001");
    expect(dataTypeRowHeaders(groupOf("S0001"))).toEqual(DATA_TYPE_NAMES);
    expect(dataTypeRowHeaders(table)).toHaveLength(4);
    expect(
      screen.getAllByRole("button", { name: /data types for / }).filter((button) => {
        return button.getAttribute("aria-expanded") === "true";
      }),
    ).toHaveLength(1);

    expander("S0002").focus();
    await user.keyboard("{Enter}");
    expect(expander("S0002")).toHaveAttribute("aria-expanded", "true");
    expect(dataTypeRowHeaders(groupOf("S0002"))).toEqual(DATA_TYPE_NAMES);

    await user.click(expander("S0001"));
    expect(expander("S0001")).toHaveAttribute("aria-expanded", "false");
    expect(dataTypeRowHeaders(groupOf("S0001"))).toEqual([]);
  });
});

const AAPL_REASON = "[failed] symbol=AAPL data_type=prices request_id=req-1: upstream returned 503";
const ZZZZ_REASON = (dataType: string) =>
  `[not_found] symbol=ZZZZ data_type=${dataType} request_id=req-2: unknown symbol`;

const MIXED: RunResult[] = [
  result(1, "AAPL", "prices", "failed", AAPL_REASON),
  result(1, "AAPL", "reference", "written"),
  result(1, "AAPL", "fundamentals", "written"),
  result(1, "AAPL", "corporate_actions", "written"),
  ...ALL_TYPES.map((dataType) => result(2, "ZZZZ", dataType, "not_found", ZZZZ_REASON(dataType))),
  ...ALL_TYPES.map((dataType) => result(3, "MSFT", dataType, "written")),
];

async function renderMixedExpanded() {
  const user = userEvent.setup();
  getMock.mockResolvedValue(detail(run("partial"), MIXED));
  renderScreen();
  await screen.findByRole("table");
  for (const symbol of ["AAPL", "ZZZZ", "MSFT"]) {
    await user.click(expander(symbol));
  }
  return user;
}

// Implements TC-COMP-010
// Implements TC-COMP-011
describe("Per-instrument, per-data-type reasons (AC-10, AC-11)", () => {
  it("states the operation, the resource and the reason for a failed data type", async () => {
    await renderMixedExpanded();
    expect(
      within(groupOf("AAPL")).getByText(`Acquiring prices for AAPL failed: ${AAPL_REASON}`),
    ).toBeInTheDocument();
  });

  it("distinguishes an unrecognised instrument, and the run visibly continued past it", async () => {
    await renderMixedExpanded();
    const zzzz = groupOf("ZZZZ");
    expect(
      within(zzzz).getByText(
        `Acquiring reference for ZZZZ: not found at the provider. ${ZZZZ_REASON("reference")}`,
      ),
    ).toBeInTheDocument();
    expect(
      within(zzzz).getByText(
        `Acquiring corporate actions for ZZZZ: not found at the provider. ${ZZZZ_REASON("corporate_actions")}`,
      ),
    ).toBeInTheDocument();
    expect(zzzz.textContent ?? "").not.toMatch(/failed/i);

    const msft = groupOf("MSFT");
    expect(dataTypeRowHeaders(msft)).toEqual(DATA_TYPE_NAMES);
    expect(within(msft).getAllByText("Written").length).toBeGreaterThanOrEqual(4);
  });
});

function badgeIn(container: HTMLElement, label: string): HTMLElement {
  const badge = within(container)
    .getAllByTestId("result-outcome-badge")
    .find((element) => element.textContent === label);
  if (badge === undefined) {
    throw new Error(`no ${label} badge`);
  }
  return badge;
}

describe("Roster order (ux-design 1.5: failure-first, as the API serves it)", () => {
  it("keeps the server's instrument order rather than re-sorting it", async () => {
    getMock.mockResolvedValue(detail(run("partial"), MIXED));
    renderScreen();
    await screen.findByRole("table");
    expect(
      screen
        .getAllByRole("button", { name: /^Show data types for / })
        .map((button) => button.getAttribute("aria-label")),
    ).toEqual(["Show data types for AAPL", "Show data types for ZZZZ", "Show data types for MSFT"]);
  });
});

// Implements TC-COMP-067
// Implements TC-COMP-095
describe("not_found is distinguishable from failed (DAC-E7-2, DAC-E7-S4-4)", () => {
  it("differs in text, variant and icon on data-type rows and collapsed rows alike", async () => {
    await renderMixedExpanded();
    const zzzz = groupOf("ZZZZ");
    const aapl = groupOf("AAPL");

    const notFoundRows = within(zzzz)
      .getAllByTestId("result-outcome-badge")
      .filter((badge) => badge.closest("tr")?.querySelector("button") === null);
    expect(notFoundRows).toHaveLength(4);
    for (const badge of notFoundRows) {
      expect(badge).toHaveTextContent("Not found");
      expect(badge).toHaveAttribute("data-variant", "status-warning");
      expect(badge.querySelector("svg")).toHaveAttribute("data-icon", "warning");
    }

    const failed = badgeIn(aapl, "Failed");
    expect(failed).toHaveAttribute("data-variant", "status-critical");
    expect(failed.querySelector("svg")).toHaveAttribute("data-icon", "critical");

    const collapsedZzzz = expander("ZZZZ").closest("tr") as HTMLElement;
    const collapsedAapl = expander("AAPL").closest("tr") as HTMLElement;
    expect(within(collapsedZzzz).getAllByTestId("result-outcome-badge")).toHaveLength(1);
    expect(badgeIn(collapsedZzzz, "Not found")).toHaveAttribute("data-variant", "status-warning");
    expect(badgeIn(collapsedZzzz, "Not found").querySelector("svg")).toHaveAttribute(
      "data-icon",
      "warning",
    );
    expect(badgeIn(collapsedAapl, "Failed")).toHaveAttribute("data-variant", "status-critical");
    expect(badgeIn(collapsedAapl, "Failed").querySelector("svg")).toHaveAttribute(
      "data-icon",
      "critical",
    );
    expect(
      within(collapsedAapl)
        .getAllByTestId("result-outcome-badge")
        .map((badge) => badge.textContent),
    ).toEqual(["Failed", "Written"]);
  });
});

// Implements TC-COMP-076
describe("Every status carries a word and an icon (DAC-E7-11)", () => {
  it.each<RunState>([
    "requested",
    "running",
    "cancelling",
    "succeeded",
    "partial",
    "failed",
    "cancelled",
    "abandoned",
  ])("the %s run's summary badge", async (state) => {
    getMock.mockResolvedValue(detail(run(state)));
    renderScreen();
    await screen.findByRole("heading", { level: 1 });
    const badge = await within(summary()).findByTestId("outcome-badge");
    expect(badge.textContent).toBe(RUN_STATE_LABEL[state]);
    expect(badge.textContent).not.toBe("");
    expect(badge.querySelector("svg[data-icon]")).not.toBeNull();
  });

  it.each<[ResultOutcome, string]>([
    ["written", "Written"],
    ["unchanged", "Unchanged"],
    ["not_found", "Not found"],
    ["failed", "Failed"],
    ["skipped", "Skipped"],
  ])("the %s data-type badge", async (outcome, label) => {
    const user = userEvent.setup();
    getMock.mockResolvedValue(detail(run("partial"), [result(1, "AAPL", "prices", outcome)]));
    renderScreen();
    await screen.findByRole("table");
    await user.click(expander("AAPL"));
    const badge = badgeIn(groupOf("AAPL"), label);
    expect(badge.querySelector("svg[data-icon]")).not.toBeNull();
  });

  it("gives failed and not_found different icons, so they survive greyscale", async () => {
    await renderMixedExpanded();
    const failedIcon = badgeIn(groupOf("AAPL"), "Failed").querySelector("svg");
    const notFoundIcon = badgeIn(groupOf("ZZZZ"), "Not found").querySelector("svg");
    expect(failedIcon?.getAttribute("data-icon")).not.toBe(notFoundIcon?.getAttribute("data-icon"));
  });
});

const RERUN_SENTENCE =
  "Re-running is safe: data already recorded is not duplicated or overwritten.";

// Implements TC-COMP-092
// Implements TC-COMP-093
describe("Recovery paths (DAC-E7-S4-1, DAC-E7-S4-2)", () => {
  it("explains an abandoned run beside a serious badge and offers a new run", async () => {
    getMock.mockResolvedValue(detail(run("abandoned")));
    renderScreen();
    expect(await screen.findByText(ABANDONED_EXPLANATION)).toBeInTheDocument();
    expect(within(summary()).getByTestId("outcome-badge")).toHaveAttribute(
      "data-variant",
      "status-serious",
    );
    expect(screen.getByRole("button", { name: "Start acquisition run" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Re-run acquisition" })).not.toBeInTheDocument();
    expect(screen.queryByText(RERUN_SENTENCE)).not.toBeInTheDocument();
  });

  it.each<RunState>(["failed", "partial"])(
    "offers re-run as the named recovery for a %s run, and it routes to the new run",
    async (state) => {
      const user = userEvent.setup();
      getMock.mockResolvedValue(detail(run(state)));
      startMock.mockResolvedValue({ runId: "r-9", state: "requested", queuedBehind: null });
      renderScreen();

      const button = await screen.findByRole("button", { name: "Re-run acquisition" });
      expect(button).toHaveAttribute("data-variant", "default");
      expect(screen.getByText(RERUN_SENTENCE)).toBeInTheDocument();

      await user.click(button);
      expect(startMock).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent("/runs/r-9"));
    },
  );

  it.each<RunState>(["succeeded", "cancelled", "requested", "running", "cancelling"])(
    "offers no re-run for a %s run",
    async (state) => {
      getMock.mockResolvedValue(detail(run(state)));
      renderScreen();
      await waitFor(() => within(summary()).getByTestId("outcome-badge"));
      expect(screen.queryByRole("button", { name: "Re-run acquisition" })).not.toBeInTheDocument();
      expect(screen.queryByText(RERUN_SENTENCE)).not.toBeInTheDocument();
    },
  );
});

function startedCell(): HTMLElement {
  const term = within(summary()).getByText("Started");
  const value = term.nextElementSibling;
  if (!(value instanceof HTMLElement)) {
    throw new Error("no Started value");
  }
  return value;
}

// Implements TC-COMP-019
// Implements TC-COMP-026
// Implements TC-COMP-094
describe("Cancelling from Run detail (AC-19, AC-26, DAC-E7-S4-3)", () => {
  it("withdraws the action and shows one Cancelling badge for a running run", async () => {
    const user = userEvent.setup();
    getMock
      .mockResolvedValueOnce(detail(run("running")))
      .mockResolvedValue(detail(run("cancelling")));
    cancelMock.mockResolvedValue({ state: "cancelling" });
    renderScreen();

    await user.click(await screen.findByRole("button", { name: "Cancel run" }));
    await user.click(screen.getByRole("button", { name: "Stop run" }));

    await waitFor(() => {
      const badges = screen.getAllByTestId("outcome-badge");
      expect(badges).toHaveLength(1);
      expect(badges[0]).toHaveTextContent("Cancelling");
      expect(badges[0]).toHaveAttribute("data-variant", "status-warning");
    });
    expect(within(summary()).getByTestId("outcome-badge")).toHaveTextContent("Cancelling");
    expect(screen.queryByRole("button", { name: "Cancel run" })).not.toBeInTheDocument();
  });

  it("cancels a queued run with its own copy, at once, with no started time", async () => {
    const user = userEvent.setup();
    getMock
      .mockResolvedValueOnce(detail(run("requested")))
      .mockResolvedValue(detail(run("cancelled", { startedAt: null })));
    cancelMock.mockResolvedValue({ state: "cancelled" });
    renderScreen();

    await user.click(await screen.findByRole("button", { name: "Cancel run" }));
    expect(within(screen.getByRole("dialog")).getByRole("heading")).toHaveTextContent(
      "Cancel this queued run?",
    );
    await user.click(screen.getByRole("button", { name: "Cancel queued run" }));

    await waitFor(() => {
      const badge = within(summary()).getByTestId("outcome-badge");
      expect(badge).toHaveTextContent("Cancelled");
      expect(badge).toHaveAttribute("data-variant", "status-neutral");
    });
    expect(startedCell()).toHaveTextContent("—");
    expect(within(startedCell()).getByText("Not recorded")).toHaveClass("sr-only");
    expect(document.body).not.toHaveTextContent(/Cancelling/);
  });

  it("shows one cancelled summary badge while the detail refetch is pending", async () => {
    const user = userEvent.setup();
    let resolveRefetch!: (value: RunDetail) => void;
    const refetch = new Promise<RunDetail>((resolve) => {
      resolveRefetch = resolve;
    });
    getMock.mockResolvedValueOnce(detail(run("requested"))).mockReturnValueOnce(refetch);
    cancelMock.mockResolvedValue({ state: "cancelled" });
    renderScreen();

    await user.click(await screen.findByRole("button", { name: "Cancel run" }));
    await user.click(screen.getByRole("button", { name: "Cancel queued run" }));

    await waitFor(() => expect(getMock).toHaveBeenCalledTimes(2));
    await waitFor(() => {
      const badges = within(summary()).getAllByTestId("outcome-badge");
      expect(badges).toHaveLength(1);
      expect(badges[0]).toHaveTextContent("Cancelled");
    });

    resolveRefetch(detail(run("cancelled", { startedAt: null })));
    await waitFor(() =>
      expect(within(summary()).getByTestId("outcome-badge")).toHaveTextContent("Cancelled"),
    );
  });

  it("says the run had already completed when the cancel races completion", async () => {
    const user = userEvent.setup();
    getMock
      .mockResolvedValueOnce(detail(run("running")))
      .mockResolvedValue(detail(run("succeeded")));
    cancelMock.mockRejectedValue(
      new ApiError("Run already reached a terminal state.", "req-3", {
        code: "run_already_terminal",
        state: "succeeded",
      }),
    );
    renderScreen();

    await user.click(await screen.findByRole("button", { name: "Cancel run" }));
    await user.click(screen.getByRole("button", { name: "Stop run" }));

    expect(await screen.findByText("This run had already completed.")).toBeInTheDocument();
    // The summary's badge and, per DEC-0018, the control's actual outcome.
    await waitFor(() =>
      expect(
        within(summary())
          .getAllByTestId("outcome-badge")
          .map((badge) => badge.textContent),
      ).toEqual(["Succeeded", "Succeeded"]),
    );
    expect(screen.getByText("This run had already completed.")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/Cancelled/);
    expect(document.body).not.toHaveTextContent(/Cancelling/);
  });
});

function outcomeFilter(): HTMLElement {
  return screen.getByRole("combobox", { name: "Outcome" });
}

// Implements TC-COMP-098
describe("Filter and paging (DAC-E7-S4-7)", () => {
  const unfiltered = detail(run("partial"), MIXED);
  const notFoundPage1 = detail(
    run("partial"),
    [
      ...ALL_TYPES.slice(0, 2).map((dataType) => result(2, "ZZZZ", dataType, "not_found")),
      result(4, "YYYY", "prices", "not_found"),
    ],
    { nextCursor: "c1" },
  );
  const notFoundPage2 = detail(run("partial"), [result(5, "XXXX", "reference", "not_found")]);

  it("first requests the server's default page, with no limit, outcome or cursor", async () => {
    getMock.mockResolvedValue(unfiltered);
    renderScreen();
    await screen.findByRole("table");
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock.mock.calls[0][0]).toBe("r-1");
    expect(getMock.mock.calls[0][1]).toEqual({});
    expect(Object.keys(getMock.mock.calls[0][1] ?? {})).toEqual([]);
  });

  it("filters on the server, keeps focus, announces the count, and shows only returned rows", async () => {
    const user = userEvent.setup();
    getMock.mockResolvedValueOnce(unfiltered).mockResolvedValueOnce({
      ...notFoundPage1,
      nextCursor: null,
    });
    renderScreen();
    await screen.findByRole("table");

    expect(outcomeFilter()).toHaveAttribute("data-variant", "inline");
    await user.selectOptions(outcomeFilter(), "Not found");
    expect(getMock).toHaveBeenLastCalledWith("r-1", { outcome: "not_found" });
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /data types for AAPL$/ })).toBeNull(),
    );
    await screen.findByRole("button", { name: "Show data types for YYYY" });
    expect(screen.queryByRole("button", { name: /data types for MSFT$/ })).toBeNull();
    expect(outcomeFilter()).toHaveFocus();
    expect(screen.getByText("2 instruments shown")).toHaveAttribute("aria-live", "polite");

    await user.click(expander("ZZZZ"));
    expect(dataTypeRowHeaders(groupOf("ZZZZ"))).toEqual(["Fundamentals", "Corporate actions"]);
  });

  it("states an empty filter result and resets it", async () => {
    const user = userEvent.setup();
    getMock
      .mockResolvedValueOnce(unfiltered)
      .mockResolvedValueOnce(detail(run("partial"), []))
      .mockResolvedValue(unfiltered);
    renderScreen();
    await screen.findByRole("table");

    await user.selectOptions(outcomeFilter(), "Skipped");
    expect(
      await screen.findByText("No instrument in this run matches this filter."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reset filter" }));
    expect(getMock).toHaveBeenLastCalledWith("r-1", {});
    await screen.findByRole("table");
  });

  it("pages forward and back, each page replacing the last, and a filter change returns to page 1", async () => {
    const user = userEvent.setup();
    getMock
      .mockResolvedValueOnce(unfiltered)
      .mockResolvedValueOnce(notFoundPage1)
      .mockResolvedValueOnce(notFoundPage2)
      .mockResolvedValueOnce(notFoundPage1)
      .mockResolvedValueOnce(notFoundPage2)
      .mockResolvedValue(unfiltered);
    renderScreen();
    await screen.findByRole("table");

    await user.selectOptions(outcomeFilter(), "Not found");
    await screen.findByRole("button", { name: "Show data types for YYYY" });
    expect(screen.queryByRole("button", { name: "Previous page" })).not.toBeInTheDocument();
    expect(screen.getByText("Page 1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(getMock).toHaveBeenLastCalledWith("r-1", { outcome: "not_found", cursor: "c1" });
    await screen.findByRole("button", { name: "Show data types for XXXX" });
    expect(screen.queryByRole("button", { name: /data types for YYYY$/ })).toBeNull();
    expect(screen.getByText("Page 2")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next page" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Previous page" }));
    expect(getMock).toHaveBeenLastCalledWith("r-1", { outcome: "not_found" });
    await screen.findByRole("button", { name: "Show data types for YYYY" });
    expect(screen.getByText("Page 1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next page" }));
    await screen.findByText("Page 2");
    await user.selectOptions(outcomeFilter(), "All");
    expect(getMock).toHaveBeenLastCalledWith("r-1", {});
    await screen.findByRole("button", { name: /data types for MSFT$/ });
    expect(screen.getByText("Page 1")).toBeInTheDocument();
  });
});

describe("Load failure keeps the summary (ux-design 1.5 States)", () => {
  it("replaces the body with an alert and Retry, keeping the last summary", async () => {
    const user = userEvent.setup();
    getMock
      .mockResolvedValueOnce(detail(run("partial"), MIXED))
      .mockRejectedValueOnce(new ApiError("boom", "req-7"))
      .mockResolvedValue(detail(run("partial"), MIXED));
    renderScreen();
    await screen.findByRole("table");

    await user.selectOptions(outcomeFilter(), "Failed");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Loading run r-1 failed: boom (request req-7)",
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(within(summary()).getByTestId("outcome-badge")).toHaveTextContent("Partial");

    await user.click(screen.getByRole("button", { name: "Retry" }));
    await screen.findByRole("table");
  });
});
