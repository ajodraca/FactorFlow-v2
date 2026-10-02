import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  type CoverageFilters,
  fetchCoverage,
  fetchCoverageGapDates,
} from "../../api/client";
import CoverageScreen from "./index";
import { row, view } from "./test-fixtures";

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

const NO_GAPS = "No missing trading days in the covered range.";
const GAPS_INAPPLICABLE =
  "Gap detection applies to daily prices only, and no daily prices are covered for this instrument.";

function renderScreen(): void {
  render(
    <MemoryRouter initialEntries={["/coverage"]}>
      <CoverageScreen />
    </MemoryRouter>,
  );
}

function gapsCell(symbol: string): HTMLElement {
  const rowHeader = screen.getByRole("rowheader", { name: new RegExp(`\\b${symbol}\\b`) });
  const tr = rowHeader.closest("tr") as HTMLTableRowElement;
  return tr.children[8] as HTMLElement;
}

/** The expansion region the expander controls. */
function expansionRegion(expander: HTMLElement): HTMLElement {
  const id = expander.getAttribute("aria-controls") as string;
  const detailRow = document.getElementById(id) as HTMLElement;
  return detailRow.querySelector("[aria-live='polite']") as HTMLElement;
}

function symbols(start: number, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `S${String(start + i).padStart(4, "0")}`);
}

/** Body rows that carry a row header, i.e. instrument rows rather than expansions. */
function bodyRowSymbols(): string[] {
  return screen.getAllByRole("rowheader").map((header) => {
    const clone = header.cloneNode(true) as Element;
    clone.querySelector("button")?.remove();
    return (clone.textContent ?? "").trim();
  });
}

beforeEach(() => {
  fetchCoverageMock.mockReset();
  fetchGapDatesMock.mockReset();
});

describe("TC-COMP-008: the gap count sits in the row, dates behind expansion (AC-8)", () => {
  // Implements TC-COMP-008
  it("shows counts, fetches dates once on Enter, caches them, and never fetches for a zero", async () => {
    const user = userEvent.setup();
    fetchCoverageMock.mockResolvedValue(
      view({ rows: [row({ symbol: "CVA", gapCount: 0 }), row({ symbol: "CVC", gapCount: 2 })] }),
    );
    fetchGapDatesMock.mockResolvedValue({
      symbol: "CVC",
      gapDates: ["2024-01-04", "2024-01-03"],
    });
    renderScreen();
    await screen.findByRole("table");

    expect(gapsCell("CVC")).toHaveTextContent(/^2$/);
    expect(gapsCell("CVA")).toHaveTextContent(/^0$/);
    expect(fetchGapDatesMock).not.toHaveBeenCalled();
    expect(screen.queryByText("2024-01-03")).toBeNull();

    const expander = screen.getByRole("button", { name: "Show details for CVC" });
    expect(expander).toHaveAttribute("aria-expanded", "false");

    expander.focus();
    await user.keyboard("{Enter}");

    expect(expander).toHaveAttribute("aria-expanded", "true");
    expect(expander).toHaveAccessibleName("Hide details for CVC");
    expect(expander).toHaveFocus();
    expect(fetchGapDatesMock).toHaveBeenCalledTimes(1);
    expect(fetchGapDatesMock).toHaveBeenCalledWith("CVC");

    const region = expansionRegion(expander);
    await within(region).findByText("2024-01-03");
    const dates = within(region)
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(dates).toEqual(["2024-01-03", "2024-01-04"]);

    await user.keyboard("{Enter}");
    expect(expander).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("{Enter}");
    expect(await within(expansionRegion(expander)).findByText("2024-01-04")).toBeInTheDocument();
    expect(fetchGapDatesMock).toHaveBeenCalledTimes(1);

    const zero = screen.getByRole("button", { name: "Show details for CVA" });
    await user.click(zero);
    expect(within(expansionRegion(zero)).getByText(NO_GAPS)).toBeInTheDocument();
    expect(fetchGapDatesMock).toHaveBeenCalledTimes(1);
  });

  it("reports a failed date load in STD-UI-19 form with a Retry that re-invokes the call", async () => {
    const user = userEvent.setup();
    fetchCoverageMock.mockResolvedValue(view({ rows: [row({ symbol: "CVC", gapCount: 2 })] }));
    fetchGapDatesMock.mockRejectedValue(new ApiError("instrument not found", "req-9"));
    renderScreen();
    await screen.findByRole("table");

    const expander = screen.getByRole("button", { name: "Show details for CVC" });
    await user.click(expander);
    const region = expansionRegion(expander);
    expect(
      await within(region).findByText(
        "Loading missing dates for CVC failed: instrument not found (request req-9)",
      ),
    ).toBeInTheDocument();

    await user.click(within(region).getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(fetchGapDatesMock).toHaveBeenCalledTimes(2));
  });

  it("explains an inapplicable count on an available view without fetching", async () => {
    const user = userEvent.setup();
    fetchCoverageMock.mockResolvedValue(view({ rows: [row({ symbol: "NOPX", gapCount: null })] }));
    renderScreen();
    await screen.findByRole("table");

    const expander = screen.getByRole("button", { name: "Show details for NOPX" });
    await user.click(expander);
    expect(within(expansionRegion(expander)).getByText(GAPS_INAPPLICABLE)).toBeInTheDocument();
    expect(fetchGapDatesMock).not.toHaveBeenCalled();
  });
});

describe("TC-COMP-063: search and filter stay usable at volume (DAC-E6-S4-5)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  // Implements TC-COMP-063
  it("filters server-side, scrolls in its own container, and replaces pages", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const pageOne = view({
      rows: symbols(1, 50).map((symbol) => row({ symbol })),
      nextCursor: "S0050",
    });
    const pageTwo = view({
      rows: symbols(51, 50).map((symbol) => row({ symbol })),
      nextCursor: null,
    });
    fetchCoverageMock.mockImplementation(async (filters: CoverageFilters = {}) => {
      if (filters.symbol || filters.lifecycle) {
        return view({ rows: [row({ symbol: "AAPL" }), row({ symbol: "AAL" })] });
      }
      return filters.cursor === "S0050" ? pageTwo : pageOne;
    });
    renderScreen();

    const table = await screen.findByRole("table");
    const scroll = screen.getByTestId("coverage-table-scroll");
    expect(scroll).toContainElement(table);
    expect(scroll.className).toContain("overflow-auto");
    expect(scroll.className).toContain("min-h-0");
    expect(screen.queryByRole("button", { name: "Previous page" })).toBeNull();

    const input = screen.getByRole("textbox", { name: "Filter by symbol" });
    await user.type(input, "AA");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(fetchCoverageMock).toHaveBeenLastCalledWith({
      symbol: "AA",
      lifecycle: undefined,
      cursor: undefined,
    });
    expect(input).toHaveFocus();
    expect(await screen.findByText("2 instruments shown")).toHaveAttribute("aria-live", "polite");

    await user.selectOptions(screen.getByRole("combobox", { name: "Lifecycle" }), "retired");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(fetchCoverageMock.mock.lastCall?.[0]?.lifecycle).toBe("retired");

    await user.clear(input);
    await user.selectOptions(screen.getByRole("combobox", { name: "Lifecycle" }), "");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    await screen.findByRole("rowheader", { name: /\bS0001\b/ });

    await user.click(screen.getByRole("button", { name: "Next page" }));
    await screen.findByRole("rowheader", { name: /\bS0051\b/ });
    expect(fetchCoverageMock.mock.lastCall?.[0]?.cursor).toBe("S0050");
    expect(bodyRowSymbols()).toEqual(symbols(51, 50));
    expect(screen.queryByRole("rowheader", { name: /\bS0001\b/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Next page" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Previous page" }));
    await screen.findByRole("rowheader", { name: /\bS0001\b/ });
    expect(fetchCoverageMock.mock.lastCall?.[0]?.cursor).toBeUndefined();
    expect(screen.queryByRole("button", { name: "Previous page" })).toBeNull();
  });
});
