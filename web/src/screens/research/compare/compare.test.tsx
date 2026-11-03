import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as classificationClient from "../../../api/classification-client";
import type {
  ClassificationList,
  FactorCell,
  FactorName,
  InputRow,
  StockEvidence,
  StockRow,
} from "../../../api/classification-types";
import { ApiError, ApiUnreachableError } from "../../../api/client";
import { CELL, COMPARE, RESULTS } from "../copy";
import CompareScreen from "./index";

vi.mock("../../../api/classification-client", async () => ({
  ...(await vi.importActual<typeof import("../../../api/classification-client")>(
    "../../../api/classification-client",
  )),
  listClassifications: vi.fn(),
  getStockEvidence: vi.fn(),
}));

const listClassifications = vi.mocked(classificationClient.listClassifications);
const getStockEvidence = vi.mocked(classificationClient.getStockEvidence);

const NONE: FactorCell = {
  status: "not_classified",
  score: null,
  percentile: null,
  reasonCode: null,
  reasonInput: null,
  reasonDetail: null,
  restatedPossible: false,
};

function scored(percentile: string, restatedPossible = false): FactorCell {
  return { ...NONE, status: "classified", percentile, score: "0.50", restatedPossible };
}

function cells(
  overrides: Partial<Record<FactorName, FactorCell>> = {},
): Record<FactorName, FactorCell> {
  return { value: scored("70"), growth: scored("60"), momentum: scored("50"), ...overrides };
}

function row(symbol: string, overrides: Partial<StockRow> = {}): StockRow {
  return { symbol, name: `${symbol} Inc`, lifecycle: "active", factors: cells(), ...overrides };
}

const SET = {
  setId: "s1",
  classificationDate: "2026-10-16",
  runId: "r1",
  runStartedAt: "2026-10-16T03:00:00Z",
  runOutcome: "succeeded" as const,
  state: "complete" as const,
  startedAt: "2026-10-16T03:30:00Z",
  endedAt: "2026-10-16T03:40:00Z",
  latestTradingDay: "2026-10-15",
  activeInstruments: 120,
  notCurrent: false,
};

function list(stocks: StockRow[], overrides: Partial<ClassificationList> = {}): ClassificationList {
  const summary = { qualifiedCount: 120, ranked: true, minPeerSetSize: 30 };
  return {
    neverClassified: false,
    set: SET,
    later: null,
    factors: { value: summary, growth: summary, momentum: summary },
    matchCount: stocks.length,
    stocks,
    unknownSymbols: [],
    nextCursor: null,
    ...overrides,
  };
}

function inputRow(inputName: string, factor: FactorName, value: string): InputRow {
  return {
    factor,
    inputName,
    label: inputName,
    status: "present",
    value,
    asOf: "2025-06-27",
    knownOn: "2026-10-14",
    restatedPossible: false,
    detail: null,
  };
}

function evidence(symbol: string, overrides: Partial<StockEvidence> = {}): StockEvidence {
  return {
    symbol,
    name: `${symbol} Inc`,
    lifecycle: "active",
    set: SET,
    factors: cells(),
    inputs: [inputRow("book_to_price", "value", "0.85")],
    memberships: [],
    ...overrides,
  };
}

/** Answers the list read from the requested symbols and every evidence read with a plain record. */
function answerAll(overrides: Partial<ClassificationList> = {}): void {
  listClassifications.mockImplementation(async (params = {}) =>
    list(
      (params.symbols ?? []).map((symbol) => row(symbol)),
      overrides,
    ),
  );
  getStockEvidence.mockImplementation(async (symbol) => evidence(symbol));
}

function Probe(): JSX.Element {
  const navigate = useNavigate();
  return (
    <>
      <output data-testid="search">{useLocation().search}</output>
      <button type="button" onClick={() => navigate("/research/compare?symbols=CCC,DDD")}>
        go elsewhere
      </button>
    </>
  );
}

function renderAt(search: string): void {
  render(
    <MemoryRouter initialEntries={[`/research/compare${search}`]}>
      <Probe />
      <Routes>
        <Route path="/research/compare" element={<CompareScreen />} />
      </Routes>
    </MemoryRouter>,
  );
}

function stockHeaders(): HTMLElement[] {
  return within(screen.getByRole("table"))
    .getAllByRole("columnheader")
    .filter((header) => header.hasAttribute("data-symbol"));
}

beforeEach(() => {
  listClassifications.mockReset();
  getStockEvidence.mockReset();
});

describe("CompareScreen mandatory cases", () => {
  // Implements TC-COMP-128
  it("blocks Add at six and prompts below two (DAC-E5-S1-2)", async () => {
    answerAll();
    const user = userEvent.setup();
    renderAt("?symbols=A,B,C,D,E,F");
    await screen.findByRole("table");
    const callsBefore = getStockEvidence.mock.calls.length + listClassifications.mock.calls.length;

    const add = screen.getByRole("button", { name: COMPARE.add });
    expect(add).toHaveAttribute("aria-disabled", "true");
    expect(add).not.toBeDisabled();
    expect(add).toHaveAccessibleDescription(COMPARE.atMost);

    await user.type(screen.getByLabelText(COMPARE.addAStock), "G");
    await user.click(add);
    await user.keyboard("{Enter}");

    expect(stockHeaders()).toHaveLength(6);
    expect(getStockEvidence.mock.calls.length + listClassifications.mock.calls.length).toBe(
      callsBefore,
    );
  });

  // Implements TC-COMP-128
  it("shows the prompt below two and issues no list read", async () => {
    answerAll();
    renderAt("?symbols=AAA");
    expect(await screen.findByText(COMPARE.chooseTwoToSix)).toBeInTheDocument();
    expect(listClassifications).not.toHaveBeenCalled();
  });

  // Implements TC-COMP-128
  it("shows the long prompt with no symbols and focuses the entry field", async () => {
    answerAll();
    renderAt("");
    expect(await screen.findByText(COMPARE.chooseTwoToSixEmpty)).toBeInTheDocument();
    expect(screen.getByLabelText(COMPARE.addAStock)).toHaveFocus();
    expect(listClassifications).not.toHaveBeenCalled();
    expect(getStockEvidence).not.toHaveBeenCalled();
  });

  // Implements TC-COMP-129
  it("reports instrument_not_found as a field error and adds no column (DAC-E5-S1-3)", async () => {
    answerAll();
    getStockEvidence.mockImplementation(async (symbol) => {
      if (symbol === "XYZ") {
        throw new ApiError("RAW", "req-1", { code: "instrument_not_found" });
      }
      return evidence(symbol);
    });
    const user = userEvent.setup();
    renderAt("?symbols=AAA,BBB");
    await screen.findByRole("table");

    await user.type(screen.getByLabelText(COMPARE.addAStock), "xyz{Enter}");

    expect(
      await screen.findByText("FactorFlow doesn't follow a stock named XYZ."),
    ).toBeInTheDocument();
    expect(stockHeaders()).toHaveLength(2);
    expect(screen.getByTestId("search")).toHaveTextContent("?symbols=AAA,BBB");
    expect(screen.queryByText("RAW")).toBeNull();
  });

  // Implements TC-COMP-129
  it("reports the server's unknown symbols without a column", async () => {
    listClassifications.mockResolvedValue(
      list([row("AAA"), row("BBB")], { unknownSymbols: ["ZZZ"] }),
    );
    getStockEvidence.mockImplementation(async (symbol) => evidence(symbol));
    renderAt("?symbols=AAA,BBB,ZZZ");

    const notice = await screen.findByText(COMPARE.notCompared("ZZZ"));
    expect(notice).toBeInTheDocument();
    expect(notice.textContent).not.toContain("doesn't follow");
    expect(stockHeaders()).toHaveLength(2);
    expect(getStockEvidence).not.toHaveBeenCalledWith("ZZZ");
  });

  // Implements TC-COMP-190
  it("marks restated value and growth percentiles with the sentence once (DAC-E5-S1-5)", async () => {
    listClassifications.mockResolvedValue(
      list([
        row("AAA", { factors: cells({ value: scored("70", true) }) }),
        row("BBB", { factors: cells({ growth: scored("60", true) }) }),
      ]),
    );
    getStockEvidence.mockImplementation(async (symbol) => evidence(symbol));
    renderAt("?symbols=AAA,BBB");

    const table = await screen.findByRole("table");
    expect(within(table).getAllByText(CELL.possiblyRestated)).toHaveLength(2);
    expect(screen.getAllByText(CELL.restatedExplanation)).toHaveLength(1);
  });

  it("omits the sentence when no mark is on screen", async () => {
    answerAll();
    renderAt("?symbols=AAA,BBB");
    await screen.findByRole("table");
    expect(screen.queryByText(CELL.restatedExplanation)).toBeNull();
  });
});

describe("CompareScreen entry and bounds (DEC-0070, DEC-0163)", () => {
  it("reads the comma-joined symbols and issues one list read plus one evidence read per column", async () => {
    answerAll();
    renderAt("?symbols=AAPL,BRK.B");

    await screen.findByRole("table");
    expect(listClassifications).toHaveBeenCalledTimes(1);
    expect(listClassifications).toHaveBeenCalledWith({ symbols: ["AAPL", "BRK.B"] });
    expect(screen.queryByText("Loading…")).toBeNull();
    expect(getStockEvidence).toHaveBeenCalledTimes(2);
    expect(stockHeaders()).toHaveLength(2);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(COMPARE.comparing(2));
  });

  it("normalises the URL: trims, drops empties, uppercases, de-duplicates", async () => {
    answerAll();
    renderAt("?symbols=aapl, msft,,AAPL");

    await screen.findByRole("table");
    expect(listClassifications).toHaveBeenCalledWith({ symbols: ["AAPL", "MSFT"] });
  });

  it("appends a symbol after its evidence read and writes the literal-comma URL", async () => {
    answerAll();
    const user = userEvent.setup();
    renderAt("?symbols=AAPL,BRK.B");
    await screen.findByRole("table");

    await user.type(screen.getByLabelText(COMPARE.addAStock), "msft");
    await user.click(screen.getByRole("button", { name: COMPARE.add }));

    await waitFor(() => expect(stockHeaders()).toHaveLength(3));
    expect(screen.getByTestId("search")).toHaveTextContent(/^\?symbols=AAPL,BRK\.B,MSFT$/);
  });

  it("refuses a symbol already compared with a field error naming it", async () => {
    answerAll();
    const user = userEvent.setup();
    renderAt("?symbols=AAPL,MSFT");
    await screen.findByRole("table");
    getStockEvidence.mockClear();

    await user.type(screen.getByLabelText(COMPARE.addAStock), "aapl{Enter}");

    expect(await screen.findByText(COMPARE.duplicate("AAPL"))).toBeInTheDocument();
    expect(getStockEvidence).not.toHaveBeenCalled();
    expect(stockHeaders()).toHaveLength(2);
  });

  it("accepts a sixth symbol and then blocks Add", async () => {
    answerAll();
    const user = userEvent.setup();
    renderAt("?symbols=A,B,C,D,E");
    await screen.findByRole("table");
    expect(screen.getByRole("button", { name: COMPARE.add })).not.toHaveAttribute(
      "aria-disabled",
      "true",
    );

    await user.type(screen.getByLabelText(COMPARE.addAStock), "F{Enter}");

    await waitFor(() => expect(stockHeaders()).toHaveLength(6));
    expect(screen.getByRole("button", { name: COMPARE.add })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("reads nothing for seven symbols and blocks Add", async () => {
    answerAll();
    renderAt("?symbols=A,B,C,D,E,F,G");

    expect(await screen.findByText(COMPARE.atMost, { selector: "p" })).toBeInTheDocument();
    expect(listClassifications).not.toHaveBeenCalled();
    expect(getStockEvidence).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: COMPARE.add })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("renders the server's 422 as the bound message", async () => {
    listClassifications.mockRejectedValue(
      new ApiError("RAW", "req-2", { code: "validation_error" }),
    );
    getStockEvidence.mockImplementation(async (symbol) => evidence(symbol));
    renderAt("?symbols=AAA,BBB");

    expect(await screen.findByText(COMPARE.atMost, { selector: "p" })).toBeInTheDocument();
    expect(screen.queryByText("RAW")).toBeNull();
  });
});

describe("CompareScreen removal and focus", () => {
  it("drops the column, rewrites the URL and focuses the next header", async () => {
    answerAll();
    const user = userEvent.setup();
    renderAt("?symbols=AAPL,BRK.B,MSFT");
    await screen.findByRole("table");

    await user.click(screen.getByRole("button", { name: COMPARE.removeFromComparison("BRK.B") }));

    await waitFor(() => expect(stockHeaders()).toHaveLength(2));
    expect(screen.getByTestId("search")).toHaveTextContent(/^\?symbols=AAPL,MSFT$/);
    expect(stockHeaders()[1]).toHaveFocus();
  });

  it("focuses the previous header when the last column is removed", async () => {
    answerAll();
    const user = userEvent.setup();
    renderAt("?symbols=AAPL,MSFT,NVDA");
    await screen.findByRole("table");

    await user.click(screen.getByRole("button", { name: COMPARE.removeFromComparison("NVDA") }));

    await waitFor(() => expect(stockHeaders()).toHaveLength(2));
    expect(stockHeaders()[1]).toHaveFocus();
  });

  it("shows the prompt above the one remaining column from evidence alone", async () => {
    answerAll();
    const user = userEvent.setup();
    renderAt("?symbols=AAPL,MSFT");
    await screen.findByRole("table");

    await user.click(screen.getByRole("button", { name: COMPARE.removeFromComparison("MSFT") }));

    expect(await screen.findByText(COMPARE.chooseTwoToSix)).toBeInTheDocument();
    await waitFor(() => expect(stockHeaders()).toHaveLength(1));
    expect(screen.getByTestId("search")).toHaveTextContent(/^\?symbols=AAPL$/);
  });

  it("focuses the entry field when the last column is removed", async () => {
    answerAll();
    const user = userEvent.setup();
    renderAt("?symbols=AAPL");
    await screen.findByRole("table");

    await user.click(screen.getByRole("button", { name: COMPARE.removeFromComparison("AAPL") }));

    await waitFor(() => expect(screen.getByLabelText(COMPARE.addAStock)).toHaveFocus());
    expect(screen.getByTestId("search")).toHaveTextContent(/^\?symbols=$/);
  });
});

describe("CompareScreen states", () => {
  it("shows a skeleton with one column per chosen symbol while loading", () => {
    listClassifications.mockReturnValue(new Promise(() => {}));
    getStockEvidence.mockReturnValue(new Promise(() => {}));
    renderAt("?symbols=AAA,BBB,CCC");

    const loading = screen.getByText("Loading…").closest("output") as HTMLElement;
    expect(loading).toHaveAttribute("aria-busy", "true");
    expect(loading.querySelectorAll("[data-skeleton-column]")).toHaveLength(3);
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("states the never-populated case, keeping the symbols in the URL", async () => {
    listClassifications.mockResolvedValue(
      list([], { neverClassified: true, set: null, stocks: [] }),
    );
    renderAt("?symbols=AAA,BBB");

    expect(await screen.findByText(RESULTS.neverScored)).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByTestId("search")).toHaveTextContent("?symbols=AAA,BBB");
  });

  it("renders no column for one symbol whose evidence has no set", async () => {
    getStockEvidence.mockResolvedValue(
      evidence("NEWCO", { set: null, factors: {} as never, inputs: [] }),
    );
    renderAt("?symbols=NEWCO");

    expect(await screen.findByText(RESULTS.neverScored)).toBeInTheDocument();
    expect(screen.getByText(COMPARE.chooseTwoToSix)).toBeInTheDocument();
    expect(screen.getByLabelText(COMPARE.addAStock)).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByTestId("search")).toHaveTextContent("?symbols=NEWCO");
    expect(listClassifications).not.toHaveBeenCalled();
  });

  it("names a followed stock with no row in the current set, and throws nothing", async () => {
    getStockEvidence.mockResolvedValue(evidence("NEWCO", { factors: {} as never, inputs: [] }));
    renderAt("?symbols=NEWCO");

    expect(await screen.findByText(COMPARE.notCompared("NEWCO"))).toBeInTheDocument();
    expect(screen.getByText(COMPARE.chooseTwoToSix)).toBeInTheDocument();
    expect(screen.getByLabelText(COMPARE.addAStock)).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByTestId("search")).toHaveTextContent("?symbols=NEWCO");
  });

  it("builds a single column from the evidence alone", async () => {
    getStockEvidence.mockResolvedValue(evidence("AAPL"));
    renderAt("?symbols=AAPL");

    await screen.findByRole("table");
    expect(stockHeaders()).toHaveLength(1);
    expect(screen.getByText(COMPARE.chooseTwoToSix)).toBeInTheDocument();
    expect(screen.queryByText("Loading…")).toBeNull();
    expect(listClassifications).not.toHaveBeenCalled();
    expect(screen.queryByText(RESULTS.neverScored)).toBeNull();
  });

  it("shows a failure by code with Try again and keeps the symbols and entry row", async () => {
    listClassifications.mockRejectedValueOnce(
      new classificationClient.ClassificationApiError("RAW-SERVER-PROSE", "req-3", {
        code: "internal_error",
        operation: "list-classifications",
        resource: "classification",
      }),
    );
    getStockEvidence.mockImplementation(async (symbol) => evidence(symbol));
    listClassifications.mockImplementation(async (params = {}) =>
      list((params.symbols ?? []).map((symbol) => row(symbol))),
    );
    const user = userEvent.setup();
    renderAt("?symbols=AAA,BBB");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Could not load the scores");
    expect(alert).not.toHaveTextContent("RAW-SERVER-PROSE");
    expect(screen.queryByText(RESULTS.neverScored)).toBeNull();
    expect(screen.getByLabelText(COMPARE.addAStock)).toBeInTheDocument();
    expect(screen.getByTestId("search")).toHaveTextContent("?symbols=AAA,BBB");

    await user.click(screen.getByRole("button", { name: RESULTS.tryAgain }));
    expect(await screen.findByRole("table")).toBeInTheDocument();
  });

  it("renders nothing of its own when the API is unreachable", async () => {
    listClassifications.mockRejectedValue(new ApiUnreachableError("down"));
    getStockEvidence.mockRejectedValue(new ApiUnreachableError("down"));
    renderAt("?symbols=AAA,BBB");

    await waitFor(() => expect(screen.queryByText("Loading…")).toBeNull());
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("renders a not-current set as populated, with no banner", async () => {
    answerAll();
    listClassifications.mockImplementation(async (params = {}) =>
      list(
        (params.symbols ?? []).map((symbol) => row(symbol)),
        {
          set: { ...SET, notCurrent: true },
        },
      ),
    );
    renderAt("?symbols=AAA,BBB");

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("CompareScreen read outcomes", () => {
  it("names the operation of a classification failure and falls back to the list for any other", async () => {
    listClassifications.mockImplementation(async (params = {}) =>
      list((params.symbols ?? []).map((symbol) => row(symbol))),
    );
    getStockEvidence.mockRejectedValue(
      new classificationClient.ClassificationApiError("RAW", "req-4", {
        code: "internal_error",
        operation: "get-stock-evidence",
        resource: "classification",
      }),
    );
    const { unmount } = render(
      <MemoryRouter initialEntries={["/research/compare?symbols=AAA,BBB"]}>
        <CompareScreen />
      </MemoryRouter>,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not load the stock's scores and inputs",
    );
    unmount();

    listClassifications.mockRejectedValue(new ApiError("RAW", "req-5", { code: "internal_error" }));
    render(
      <MemoryRouter initialEntries={["/research/compare?symbols=AAA,BBB"]}>
        <CompareScreen />
      </MemoryRouter>,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load the scores");
  });

  it("fails the read when a listed stock's evidence is not found", async () => {
    listClassifications.mockResolvedValue(list([row("AAA"), row("BBB")]));
    getStockEvidence.mockRejectedValue(
      new ApiError("RAW", "req-6", { code: "instrument_not_found" }),
    );
    renderAt("?symbols=AAA,BBB");

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("reports one symbol the API does not follow, without a column", async () => {
    getStockEvidence.mockRejectedValue(
      new ApiError("RAW", "req-7", { code: "instrument_not_found" }),
    );
    renderAt("?symbols=ZZZ");

    expect(await screen.findByText(COMPARE.notCompared("ZZZ"))).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("ignores a read that finishes after the symbols changed", async () => {
    const first: { resolve: (value: ClassificationList) => void } = { resolve: () => {} };
    listClassifications.mockImplementation((params = {}) => {
      if ((params.symbols ?? [])[0] === "AAA") {
        return new Promise<ClassificationList>((resolve) => {
          first.resolve = resolve;
        });
      }
      return Promise.resolve(list((params.symbols ?? []).map((symbol) => row(symbol))));
    });
    getStockEvidence.mockImplementation(async (symbol) => evidence(symbol));
    const user = userEvent.setup();
    renderAt("?symbols=AAA,BBB");

    await user.click(screen.getByRole("button", { name: "go elsewhere" }));
    await waitFor(() => expect(stockHeaders()).toHaveLength(2));
    first.resolve(list([row("AAA"), row("BBB")]));

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(stockHeaders().map((header) => header.getAttribute("data-symbol"))).toEqual([
      "CCC",
      "DDD",
    ]);
    expect(getStockEvidence).not.toHaveBeenCalledWith("AAA");
  });

  it("passes the factor summary to the table for two columns and not the prompt", async () => {
    const unranked = { qualifiedCount: 12, ranked: false, minPeerSetSize: 30 };
    listClassifications.mockImplementation(async (params = {}) =>
      list(
        (params.symbols ?? []).map((symbol) => row(symbol)),
        {
          factors: {
            value: { qualifiedCount: 120, ranked: true, minPeerSetSize: 30 },
            growth: unranked,
            momentum: { qualifiedCount: 120, ranked: true, minPeerSetSize: 30 },
          },
        },
      ),
    );
    getStockEvidence.mockImplementation(async (symbol) => evidence(symbol));
    renderAt("?symbols=AAA,BBB");

    await screen.findByRole("table");
    expect(screen.getByText(COMPARE.notEnoughToRankGroup(12, 30))).toBeInTheDocument();
    expect(screen.queryByText(COMPARE.chooseTwoToSix)).toBeNull();
    expect(screen.queryByText(RESULTS.neverScored)).toBeNull();
  });
});

describe("CompareScreen review fixes", () => {
  it("moves focus to the nearest column when the adjacent symbol has none", async () => {
    listClassifications.mockResolvedValue(
      list([row("AAA"), row("BBB")], { unknownSymbols: ["ZZZ"] }),
    );
    getStockEvidence.mockImplementation(async (symbol) => evidence(symbol));
    const user = userEvent.setup();
    renderAt("?symbols=AAA,ZZZ,BBB");
    await screen.findByRole("table");

    await user.click(screen.getByRole("button", { name: COMPARE.removeFromComparison("AAA") }));

    await waitFor(() => expect(stockHeaders()[0]).toHaveFocus());
    expect(stockHeaders()[0]).toHaveAttribute("data-symbol", "BBB");
  });

  it("does not show the bound message for a validation error on a single symbol", async () => {
    getStockEvidence.mockRejectedValue(new ApiError("RAW", "req-8", { code: "validation_error" }));
    renderAt("?symbols=A%2FB");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Could not load the scores");
    expect(screen.queryByText(COMPARE.atMost)).toBeNull();
    expect(screen.getByRole("button", { name: RESULTS.tryAgain })).toBeInTheDocument();
  });

  it("offers Try again, not a bound message, for the list read's other failures", async () => {
    listClassifications.mockRejectedValue(
      new ApiError("RAW", "req-9", { code: "validation_error" }),
    );
    renderAt("?symbols=AAA,BBB");

    expect(await screen.findByText(COMPARE.atMost, { selector: "p" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: RESULTS.tryAgain })).toBeNull();
  });

  it("adds to the URL as it stands when the read finishes, not as it was when Add was pressed", async () => {
    answerAll();
    let release: (value: StockEvidence) => void = () => {};
    getStockEvidence.mockImplementation((symbol) =>
      symbol === "NEW"
        ? new Promise<StockEvidence>((resolve) => {
            release = resolve;
          })
        : Promise.resolve(evidence(symbol)),
    );
    const user = userEvent.setup();
    renderAt("?symbols=AAA,BBB");
    await screen.findByRole("table");

    await user.type(screen.getByLabelText(COMPARE.addAStock), "new{Enter}");
    await user.click(screen.getByRole("button", { name: "go elsewhere" }));
    release(evidence("NEW"));

    await waitFor(() =>
      expect(screen.getByTestId("search")).toHaveTextContent(/^\?symbols=CCC,DDD,NEW$/),
    );
  });

  it("leaves the field alone when the API is unreachable during Add", async () => {
    answerAll();
    getStockEvidence.mockImplementation(async (symbol) => {
      if (symbol === "NEW") {
        throw new ApiUnreachableError("down");
      }
      return evidence(symbol);
    });
    const user = userEvent.setup();
    renderAt("?symbols=AAA,BBB");
    await screen.findByRole("table");

    await user.type(screen.getByLabelText(COMPARE.addAStock), "new{Enter}");

    await waitFor(() => expect(getStockEvidence).toHaveBeenCalledWith("NEW"));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(stockHeaders()).toHaveLength(2);
  });
});

describe("CompareScreen symbols the server neither returns nor reports", () => {
  it("names them in the notice rather than dropping them silently (DAC-E5-1)", async () => {
    listClassifications.mockResolvedValue(list([row("AAA"), row("BBB")]));
    getStockEvidence.mockImplementation(async (symbol) => evidence(symbol));
    renderAt("?symbols=AAA,BBB,GHOST");

    expect(await screen.findByText(COMPARE.notCompared("GHOST"))).toBeInTheDocument();
    expect(stockHeaders()).toHaveLength(2);
  });

  it("does not name a symbol twice when the server reports it as unknown", async () => {
    listClassifications.mockResolvedValue(
      list([row("AAA"), row("BBB")], { unknownSymbols: ["ZZZ"] }),
    );
    getStockEvidence.mockImplementation(async (symbol) => evidence(symbol));
    renderAt("?symbols=AAA,BBB,ZZZ");

    expect(await screen.findByText(COMPARE.notCompared("ZZZ"))).toBeInTheDocument();
  });

  it("shows the skeleton, not a blank, while the list read for a grown comparison is pending", async () => {
    getStockEvidence.mockImplementation(async (symbol) => evidence(symbol));
    listClassifications.mockReturnValue(new Promise<ClassificationList>(() => {}));
    const user = userEvent.setup();
    renderAt("?symbols=AAA");
    await screen.findByRole("table");

    await user.type(screen.getByLabelText(COMPARE.addAStock), "BBB{Enter}");

    await waitFor(() => expect(screen.getByText("Loading…")).toBeInTheDocument());
    expect(screen.queryByRole("table")).toBeNull();
  });
});

describe("CompareScreen while the list read for a new symbol is pending", () => {
  it("keeps the table and raises no false notice for the symbol just added", async () => {
    getStockEvidence.mockImplementation(async (symbol) => evidence(symbol));
    let finish: (value: ClassificationList) => void = () => {};
    listClassifications.mockImplementation((params = {}) =>
      (params.symbols ?? []).length === 3
        ? new Promise<ClassificationList>((resolve) => {
            finish = resolve;
          })
        : Promise.resolve(list((params.symbols ?? []).map((symbol) => row(symbol)))),
    );
    const user = userEvent.setup();
    renderAt("?symbols=AAA,BBB");
    await screen.findByRole("table");

    await user.type(screen.getByLabelText(COMPARE.addAStock), "CCC{Enter}");
    await waitFor(() => expect(screen.getByTestId("search")).toHaveTextContent("AAA,BBB,CCC"));

    expect(screen.queryByText(COMPARE.notCompared("CCC"))).toBeNull();
    expect(stockHeaders()).toHaveLength(2);

    finish(list([row("AAA"), row("BBB"), row("CCC")]));
    await waitFor(() => expect(stockHeaders()).toHaveLength(3));
    expect(screen.queryByText(COMPARE.notCompared("CCC"))).toBeNull();
  });
});
