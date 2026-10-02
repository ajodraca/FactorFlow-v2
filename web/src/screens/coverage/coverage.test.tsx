import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchCoverage, fetchCoverageGapDates } from "../../api/client";
import type { CoverageView } from "../../api/types";
import CoverageScreen from "./index";
import { UNAVAILABLE_REASON, row, view } from "./test-fixtures";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return {
    ...actual,
    fetchCoverage: vi.fn(),
    fetchCoverageGapDates: vi.fn(),
    getHistoryDepth: vi.fn().mockResolvedValue({ years: 5, updatedAt: null }),
    listInstruments: vi
      .fn()
      .mockResolvedValue({ rows: [], activeCount: 3, retiredCount: 0, nextCursor: null }),
  };
});

vi.mock("../runs/run-controls", async () => {
  const { createElement } = await vi.importActual<typeof import("react")>("react");
  return {
    StartRunControl: () => createElement("button", { type: "button" }, "Start acquisition run"),
  };
});

const fetchCoverageMock = vi.mocked(fetchCoverage);
const fetchGapDatesMock = vi.mocked(fetchCoverageGapDates);

const HEADERS = [
  "Symbol",
  "Lifecycle",
  "Reference",
  "Prices",
  "Fundamentals",
  "Corporate actions",
  "Covered from",
  "Covered to",
  "Gaps",
  "Depth",
  "Last acquired",
];

const UNAVAILABLE_SENTENCE =
  "Gap detection needs at least two instruments holding data in this range.";

function renderScreen(): void {
  render(
    <MemoryRouter initialEntries={["/coverage"]}>
      <CoverageScreen />
    </MemoryRouter>,
  );
}

function resolveWith(value: CoverageView): void {
  fetchCoverageMock.mockResolvedValue(value);
}

/** The cell under `header` in the row whose row header holds `symbol`. */
function cell(symbol: string, header: string): HTMLElement {
  const index = HEADERS.indexOf(header);
  const rowHeader = screen.getByRole("rowheader", { name: new RegExp(`\\b${symbol}\\b`) });
  const tr = rowHeader.closest("tr") as HTMLTableRowElement;
  return tr.children[index] as HTMLElement;
}

beforeEach(() => {
  fetchCoverageMock.mockReset();
  fetchGapDatesMock.mockReset();
});

describe("TC-COMP-007: each instrument shows presence, covered range and last acquired (AC-7)", () => {
  // Implements TC-COMP-007
  it("renders the row's presence badges, range and Chicago last-acquired under the 11 headers", async () => {
    resolveWith(view());
    renderScreen();

    const table = await screen.findByRole("table");
    const headers = within(table).getAllByRole("columnheader");
    expect(headers.map((header) => header.textContent)).toEqual(HEADERS);
    for (const header of headers) {
      expect(header).toHaveAttribute("scope", "col");
    }

    const rowHeader = within(table).getByRole("rowheader");
    expect(rowHeader).toHaveAttribute("scope", "row");
    expect(rowHeader).toHaveTextContent("AAPL");

    const tr = rowHeader.closest("tr") as HTMLTableRowElement;
    expect(within(tr).getAllByTestId("presence-badge")).toHaveLength(4);
    expect(cell("AAPL", "Covered from")).toHaveTextContent(/^2024-01-02$/);
    expect(cell("AAPL", "Covered to")).toHaveTextContent(/^2024-01-05$/);
    expect(cell("AAPL", "Last acquired")).toHaveTextContent(
      /^2026-09-05 17:14:03 America\/Chicago$/,
    );
  });
});

describe("TC-COMP-017: nothing acquired says so, never empty-and-healthy (AC-17)", () => {
  // Implements TC-COMP-017
  it("states that no data has been acquired and renders no table and no zero", async () => {
    resolveWith(
      view({
        neverAcquired: true,
        rows: [],
        gapDetection: { available: false, reason: UNAVAILABLE_REASON },
      }),
    );
    renderScreen();

    expect(await screen.findByText("No data has been acquired yet.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByText("0")).toBeNull();
    expect(screen.queryByText(/\b0 instruments\b/)).toBeNull();
  });
});

describe("TC-COMP-062: never-acquired and nothing-matched read differently (DAC-E6-S4-4)", () => {
  // Implements TC-COMP-062
  it("(a) never-acquired offers the run action and not the no-match copy", async () => {
    resolveWith(
      view({
        neverAcquired: true,
        rows: [],
        gapDetection: { available: false, reason: UNAVAILABLE_REASON },
      }),
    );
    renderScreen();

    expect(await screen.findByText("No data has been acquired yet.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start acquisition run" })).toBeInTheDocument();
    expect(screen.queryByText("No instrument matches this filter.")).toBeNull();
  });

  // Implements TC-COMP-062
  it("(b) a filter matching nothing has its own copy, and Reset filter refetches unfiltered", async () => {
    const user = userEvent.setup();
    resolveWith(view());
    renderScreen();
    await screen.findByRole("table");

    resolveWith(view({ rows: [] }));
    const input = screen.getByRole("textbox", { name: "Filter by symbol" });
    await user.type(input, "ZZ");

    expect(await screen.findByText("No instrument matches this filter.")).toBeInTheDocument();
    expect(screen.queryByText("No data has been acquired yet.")).toBeNull();
    const reset = screen.getByRole("button", { name: "Reset filter" });

    resolveWith(view());
    fetchCoverageMock.mockClear();
    await user.click(reset);

    expect(input).toHaveValue("");
    await waitFor(() => expect(fetchCoverageMock).toHaveBeenCalled());
    expect(fetchCoverageMock.mock.lastCall?.[0]?.symbol).toBeUndefined();
  });
});

describe("TC-COMP-021: retired instruments keep their coverage, marked distinctly (AC-21)", () => {
  // Implements TC-COMP-021
  it("marks a retired row with the secondary badge and still shows its range and presence", async () => {
    resolveWith(view({ rows: [row({ symbol: "MSFT", lifecycle: "retired" })] }));
    renderScreen();
    await screen.findByRole("table");

    const badge = within(cell("MSFT", "Lifecycle")).getByTestId("lifecycle-badge");
    expect(badge).toHaveAttribute("data-variant", "secondary");
    expect(badge).toHaveTextContent("Retired");
    expect(cell("MSFT", "Covered from")).toHaveTextContent("2024-01-02");
    expect(cell("MSFT", "Covered to")).toHaveTextContent("2024-01-05");
    const tr = cell("MSFT", "Symbol").closest("tr") as HTMLTableRowElement;
    expect(within(tr).getAllByTestId("presence-badge")).toHaveLength(4);
  });
});

describe("TC-COMP-022: a shortfall shows as short by a stated number of years (AC-22)", () => {
  // Implements TC-COMP-022
  it("marks only positive shortfalls, singular and plural, and leaves the rest blank", async () => {
    resolveWith(
      view({
        rows: [
          row({ symbol: "SHRT", depthShortByYears: 2 }),
          row({ symbol: "ONE", depthShortByYears: 1 }),
          row({ symbol: "MEET", depthShortByYears: null }),
          row({ symbol: "ZERO", depthShortByYears: 0 }),
        ],
      }),
    );
    renderScreen();
    await screen.findByRole("table");

    const shrt = within(cell("SHRT", "Depth")).getByTestId("depth-short-badge");
    expect(shrt).toHaveAttribute("data-variant", "status-warning");
    expect(shrt).toHaveTextContent("Short by 2 years");
    expect(within(cell("ONE", "Depth")).getByTestId("depth-short-badge")).toHaveTextContent(
      /Short by 1 year$/,
    );
    for (const symbol of ["MEET", "ZERO"]) {
      const depth = cell(symbol, "Depth");
      expect(within(depth).queryByTestId("depth-short-badge")).toBeNull();
      expect(depth).toHaveTextContent(/^$/);
    }
  });
});

describe("TC-COMP-030: gap detection unavailable shows the reason, never a zero (DAC-E6-4)", () => {
  // Implements TC-COMP-030
  it("renders Unknown with the indeterminate pattern and the reason once, and expansion does not fetch", async () => {
    const user = userEvent.setup();
    resolveWith(
      view({
        rows: [row({ symbol: "AAA", gapCount: null }), row({ symbol: "BBB", gapCount: null })],
        gapDetection: { available: false, reason: UNAVAILABLE_REASON },
      }),
    );
    renderScreen();
    await screen.findByRole("table");

    for (const symbol of ["AAA", "BBB"]) {
      const gaps = cell(symbol, "Gaps");
      const badge = within(gaps).getByTestId("gaps-unknown-badge");
      expect(badge).toHaveAttribute("data-variant", "coverage-unknown");
      expect(badge).toHaveTextContent("Unknown");
      expect(badge).toHaveClass("bg-pattern-indeterminate");
      expect(gaps.textContent).not.toBe("0");
    }
    expect(screen.getAllByText(UNAVAILABLE_SENTENCE)).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Show details for AAA" }));
    expect(screen.getAllByText(UNAVAILABLE_SENTENCE)).toHaveLength(2);
    expect(fetchGapDatesMock).not.toHaveBeenCalled();
  });
});

describe("TC-COMP-064: a uniform shortfall reads as a plan limit (DAC-E6-S4-6)", () => {
  // Implements TC-COMP-064
  it("shows the plan-limit note when every covered row is short by the same amount", async () => {
    resolveWith(
      view({
        rows: ["U1", "U2", "U3"].map((symbol) => row({ symbol, depthShortByYears: 3 })),
      }),
    );
    renderScreen();
    await screen.findByRole("table");

    const note = screen.getByTestId("plan-limit-note");
    expect(note).toHaveTextContent("3 years");
    expect(note).toHaveTextContent("provider plan");
    for (const symbol of ["U1", "U2", "U3"]) {
      expect(within(cell(symbol, "Depth")).getByTestId("depth-short-badge")).toHaveTextContent(
        "Short by 3 years",
      );
      expect(cell(symbol, "Gaps")).toHaveTextContent(/^0$/);
    }
  });

  // Implements TC-COMP-064
  it("omits the note for a mixed shortfall", async () => {
    resolveWith(
      view({
        rows: [
          row({ symbol: "M1", depthShortByYears: 3 }),
          row({ symbol: "M2", depthShortByYears: 3 }),
          row({ symbol: "M3", depthShortByYears: null }),
        ],
      }),
    );
    renderScreen();
    await screen.findByRole("table");
    expect(screen.queryByTestId("plan-limit-note")).toBeNull();
  });

  // Implements TC-COMP-064
  it("omits the note for a single row", async () => {
    resolveWith(view({ rows: [row({ symbol: "S1", depthShortByYears: 3 })] }));
    renderScreen();
    await screen.findByRole("table");
    expect(screen.queryByTestId("plan-limit-note")).toBeNull();
  });
});
