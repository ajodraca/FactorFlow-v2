import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { type JSX, Profiler, useLayoutEffect } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClassificationApiError, getStockEvidence } from "../../api/classification-client";
import type {
  FactorCell as FactorCellData,
  FactorName,
  InputRow,
  StockEvidence,
} from "../../api/classification-types";
import { CELL, REGIONS, RESULTS, SELECTION, failureSentence } from "../../screens/research/copy";
import { INSPECT_DEBOUNCE_MS, InspectorPanel } from "./inspector-panel";

vi.mock("../../api/classification-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../api/classification-client")>();
  return { ...actual, getStockEvidence: vi.fn() };
});

const read = vi.mocked(getStockEvidence);

const LOADING = "Loading the selected stock.";

/** A `FactorCell` response value (classification-api section 2.7) with the unused fields null and false. */
function cell(overrides: Partial<FactorCellData> = {}): FactorCellData {
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

function scored(percentile: string, score: string, overrides: Partial<FactorCellData> = {}) {
  return cell({ status: "classified", percentile, score, ...overrides });
}

/** A `StockEvidence` read (classification-api section 2.7): scored on all three factors, in no universe. */
function evidence(overrides: Partial<StockEvidence> = {}): StockEvidence {
  return {
    symbol: "AAPL",
    name: "Apple Inc.",
    lifecycle: "active",
    set: null,
    factors: {
      value: scored("88", "1.27"),
      growth: scored("40", "-0.25"),
      momentum: scored("61", "0.00"),
    },
    inputs: [],
    memberships: [],
    ...overrides,
  };
}

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (cause: unknown) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve: (value: T) => void = () => undefined;
  let reject: (cause: unknown) => void = () => undefined;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

function panel(symbol: string | null): JSX.Element {
  return (
    <MemoryRouter>
      <InspectorPanel symbol={symbol} />
    </MemoryRouter>
  );
}

function inspector(): HTMLElement {
  return screen.getByRole("region", { name: REGIONS.selectedStock });
}

/** The delivered `button` `outline` classes (`screens/instruments/start-action.tsx`; UX design 1.1). */
const OUTLINE_BUTTON = ["w-fit", "rounded", "border", "border-border", "px-3", "py-2", "text-sm"];

/** The delivered `card` `summary` classes (classification-ui section 2.5; UX design 1.1). */
const SUMMARY_CARD = [
  "rounded",
  "border",
  "border-border",
  "bg-card",
  "p-4",
  "text-card-foreground",
];

/** Whether `earlier` comes before `later` in document order. */
function precedes(earlier: Element, later: Element): boolean {
  return (earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}

async function advance(ms: number): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

/** Settles a read the test controls, flushing the state update it causes. */
async function settle(action: () => void): Promise<void> {
  await act(async () => {
    action();
    await Promise.resolve();
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  read.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("TC-COMP-141: the inspector waits 150 ms, then issues one read (DAC-E4-S7-2; DEC-0164)", () => {
  // Implements TC-COMP-141
  it("exports the 150 ms wait", () => {
    expect(INSPECT_DEBOUNCE_MS).toBe(150);
  });

  it("issues no read before 150 ms and exactly one at 150 ms, then none", async () => {
    read.mockReturnValue(deferred<StockEvidence>().promise);
    const { rerender } = render(panel("AAPL"));
    expect(read).not.toHaveBeenCalled();
    await advance(149);
    expect(read).not.toHaveBeenCalled();
    await advance(1);
    expect(read).toHaveBeenCalledTimes(1);
    expect(read).toHaveBeenCalledWith("AAPL");

    rerender(panel("AAPL"));
    await advance(10_000);
    expect(read).toHaveBeenCalledTimes(1);
  });

  it("issues no further read once the read has settled, even on re-render", async () => {
    read.mockResolvedValue(evidence());
    const { rerender } = render(panel("AAPL"));
    await advance(150);
    expect(within(inspector()).getByText("Apple Inc.")).toBeInTheDocument();
    rerender(panel("AAPL"));
    await advance(10_000);
    expect(read).toHaveBeenCalledTimes(1);
  });

  it("issues one read for a burst of selections, for the last, 150 ms after it", async () => {
    read.mockReturnValue(deferred<StockEvidence>().promise);
    const { rerender } = render(panel("AAPL"));
    await advance(50);
    rerender(panel("MSFT"));
    await advance(50);
    rerender(panel("NVDA"));
    await advance(149);
    expect(read).not.toHaveBeenCalled();
    await advance(1);
    expect(read).toHaveBeenCalledTimes(1);
    expect(read).toHaveBeenCalledWith("NVDA");
    await advance(1_000);
    expect(read).toHaveBeenCalledTimes(1);
  });
});

describe("TC-COMP-142: nothing selected reads the empty sentence (DAC-E4-S7-3)", () => {
  // Implements TC-COMP-142
  it("renders the Selected stock section with the empty sentence alone and issues no read", async () => {
    render(panel(null));
    const section = inspector();
    expect(section.tagName).toBe("SECTION");
    expect(section).toHaveClass(...SUMMARY_CARD);
    expect(section).toHaveTextContent(/^Select a stock to see why it scores as it does\.$/);
    expect(section).toHaveTextContent(SELECTION.inspectorEmpty);
    await advance(1_000);
    expect(read).not.toHaveBeenCalled();
    expect(within(section).queryByRole("link")).toBeNull();
    expect(within(section).queryByRole("status")).toBeNull();
    expect(within(section).queryByRole("button")).toBeNull();
    expect(section).not.toHaveTextContent(SELECTION.inNoUniverse);
    expect(section).not.toHaveTextContent(SELECTION.footnote);
    expect(section).not.toHaveTextContent(LOADING);
  });

  it("returns to the empty sentence from a loaded stock", async () => {
    read.mockResolvedValue(evidence());
    const { rerender } = render(panel("AAPL"));
    await advance(150);
    expect(inspector()).toHaveTextContent("Apple Inc.");
    rerender(panel(null));
    expect(inspector()).toHaveTextContent(/^Select a stock to see why it scores as it does\.$/);
    await advance(1_000);
    expect(read).toHaveBeenCalledTimes(1);
  });

  it("discards a read still in flight when the selection is cleared", async () => {
    const pending = deferred<StockEvidence>();
    read.mockReturnValue(pending.promise);
    const { rerender } = render(panel("AAPL"));
    await advance(150);
    rerender(panel(null));
    await settle(() => pending.resolve(evidence()));
    expect(inspector()).toHaveTextContent(/^Select a stock to see why it scores as it does\.$/);
    expect(inspector()).not.toHaveTextContent("Apple Inc.");
  });

  it("discards a failure still in flight when the selection is cleared", async () => {
    const pending = deferred<StockEvidence>();
    read.mockReturnValue(pending.promise);
    const { rerender } = render(panel("AAPL"));
    await advance(150);
    rerender(panel(null));
    await settle(() => pending.reject(new TypeError("Failed to fetch")));
    expect(inspector()).toHaveTextContent(/^Select a stock to see why it scores as it does\.$/);
    expect(within(inspector()).queryByRole("button")).toBeNull();
  });
});

describe("loading, failure and stale reads (DAC-E4-S7-2; DEC-0165)", () => {
  it("shows the loading skeleton while waiting and while the read is pending", async () => {
    read.mockReturnValue(deferred<StockEvidence>().promise);
    render(panel("AAPL"));
    for (const ms of [0, 150, 1_000]) {
      await advance(ms);
      const status = within(inspector()).getByRole("status");
      expect(status).toHaveTextContent(LOADING);
      expect(inspector()).toHaveClass(...SUMMARY_CARD);
      expect(inspector()).not.toHaveTextContent(SELECTION.inspectorEmpty);
      expect(inspector()).not.toHaveTextContent(SELECTION.inNoUniverse);
    }
  });

  it("sizes the skeleton from the theme's spacing scale (STD-UI-29)", async () => {
    read.mockReturnValue(deferred<StockEvidence>().promise);
    render(panel("AAPL"));
    const status = within(inspector()).getByRole("status");
    expect(status).toHaveClass("h-8", "w-full", "rounded", "bg-secondary");
  });

  it("takes the loading sentence from copy.ts", () => {
    expect(SELECTION.inspectorLoading).toBe(LOADING);
  });

  it("replaces the block with the code's sentence and Try again on a refused read", async () => {
    const refusal = new ClassificationApiError("No instrument ZZZZ (internal text)", "req-1", {
      code: "instrument_not_found",
      operation: "get-stock-evidence",
      resource: "classification",
    });
    read.mockRejectedValueOnce(refusal);
    render(panel("ZZZZ"));
    await advance(150);
    const section = inspector();
    expect(section).toHaveClass(...SUMMARY_CARD);
    expect(section).toHaveTextContent(failureSentence(refusal));
    expect(section).toHaveTextContent("FactorFlow doesn't follow that stock.");
    expect(section).not.toHaveTextContent("internal text");
    expect(section).not.toHaveTextContent("instrument_not_found");
    expect(section).not.toHaveTextContent("req-1");
    expect(within(section).queryByRole("status")).toBeNull();
    expect(section).not.toHaveTextContent(SELECTION.inspectorEmpty);
    expect(within(section).getByRole("button", { name: RESULTS.tryAgain })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("replaces the block with the operation's generic sentence on a network failure", async () => {
    read.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    render(panel("AAPL"));
    await advance(150);
    const section = inspector();
    expect(section).toHaveTextContent(
      "Could not load the stock's scores and inputs: FactorFlow hit an unexpected problem. Try again.",
    );
    expect(section).toHaveTextContent(
      failureSentence({ operation: "get-stock-evidence", resource: "classification", code: null }),
    );
    expect(section).not.toHaveTextContent("Failed to fetch");
    expect(within(section).getByRole("button", { name: RESULTS.tryAgain })).toBeInTheDocument();
  });

  it("re-reads the same symbol once when Try again is activated, and shows it", async () => {
    read.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    render(panel("AAPL"));
    await advance(150);
    expect(read).toHaveBeenCalledTimes(1);
    await advance(10_000);
    expect(read).toHaveBeenCalledTimes(1);

    read.mockResolvedValueOnce(evidence());
    fireEvent.click(within(inspector()).getByRole("button", { name: RESULTS.tryAgain }));
    expect(within(inspector()).getByRole("status")).toHaveTextContent(LOADING);
    // A retry takes the same 150 ms wait as a selection, then reads once.
    await advance(149);
    expect(read).toHaveBeenCalledTimes(1);
    await advance(1);
    expect(read).toHaveBeenCalledTimes(2);
    expect(read).toHaveBeenLastCalledWith("AAPL");
    expect(inspector()).toHaveTextContent("Apple Inc.");
    expect(within(inspector()).queryByRole("button", { name: RESULTS.tryAgain })).toBeNull();
    await advance(10_000);
    expect(read).toHaveBeenCalledTimes(2);
  });

  it("moves focus to the Selected stock section when Try again is activated", async () => {
    read.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    render(panel("AAPL"));
    await advance(150);
    const tryAgain = within(inspector()).getByRole("button", { name: RESULTS.tryAgain });
    tryAgain.focus();
    read.mockResolvedValueOnce(evidence());
    fireEvent.click(tryAgain);
    expect(tryAgain).not.toBeInTheDocument();
    expect(inspector()).toHaveFocus();
    expect(inspector()).toHaveAttribute("tabindex", "-1");
    await advance(150);
    expect(inspector()).toHaveTextContent("Apple Inc.");
    expect(inspector()).toHaveFocus();
  });

  it("never commits the failure again once Try again is activated", async () => {
    const committed: string[] = [];
    const failure = failureSentence({
      operation: "get-stock-evidence",
      resource: "classification",
      code: null,
    });
    read.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    render(
      <MemoryRouter>
        {/* A Profiler reports each commit of the panel as it lands, so it sees what the commit put on the page. */}
        <Profiler id="inspector" onRender={() => committed.push(inspector().textContent ?? "")}>
          <InspectorPanel symbol="AAPL" />
        </Profiler>
      </MemoryRouter>,
    );
    await advance(150);
    expect(inspector()).toHaveTextContent(failure);
    committed.length = 0;
    read.mockReturnValueOnce(deferred<StockEvidence>().promise);
    fireEvent.click(within(inspector()).getByRole("button", { name: RESULTS.tryAgain }));
    expect(committed).toEqual([LOADING]);
  });

  it("never commits the previous stock under a new selection", async () => {
    const committed: string[] = [];
    function CommitProbe({ symbol }: { symbol: string | null }): null {
      // A layout effect runs after the DOM is updated and before passive
      // effects, so it sees exactly what this commit put on the page.
      useLayoutEffect(() => {
        committed.push(`${symbol}:${inspector().textContent ?? ""}`);
      }, [symbol]);
      return null;
    }
    function tree(symbol: string | null): JSX.Element {
      return (
        <MemoryRouter>
          <InspectorPanel symbol={symbol} />
          <CommitProbe symbol={symbol} />
        </MemoryRouter>
      );
    }
    read.mockImplementation(async (symbol) =>
      evidence({ symbol, name: symbol === "AAPL" ? "Apple Inc." : "Microsoft Corp." }),
    );
    const { rerender } = render(tree("AAPL"));
    await advance(150);
    expect(inspector()).toHaveTextContent("Apple Inc.");
    rerender(tree("MSFT"));
    rerender(tree(null));
    expect(committed).toEqual([
      `AAPL:${LOADING}`,
      `MSFT:${LOADING}`,
      `null:${SELECTION.inspectorEmpty}`,
    ]);
  });

  it("never renders a read that resolves after the selection moved on", async () => {
    const aapl = deferred<StockEvidence>();
    const msft = deferred<StockEvidence>();
    read.mockReturnValueOnce(aapl.promise).mockReturnValueOnce(msft.promise);
    const { rerender } = render(panel("AAPL"));
    await advance(150);
    rerender(panel("MSFT"));
    await advance(150);
    expect(read).toHaveBeenNthCalledWith(2, "MSFT");

    await settle(() => aapl.resolve(evidence()));
    expect(inspector()).not.toHaveTextContent("Apple Inc.");
    expect(within(inspector()).getByRole("status")).toHaveTextContent(LOADING);

    await settle(() => msft.resolve(evidence({ symbol: "MSFT", name: "Microsoft Corp." })));
    expect(inspector()).toHaveTextContent("Microsoft Corp.");
    expect(inspector()).not.toHaveTextContent("Apple Inc.");
  });

  it("never renders an earlier read that resolves last", async () => {
    const aapl = deferred<StockEvidence>();
    const msft = deferred<StockEvidence>();
    read.mockReturnValueOnce(aapl.promise).mockReturnValueOnce(msft.promise);
    const { rerender } = render(panel("AAPL"));
    await advance(150);
    rerender(panel("MSFT"));
    await advance(150);
    await settle(() => msft.resolve(evidence({ symbol: "MSFT", name: "Microsoft Corp." })));
    await settle(() => aapl.resolve(evidence()));
    expect(inspector()).toHaveTextContent("Microsoft Corp.");
    expect(inspector()).not.toHaveTextContent("Apple Inc.");
  });

  it("never renders a stale failure", async () => {
    const aapl = deferred<StockEvidence>();
    const msft = deferred<StockEvidence>();
    read.mockReturnValueOnce(aapl.promise).mockReturnValueOnce(msft.promise);
    const { rerender } = render(panel("AAPL"));
    await advance(150);
    rerender(panel("MSFT"));
    await advance(150);
    await settle(() => aapl.reject(new TypeError("Failed to fetch")));
    expect(within(inspector()).queryByRole("button", { name: RESULTS.tryAgain })).toBeNull();
    expect(within(inspector()).getByRole("status")).toHaveTextContent(LOADING);
  });

  it("issues no read when unmounted before the wait ends", async () => {
    const { unmount } = render(panel("AAPL"));
    await advance(100);
    unmount();
    await advance(1_000);
    expect(read).not.toHaveBeenCalled();
  });

  it("reads again when the selection returns to a stock already read", async () => {
    read.mockImplementation(async (symbol) =>
      evidence({ symbol, name: symbol === "AAPL" ? "Apple Inc." : "Microsoft Corp." }),
    );
    const { rerender } = render(panel("AAPL"));
    await advance(150);
    rerender(panel("MSFT"));
    await advance(150);
    rerender(panel("AAPL"));
    await advance(150);
    expect(read.mock.calls.map(([symbol]) => symbol)).toEqual(["AAPL", "MSFT", "AAPL"]);
    expect(inspector()).toHaveTextContent("Apple Inc.");
    await advance(10_000);
    expect(read).toHaveBeenCalledTimes(3);
  });
});

/** One `factor_input` row (classification-api section 2.7) with the wire-only fields set to tell-tale values. */
function input(
  factor: FactorName,
  label: string,
  asOf: string | null,
  knownOn: string | null,
): InputRow {
  return {
    factor,
    inputName: `wire_key_${label.replace(/\W/g, "_")}`,
    label,
    status: "present",
    value: "0.0412",
    asOf,
    knownOn,
    restatedPossible: false,
    detail: { tellTale: "DETAIL_PAYLOAD" },
  };
}

async function loaded(data: StockEvidence): Promise<HTMLElement> {
  read.mockResolvedValue(data);
  render(panel(data.symbol));
  await advance(150);
  return inspector();
}

/** The visible words: the text with `aria-hidden` descendants dropped. */
function label(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  for (const hidden of clone.querySelectorAll("[aria-hidden='true']")) {
    hidden.remove();
  }
  return (clone.textContent ?? "").trim();
}

/** The block of one factor: the `div` holding its term. */
function block(section: HTMLElement, name: string): HTMLElement {
  const term = within(section)
    .getAllByRole("term")
    .find((candidate) => label(candidate) === name);
  if (term === undefined) {
    throw new Error(`no block for ${name}`);
  }
  return term.parentElement as HTMLElement;
}

function inputsLine(blockElement: HTMLElement): HTMLElement | null {
  return blockElement.querySelector("[data-testid='inputs-line']");
}

function explanation(section: HTMLElement): HTMLElement | null {
  return section.querySelector("[data-testid='explanation']");
}

describe("TC-COMP-141: each input is shown with its as_of and known_on dates (DAC-E4-S7-2)", () => {
  // Implements TC-COMP-141
  it("prints the inputs' dates as given in the factor's line", async () => {
    const section = await loaded(
      evidence({
        inputs: [
          input("value", "book-to-price", "2025-06-27", "2026-10-14"),
          input("value", "earnings yield", "2025-06-27", "2026-10-14"),
        ],
      }),
    );
    expect(inputsLine(block(section, "Value"))).toHaveTextContent(
      /^From book-to-price and earnings yield, as of 2025-06-27, known 2026-10-14$/,
    );
  });
});

describe("TC-COMP-143: the memberships line reads In no universe or links each universe (DAC-E4-S7-4)", () => {
  // Implements TC-COMP-143
  function line(section: HTMLElement): HTMLElement {
    return within(section).getByTestId("memberships");
  }

  it("reads In no universe with no link for a stock in no universe", async () => {
    const section = await loaded(evidence({ memberships: [] }));
    expect(line(section)).toHaveTextContent(/^In no universe$/);
    expect(within(line(section)).queryByRole("link")).toBeNull();
  });

  it("links each universe in the order the read gave them", async () => {
    const section = await loaded(
      evidence({
        memberships: [
          { universeId: "u1", name: "Tech" },
          { universeId: "u2", name: "Dividend growers" },
        ],
      }),
    );
    expect(line(section).textContent).toBe("In Tech and Dividend growers");
    expect(line(section).textContent).toBe(SELECTION.inUniverses(["Tech", "Dividend growers"]));
    const links = within(line(section)).getAllByRole("link");
    expect(links.map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      ["Tech", "/research/universes/u1"],
      ["Dividend growers", "/research/universes/u2"],
    ]);
    expect(section).not.toHaveTextContent(SELECTION.inNoUniverse);
  });

  it.each([
    [["A"], "In A"],
    [["A", "B", "C"], "In A, B and C"],
    [["A", "B", "C", "D"], "In A, B, C and D"],
  ])("joins %j as %s", async (names, text) => {
    const section = await loaded(
      evidence({ memberships: names.map((name, index) => ({ universeId: `u${index}`, name })) }),
    );
    expect(line(section).textContent).toBe(text);
    expect(within(line(section)).getAllByRole("link")).toHaveLength(names.length);
  });

  it("prints a universe name as text and encodes its id in the address", async () => {
    const section = await loaded(
      evidence({ memberships: [{ universeId: "a b/c&d", name: "R&D / <Labs>" }] }),
    );
    const link = within(line(section)).getByRole("link", { name: "R&D / <Labs>" });
    expect(link).toHaveAttribute("href", "/research/universes/a%20b%2Fc%26d");
    expect(line(section).textContent).toBe("In R&D / <Labs>");
  });
});

describe("the factor blocks (DAC-E4-S7-2, AC-16; DEC-0165, DEC-0166)", () => {
  it("shows the symbol in the numeric face at text-xl, then the name", async () => {
    const section = await loaded(evidence());
    const symbol = within(section).getByText("AAPL");
    expect(symbol).toHaveClass("font-numeric", "text-xl");
    const name = within(section).getByText("Apple Inc.");
    expect(precedes(symbol, name)).toBe(true);
  });

  it("orders the loaded inspector top to bottom as UX design 1.1 does", async () => {
    const retired = cell({ status: "not_classified", reasonCode: "retired" });
    const section = await loaded(
      evidence({
        lifecycle: "retired",
        memberships: [{ universeId: "u-1", name: "Tech" }],
        factors: { value: retired, growth: retired, momentum: retired },
      }),
    );
    const parts = [
      within(section).getByText("AAPL"),
      within(section).getByText("Apple Inc."),
      within(section).getByTestId("memberships"),
      within(section).getAllByRole("term")[0],
      explanation(section),
      within(section).getByRole("link", { name: SELECTION.seeEveryInput }),
      within(section).getByText(SELECTION.footnote),
    ];
    for (const part of parts) {
      expect(part).not.toBeNull();
    }
    for (let index = 1; index < parts.length; index += 1) {
      expect(precedes(parts[index - 1] as Element, parts[index] as Element)).toBe(true);
    }
  });

  it("orders each factor block as the term, then the cell, then the inputs line", async () => {
    const section = await loaded(
      evidence({
        inputs: [
          input("value", "book-to-price", "2025-06-27", "2026-10-14"),
          input("growth", "revenue growth", "2025-06-27", "2026-10-14"),
          input("momentum", "12-month return", "2025-06-27", "2026-10-14"),
        ],
      }),
    );
    for (const name of ["Value", "Growth", "Momentum"]) {
      const children = Array.from(block(section, name).children);
      expect(children.map((child) => child.tagName)).toEqual(["DT", "DD", "DD"]);
      expect(within(children[1] as HTMLElement).getByTestId("factor-cell")).toBeInTheDocument();
      expect(children[2]).toHaveAttribute("data-testid", "inputs-line");
    }
  });

  it("is the summary card when loaded", async () => {
    const section = await loaded(evidence());
    expect(section).toHaveClass(...SUMMARY_CARD);
  });

  it("renders one block per factor in the order Value, Growth, Momentum with an identity swatch", async () => {
    const section = await loaded(evidence());
    const terms = within(section).getAllByRole("term");
    expect(terms.map(label)).toEqual(["Value", "Growth", "Momentum"]);
    const swatches = terms.map((term) => term.firstElementChild as HTMLElement);
    for (const swatch of swatches) {
      expect(swatch.tagName).toBe("SPAN");
      expect(swatch).toHaveAttribute("aria-hidden", "true");
      expect(swatch).toHaveClass("h-2", "w-2", "rounded");
    }
    expect(swatches.map((swatch) => swatch.style.backgroundColor)).toEqual([
      "hsl(var(--factor-value))",
      "hsl(var(--factor-growth))",
      "hsl(var(--factor-momentum))",
    ]);
    expect(terms.map((term) => term.textContent)).toEqual(["Value", "Growth", "Momentum"]);
  });

  it("prints the percentile and the signed standardised score, a measured zero as 0.00", async () => {
    const section = await loaded(evidence());
    const percentiles = within(section).getAllByTestId("factor-percentile");
    const scores = within(section).getAllByTestId("factor-score");
    expect(percentiles.map((element) => element.textContent)).toEqual(["88", "40", "61"]);
    expect(scores.map((element) => element.textContent)).toEqual(["+1.27", "-0.25", "0.00"]);
    expect(within(block(section, "Momentum")).getByTestId("factor-score")).toHaveTextContent(
      /^0\.00$/,
    );
  });

  it("puts the restated mark on value and growth only", async () => {
    const section = await loaded(
      evidence({
        factors: {
          value: scored("88", "1.27", { restatedPossible: true }),
          growth: scored("40", "-0.25", { restatedPossible: true }),
          momentum: scored("61", "0.00", { restatedPossible: true }),
        },
      }),
    );
    expect(within(block(section, "Value")).getByText(CELL.possiblyRestated)).toBeInTheDocument();
    expect(within(block(section, "Growth")).getByText(CELL.possiblyRestated)).toBeInTheDocument();
    expect(within(block(section, "Momentum")).queryByText(CELL.possiblyRestated)).toBeNull();
  });

  it("shows an absent value for a factor the read sent no cell for", async () => {
    const section = await loaded(
      evidence({ factors: { value: scored("88", "1.27") } as StockEvidence["factors"] }),
    );
    expect(within(section).getAllByRole("term").map(label)).toEqual([
      "Value",
      "Growth",
      "Momentum",
    ]);
    for (const name of ["Growth", "Momentum"]) {
      const element = block(section, name);
      expect(within(element).getByRole("definition")).toHaveTextContent(/^—$/);
      expect(within(element).queryByTestId("factor-cell")).toBeNull();
    }
    expect(within(block(section, "Value")).getByTestId("factor-percentile")).toHaveTextContent(
      "88",
    );
  });

  it("groups each factor's dated inputs by their dates", async () => {
    const section = await loaded(
      evidence({
        inputs: [
          input("value", "book-to-price", "2025-06-27", "2026-10-14"),
          input("growth", "revenue growth", "2025-06-27", "2026-10-14"),
          input("value", "earnings yield", "2025-06-27", "2026-10-14"),
          input("growth", "earnings growth", "2025-03-28", "2026-10-01"),
          input("value", "free-cash-flow yield", "2025-06-27", "2026-10-14"),
          input("momentum", "12-month return", "2026-10-14", null),
          input("growth", "sales growth", "2025-03-28", "2026-10-01"),
        ],
      }),
    );
    const value = inputsLine(block(section, "Value"));
    expect(value?.textContent).toBe(
      "From book-to-price, earnings yield and free-cash-flow yield, as of 2025-06-27, known 2026-10-14",
    );
    expect(value).toHaveClass("text-xs");
    expect(inputsLine(block(section, "Growth"))?.textContent).toBe(
      "From revenue growth, as of 2025-06-27, known 2026-10-14; From earnings growth and sales growth, as of 2025-03-28, known 2026-10-01",
    );
    expect(inputsLine(block(section, "Momentum"))?.textContent).toBe(
      "From 12-month return, as of 2026-10-14",
    );
  });

  it("separates inputs that share an as_of but not a known_on", async () => {
    const section = await loaded(
      evidence({
        inputs: [
          input("value", "book-to-price", "2025-06-27", "2026-10-14"),
          input("value", "earnings yield", "2025-06-27", "2026-10-15"),
          input("value", "free-cash-flow yield", "2025-06-27", null),
        ],
      }),
    );
    expect(inputsLine(block(section, "Value"))?.textContent).toBe(
      "From book-to-price, as of 2025-06-27, known 2026-10-14; From earnings yield, as of 2025-06-27, known 2026-10-15; From free-cash-flow yield, as of 2025-06-27",
    );
  });

  it("prints no line for a factor whose inputs carry no as_of, and none for a factor with no input", async () => {
    const section = await loaded(
      evidence({
        inputs: [
          input("value", "book-to-price", null, "2026-10-14"),
          input("value", "earnings yield", null, null),
          input("growth", "revenue growth", "2025-06-27", "2026-10-14"),
        ],
      }),
    );
    expect(inputsLine(block(section, "Value"))).toBeNull();
    expect(inputsLine(block(section, "Momentum"))).toBeNull();
    expect(inputsLine(block(section, "Growth"))?.textContent).toBe(
      "From revenue growth, as of 2025-06-27, known 2026-10-14",
    );
  });

  it("never prints a wire key or an input's detail (STD-UI-1)", async () => {
    const section = await loaded(
      evidence({ inputs: [input("value", "book-to-price", "2025-06-27", "2026-10-14")] }),
    );
    expect(section.outerHTML).not.toContain("wire_key");
    expect(section.outerHTML).not.toContain("DETAIL_PAYLOAD");
    expect(section.outerHTML).not.toContain("0.0412");
  });
});

describe("the explanation box, the evidence link and the footnote (AC-16; classification-ui 2.5)", () => {
  it("carries one Incomplete sentence per incomplete factor, the cell's own title", async () => {
    const detail = "revenue for the quarter ending 2025-06-27 missing";
    const section = await loaded(
      evidence({
        factors: {
          value: scored("88", "1.27"),
          growth: cell({ reasonCode: "input_missing", reasonDetail: detail }),
          momentum: cell({ reasonCode: "input_outdated" }),
        },
      }),
    );
    const box = explanation(section);
    expect(box).not.toBeNull();
    expect(box).toHaveClass("border", "border-border");
    const sentences = Array.from(box?.querySelectorAll("p") ?? []).map((p) => p.textContent);
    expect(sentences).toEqual([
      CELL.incompleteDetail(detail, "growth"),
      CELL.incompleteGeneric("input_outdated", "momentum"),
    ]);
    expect(sentences[0]).toBe(
      "Incomplete: revenue for the quarter ending 2025-06-27 missing, so growth can't be compared fairly. It isn't guessed.",
    );
    expect(within(block(section, "Growth")).getByTestId("factor-cell")).toHaveAttribute(
      "title",
      sentences[0],
    );
    expect(within(block(section, "Momentum")).getByTestId("factor-cell")).toHaveAttribute(
      "title",
      sentences[1],
    );
  });

  it.each([
    ["a classified cell with no percentile", cell({ status: "classified", score: "1.0" })],
    ["a not-classified cell with a percentile", cell({ percentile: "50" })],
  ])("explains %s, which the cell draws as Incomplete", async (_name, growth) => {
    const detail = "revenue missing";
    const section = await loaded(
      evidence({
        factors: {
          value: scored("88", "1.27"),
          growth: { ...growth, reasonCode: "input_missing", reasonDetail: detail },
          momentum: scored("61", "0.00"),
        },
      }),
    );
    expect(within(block(section, "Growth")).getByText(CELL.incomplete)).toBeInTheDocument();
    expect(explanation(section)).toHaveTextContent(CELL.incompleteDetail(detail, "growth"));
  });

  it("opens no box for an incomplete factor whose reason is unrecognised", async () => {
    const section = await loaded(
      evidence({
        factors: {
          value: scored("88", "1.27"),
          growth: cell({ reasonCode: "a_future_reason" as FactorCellData["reasonCode"] }),
          momentum: scored("61", "0.00"),
        },
      }),
    );
    expect(within(block(section, "Growth")).getByText(CELL.incomplete)).toBeInTheDocument();
    expect(explanation(section)).toBeNull();
  });

  it("opens no box for an incomplete factor that names no cause", async () => {
    const section = await loaded(
      evidence({
        factors: {
          value: scored("88", "1.27"),
          growth: cell(),
          momentum: scored("61", "0.00"),
        },
      }),
    );
    expect(within(block(section, "Growth")).getByText(CELL.incomplete)).toBeInTheDocument();
    expect(explanation(section)).toBeNull();
  });

  it("shows Not enough to rank with no count and adds nothing to the box", async () => {
    const section = await loaded(
      evidence({
        factors: {
          value: cell({
            reasonCode: "not_enough_stocks",
            reasonDetail: "18 of 30 stocks qualified",
          }),
          growth: scored("40", "-0.25"),
          momentum: scored("61", "0.00"),
        },
        inputs: [input("value", "book-to-price", null, null)],
      }),
    );
    const value = block(section, "Value");
    expect(value).toHaveTextContent(CELL.notEnoughToRank);
    expect(value.textContent).not.toMatch(/\d/);
    expect(section).not.toHaveTextContent("18 qualified, 30 needed");
    expect(section).not.toHaveTextContent("18 of 30 stocks qualified");
    expect(explanation(section)).toBeNull();
  });

  it("marks a stock no longer followed and says its earlier scores stand", async () => {
    const retired = cell({
      status: "classified",
      percentile: "70",
      score: "0.5",
      reasonCode: "retired",
      reasonDetail: "no longer followed",
    });
    const section = await loaded(
      evidence({
        lifecycle: "retired",
        factors: { value: retired, growth: retired, momentum: retired },
      }),
    );
    const symbol = within(section).getByText("AAPL");
    const badge = symbol.nextElementSibling as HTMLElement;
    expect(badge).toHaveAttribute("data-variant", "status-neutral");
    expect(badge).toHaveClass("bg-status-neutral-muted", "text-status-neutral");
    expect(label(badge)).toBe(CELL.notFollowed);
    expect(badge.querySelector("svg[aria-hidden='true']")).not.toBeNull();
    const box = explanation(section);
    expect(Array.from(box?.querySelectorAll("p") ?? []).map((p) => p.textContent)).toEqual([
      CELL.notFollowedNoDate,
    ]);
    expect(CELL.notFollowedNoDate).toBe("Not followed. Earlier scores stand.");
  });

  it("shows no Not followed badge for a followed stock", async () => {
    const section = await loaded(evidence());
    expect(within(section).getByText("AAPL").nextElementSibling).toBeNull();
    expect(section).not.toHaveTextContent(CELL.notFollowed);
  });

  it("states the restatement sentence once however many marks appear", async () => {
    const section = await loaded(
      evidence({
        factors: {
          value: scored("88", "1.27", { restatedPossible: true }),
          growth: scored("40", "-0.25", { restatedPossible: true }),
          momentum: scored("61", "0.00"),
        },
      }),
    );
    const box = explanation(section);
    expect(Array.from(box?.querySelectorAll("p") ?? []).map((p) => p.textContent)).toEqual([
      CELL.restatedExplanation,
    ]);
    expect(section.textContent?.split(CELL.restatedExplanation)).toHaveLength(2);
  });

  it.each([
    ["growth only", { growth: scored("40", "-0.25", { restatedPossible: true }) }],
    [
      "an incomplete value cell",
      { value: cell({ reasonCode: "input_missing", restatedPossible: true }) },
    ],
    [
      "a classified value cell with no percentile",
      { value: cell({ status: "classified", score: "1.0", restatedPossible: true }) },
    ],
    [
      "a not-followed value cell",
      {
        value: scored("88", "1.27", { reasonCode: "retired", restatedPossible: true }),
      },
    ],
    [
      "a value cell not enough to rank",
      {
        value: scored("88", "1.27", { reasonCode: "not_enough_stocks", restatedPossible: true }),
      },
    ],
  ])("states the restatement sentence only where a mark appears: %s", async (name, factors) => {
    const section = await loaded(
      evidence({
        factors: {
          value: scored("88", "1.27"),
          growth: scored("40", "-0.25"),
          momentum: scored("61", "0.00", { restatedPossible: true }),
          ...factors,
        },
      }),
    );
    const marked = name === "growth only";
    expect(section.textContent?.includes(CELL.restatedExplanation)).toBe(marked);
  });

  it("opens no box for a followed stock scored on every factor", async () => {
    const section = await loaded(evidence());
    expect(explanation(section)).toBeNull();
  });

  it("links to the stock's evidence page", async () => {
    const section = await loaded(evidence({ symbol: "BRK/B" }));
    const link = within(section).getByRole("link", { name: SELECTION.seeEveryInput });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/research/stocks/BRK%2FB");
    expect(link).toHaveClass(...OUTLINE_BUTTON);
    expect(within(section).queryByRole("button", { name: SELECTION.seeEveryInput })).toBeNull();
  });

  it("ends with the footnote and has no holdings line or strategy action", async () => {
    const section = await loaded(evidence());
    const footnote = within(section).getByText(SELECTION.footnote);
    expect(footnote).toHaveClass("text-xs", "text-muted-foreground");
    expect(footnote.textContent).toBe(
      "Percentile first: 88 means better than 88% of the stocks scored on this factor. The small number is the standardised score.",
    );
    expect(section.lastElementChild).toBe(footnote);
    expect(section).not.toHaveTextContent(/holding/i);
    expect(section).not.toHaveTextContent("Start a strategy from this screen");
  });
});
