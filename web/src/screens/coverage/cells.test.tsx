import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { fetchCoverage } from "../../api/client";
import {
  CountValue,
  GapsCell,
  Inapplicable,
  MissingValue,
  SessionDate,
  Timestamp,
  formatSessionDate,
} from "./cells";
import { reasonSentence } from "./copy";
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

/** The text a sighted reader sees: everything outside `sr-only`. */
function visibleText(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  for (const hidden of clone.querySelectorAll(".sr-only")) {
    hidden.remove();
  }
  return clone.textContent ?? "";
}

describe("TC-COMP-059: absent, measured zero and inapplicable render distinctly (DAC-E6-S4-1)", () => {
  // Implements TC-COMP-059
  it("renders each of the three states with its own text and data-state", () => {
    const { container: missing } = render(<MissingValue />);
    const missingEl = missing.firstElementChild as HTMLElement;
    expect(visibleText(missingEl)).toBe("—");
    expect(within(missingEl).getByText("—")).toHaveAttribute("aria-hidden", "true");
    expect(within(missingEl).getByText("No data")).toHaveClass("sr-only");
    expect(missingEl).toHaveAttribute("data-state", "missing");
    expect(missingEl).toHaveClass("text-value-missing");

    const { container: zero } = render(<CountValue value={0} />);
    const zeroEl = zero.firstElementChild as HTMLElement;
    expect(zeroEl.textContent).toBe("0");
    expect(zeroEl).toHaveAttribute("data-state", "measured");
    expect(zeroEl).toHaveClass("font-numeric");

    const { container: blank } = render(<Inapplicable />);
    const blankEl = blank.firstElementChild as HTMLElement;
    expect(visibleText(blankEl)).toBe("");
    expect(within(blankEl).getByText("Not applicable")).toHaveClass("sr-only");
    expect(blankEl).toHaveAttribute("data-state", "inapplicable");

    const states = [missingEl, zeroEl, blankEl].map((el) => el.getAttribute("data-state"));
    const texts = [missingEl, zeroEl, blankEl].map(visibleText);
    expect(new Set(states).size).toBe(3);
    expect(new Set(texts).size).toBe(3);
  });

  // Implements TC-COMP-059
  it("renders a missing value in the range and last-acquired cells of a row with no data", async () => {
    vi.mocked(fetchCoverage).mockResolvedValue(
      view({ rows: [row({ coveredFrom: null, coveredTo: null, lastAcquiredAt: null })] }),
    );
    render(
      <MemoryRouter>
        <CoverageScreen />
      </MemoryRouter>,
    );
    const tr = (await screen.findByRole("rowheader")).closest("tr") as HTMLTableRowElement;
    for (const index of [6, 7, 10]) {
      expect(tr.children[index]?.querySelector("[data-state='missing']")).not.toBeNull();
    }
  });
});

describe("TC-COMP-060: ISO-8601, session dates unconverted, timestamps in Chicago (DAC-E6-S4-2)", () => {
  // Implements TC-COMP-060
  it("leaves session dates byte-identical to the wire", () => {
    const { container } = render(<SessionDate value="2024-01-02" />);
    expect(container.textContent).toBe("2024-01-02");
    expect(formatSessionDate("2024-12-31")).toBe("2024-12-31");
    expect(formatSessionDate("2024-01-01")).toBe("2024-01-01");
  });

  // Implements TC-COMP-060
  it("renders instants in America/Chicago under both CDT and CST", () => {
    const { container: summer } = render(<Timestamp value="2026-09-05T22:14:03Z" />);
    expect(summer.textContent).toBe("2026-09-05 17:14:03 America/Chicago");
    const { container: winter } = render(<Timestamp value="2026-01-15T06:30:00Z" />);
    expect(winter.textContent).toBe("2026-01-15 00:30:00 America/Chicago");
  });
});

describe("GapsCell decision table (DAC-E6-4, DAC-E6-S4-1, DAC-E6-5)", () => {
  function stateOf(element: Element): string | null {
    return (element.firstElementChild as HTMLElement).getAttribute("data-state");
  }

  it("renders counts, a measured zero, inapplicable and unknown from count and availability", () => {
    const three = render(<GapsCell gapCount={3} available />).container;
    expect(stateOf(three)).toBe("measured");
    expect(three.textContent).toBe("3");

    const zero = render(<GapsCell gapCount={0} available />).container;
    expect(stateOf(zero)).toBe("measured");
    expect(zero.textContent).toBe("0");

    const inapplicable = render(<GapsCell gapCount={null} available />).container;
    expect(stateOf(inapplicable)).toBe("inapplicable");

    const unknown = render(<GapsCell gapCount={null} available={false} />).container;
    expect(within(unknown).getByTestId("gaps-unknown-badge")).toBeInTheDocument();

    const contradictory = render(<GapsCell gapCount={4} available={false} />).container;
    expect(within(contradictory).getByTestId("gaps-unknown-badge")).toBeInTheDocument();
    expect(contradictory.textContent).not.toContain("4");
  });

  it("maps the known reason code verbatim and shows an unknown code as text", () => {
    expect(reasonSentence(UNAVAILABLE_REASON)).toBe(
      "Gap detection needs at least two instruments holding data in this range.",
    );
    expect(reasonSentence("something_new")).toBe("Gap detection is unavailable (something_new).");
  });
});
