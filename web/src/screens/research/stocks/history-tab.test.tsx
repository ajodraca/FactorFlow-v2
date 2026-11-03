import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as classificationClient from "../../../api/classification-client";
import { ApiUnreachableError } from "../../../api/client";
import type {
  FactorCell,
  FactorName,
  StockHistory,
  StockHistoryRow,
} from "../../../api/classification-types";
import { CELL, EVIDENCE, RESULTS, SCORE_SET, failureSentence } from "../copy";
import { formatTimestamp } from "../format";
import HistoryTab from "./history-tab";

vi.mock("../../../api/classification-client", async () => ({
  ...(await vi.importActual<typeof import("../../../api/classification-client")>(
    "../../../api/classification-client",
  )),
  getStockHistory: vi.fn(),
}));

const getStockHistory = vi.mocked(classificationClient.getStockHistory);
const { ClassificationApiError } = classificationClient;

function cell(overrides: Partial<FactorCell> = {}): FactorCell {
  return {
    status: "classified",
    score: "0.50",
    percentile: "50.00",
    reasonCode: null,
    reasonInput: null,
    reasonDetail: null,
    restatedPossible: false,
    ...overrides,
  };
}

function row(
  setId: string,
  classificationDate: string,
  endedAt: string,
  factors: Partial<Record<FactorName, FactorCell>> = {},
  runOutcome: StockHistoryRow["runOutcome"] = "succeeded",
): StockHistoryRow {
  return {
    setId,
    classificationDate,
    runId: `run-${setId}`,
    runOutcome,
    endedAt,
    factors: {
      value: factors.value ?? cell(),
      growth: factors.growth ?? cell(),
      momentum: factors.momentum ?? cell(),
    },
  };
}

function history(sets: StockHistoryRow[], nextCursor: string | null = null): StockHistory {
  return { symbol: "AAPL", sets, nextCursor };
}

const NEWEST = row("s-3", "2026-10-15", "2026-10-15T22:46:00Z", {
  value: cell({ percentile: "91.00", score: "1.34" }),
  growth: cell({ percentile: "72.00", score: "0.58" }),
  momentum: cell({ percentile: "33.00", score: "-0.44" }),
});
const MIDDLE = row("s-2", "2026-10-01", "2026-10-01T22:40:00Z", {
  value: cell({ percentile: "64.00", score: "0.36", restatedPossible: true }),
  growth: cell({ percentile: "55.00", score: "0.13" }),
  momentum: cell({ percentile: "21.00", score: "-0.81" }),
});
const OLDEST = row(
  "s-1",
  "2026-09-15",
  "2026-09-15T22:30:00Z",
  {
    value: cell({ percentile: "12.00", score: "-1.17" }),
    growth: cell({ percentile: "48.00", score: "-0.05", restatedPossible: true }),
    momentum: cell({ percentile: "80.00", score: "0.84" }),
  },
  "partial",
);

function renderTab(symbol = "AAPL") {
  return render(
    <MemoryRouter>
      <HistoryTab symbol={symbol} />
    </MemoryRouter>,
  );
}

/** The table once the first read has settled: the skeleton carries `aria-busy`. */
async function loadedTable(name?: string): Promise<HTMLElement> {
  const query = (): HTMLElement => screen.getByRole("table", name === undefined ? {} : { name });
  await waitFor(() => expect(query()).not.toHaveAttribute("aria-busy"));
  return query();
}

function bodyRows(): HTMLElement[] {
  const table = screen.getByRole("table");
  return within(table).getAllByRole("row").slice(1);
}

beforeEach(() => {
  getStockHistory.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("HistoryTab rows as recorded", () => {
  // Implements TC-COMP-154
  it("lists the rows in the order received, each as its own set recorded it", async () => {
    getStockHistory.mockResolvedValueOnce(history([NEWEST, MIDDLE, OLDEST]));
    renderTab();

    await loadedTable();
    const rows = bodyRows();
    expect(rows).toHaveLength(3);
    const dates = rows.map((tr) => within(tr).getByRole("rowheader").textContent);
    expect(dates).toEqual(["2026-10-15", "2026-10-01", "2026-09-15"]);

    const percentiles = rows.map((tr) =>
      within(tr)
        .getAllByTestId("factor-percentile")
        .map((node) => node.textContent),
    );
    expect(percentiles).toEqual([
      ["91", "72", "33"],
      ["64", "55", "21"],
      ["12", "48", "80"],
    ]);
    const scores = rows.map((tr) =>
      within(tr)
        .getAllByTestId("factor-score")
        .map((node) => node.textContent),
    );
    expect(scores).toEqual([
      ["+1.34", "+0.58", "-0.44"],
      ["+0.36", "+0.13", "-0.81"],
      ["-1.17", "-0.05", "+0.84"],
    ]);
    expect(screen.getAllByText(EVIDENCE.historyNote)).toHaveLength(1);
  });

  // Implements TC-COMP-154
  it("does not re-sort rows whose order differs from their dates", async () => {
    getStockHistory.mockResolvedValueOnce(history([OLDEST, NEWEST, MIDDLE]));
    renderTab();

    await loadedTable();
    const dates = bodyRows().map((tr) => within(tr).getByRole("rowheader").textContent);
    expect(dates).toEqual(["2026-09-15", "2026-10-15", "2026-10-01"]);
  });

  // Implements TC-COMP-155
  it("states that there are no earlier scores, apart from never scored", async () => {
    getStockHistory.mockResolvedValueOnce(history([]));
    renderTab();

    expect(await screen.findByText("No earlier scores for AAPL.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText(EVIDENCE.noScoreYet("AAPL"))).not.toBeInTheDocument();
    expect(screen.queryByText(/no stocks have been scored/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/has no score yet/i)).not.toBeInTheDocument();
  });

  // Implements TC-COMP-115
  it("keeps a retired stock's recorded rows, without replacing a cell by Not followed", async () => {
    getStockHistory.mockResolvedValueOnce(history([NEWEST, MIDDLE]));
    renderTab("OLD");

    await loadedTable();
    expect(getStockHistory).toHaveBeenCalledWith("OLD", expect.anything());
    expect(bodyRows()).toHaveLength(2);
    expect(screen.getAllByTestId("factor-percentile")).toHaveLength(6);
    expect(screen.queryByText(CELL.notFollowed)).not.toBeInTheDocument();
    expect(screen.queryByText(/^No earlier scores/)).not.toBeInTheDocument();
  });
});

describe("HistoryTab restated mark", () => {
  // Implements TC-COMP-191
  it("marks the older rows that carry it and leaves the newest unmarked", async () => {
    getStockHistory.mockResolvedValueOnce(history([NEWEST, MIDDLE, OLDEST]));
    renderTab();

    await loadedTable();
    const [newest, middle, oldest] = bodyRows();
    expect(within(newest).queryByText(CELL.possiblyRestated)).not.toBeInTheDocument();
    expect(within(middle).getAllByText(CELL.possiblyRestated)).toHaveLength(1);
    expect(within(oldest).getAllByText(CELL.possiblyRestated)).toHaveLength(1);
    // On the value cell of the middle row and the growth cell of the oldest.
    const middleCells = within(middle).getAllByTestId("factor-cell");
    expect(within(middleCells[0]).getByText(CELL.possiblyRestated)).toBeInTheDocument();
    const oldestCells = within(oldest).getAllByTestId("factor-cell");
    expect(within(oldestCells[1]).getByText(CELL.possiblyRestated)).toBeInTheDocument();
  });

  it("states the restatement sentence once, above the table, when any row is marked", async () => {
    getStockHistory.mockResolvedValueOnce(history([NEWEST, MIDDLE, OLDEST]));
    renderTab();

    const table = await loadedTable();
    const sentence = screen.getByText(CELL.restatedExplanation);
    expect(screen.getAllByText(CELL.restatedExplanation)).toHaveLength(1);
    expect(sentence.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const note = screen.getByText(EVIDENCE.historyNote);
    expect(note.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(document.querySelector("[aria-describedby]")).toBeNull();
  });

  it("omits the restatement sentence when no row is marked", async () => {
    getStockHistory.mockResolvedValueOnce(history([NEWEST]));
    renderTab();

    await loadedTable();
    expect(screen.queryByText(CELL.restatedExplanation)).not.toBeInTheDocument();
    // The history sentence is stated every time, marked or not.
    expect(screen.getAllByText(EVIDENCE.historyNote)).toHaveLength(1);
  });

  it.each(["value", "growth"] as const)(
    "states the restatement sentence when only a %s cell is marked",
    async (factor) => {
      const only = row("s-6", "2026-10-11", "2026-10-11T22:00:00Z", {
        [factor]: cell({ restatedPossible: true }),
      });
      getStockHistory.mockResolvedValueOnce(history([only]));
      renderTab();

      await loadedTable();
      expect(screen.getAllByText(CELL.possiblyRestated)).toHaveLength(1);
      expect(screen.getAllByText(CELL.restatedExplanation)).toHaveLength(1);
    },
  );

  it.each(["value", "growth"] as const)(
    "draws no mark and no sentence for an Incomplete %s cell that carries the flag",
    async (factor) => {
      const flagged = row("s-7", "2026-10-11", "2026-10-11T22:00:00Z", {
        [factor]: cell({
          status: "not_classified",
          percentile: null,
          score: null,
          reasonCode: "input_missing",
          restatedPossible: true,
        }),
      });
      getStockHistory.mockResolvedValueOnce(history([flagged]));
      renderTab();

      await loadedTable();
      expect(screen.getByText(CELL.incomplete)).toBeInTheDocument();
      expect(screen.queryByText(CELL.possiblyRestated)).not.toBeInTheDocument();
      expect(screen.queryByText(CELL.restatedExplanation)).not.toBeInTheDocument();
    },
  );

  it.each([
    ["a retired reason", { reasonCode: "retired" as const }],
    ["a not-enough-stocks reason", { reasonCode: "not_enough_stocks" as const }],
    ["an unclassified status", { status: "not_classified" as const }],
    ["no percentile", { percentile: null }],
  ])("draws no sentence for a flagged cell the factor cell does not score: %s", async (_, over) => {
    const flagged = row("s-8", "2026-10-11", "2026-10-11T22:00:00Z", {
      value: cell({ restatedPossible: true, ...over }),
    });
    getStockHistory.mockResolvedValueOnce(history([flagged]));
    renderTab();

    await loadedTable();
    expect(screen.queryByText(CELL.possiblyRestated)).not.toBeInTheDocument();
    expect(screen.queryByText(CELL.restatedExplanation)).not.toBeInTheDocument();
  });

  it("never marks momentum, even when the wire says restated", async () => {
    const odd = row("s-9", "2026-10-10", "2026-10-10T22:00:00Z", {
      momentum: cell({ restatedPossible: true }),
    });
    getStockHistory.mockResolvedValueOnce(history([odd]));
    renderTab();

    await loadedTable();
    expect(screen.queryByText(CELL.possiblyRestated)).not.toBeInTheDocument();
    // The sentence needs a mark to explain: a momentum flag draws none.
    expect(screen.queryByText(CELL.restatedExplanation)).not.toBeInTheDocument();
  });
});

describe("HistoryTab table content", () => {
  it("is a native table with labelled column and row headers", async () => {
    getStockHistory.mockResolvedValueOnce(history([NEWEST]));
    renderTab();

    const table = await loadedTable(EVIDENCE.earlierScoresFor("AAPL"));
    expect(table).toHaveAttribute("data-variant", "history");
    const headers = within(table)
      .getAllByRole("columnheader")
      .map((th) => th.textContent);
    expect(headers).toEqual([
      SCORE_SET.historyColumns.scoresDate,
      EVIDENCE.producedColumn,
      "Value",
      "Growth",
      "Momentum",
    ]);
    for (const th of within(table).getAllByRole("columnheader")) {
      expect(th).toHaveAttribute("scope", "col");
    }
    expect(within(table).getByRole("rowheader")).toHaveAttribute("scope", "row");
  });

  it("shows Produced as the end time, and the outcome as a word badge", async () => {
    getStockHistory.mockResolvedValueOnce(history([NEWEST, OLDEST]));
    renderTab();

    await loadedTable();
    const [first, second] = bodyRows();
    expect(within(first).getByText(formatTimestamp("2026-10-15T22:46:00Z"))).toBeInTheDocument();
    expect(within(first).getByRole("rowheader")).toHaveClass("font-numeric");
    const complete = within(first).getByText(SCORE_SET.complete);
    expect(complete.closest("[data-variant]")).toHaveAttribute("data-variant", "status-good");
    const partial = within(second).getByText(SCORE_SET.partial);
    expect(partial.closest("[data-variant]")).toHaveAttribute("data-variant", "status-warning");
  });

  it("names no run id, number or download link", async () => {
    getStockHistory.mockResolvedValueOnce(history([NEWEST, MIDDLE]));
    renderTab();

    await loadedTable();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText(/run-s-/)).not.toBeInTheDocument();
    expect(screen.queryByText(/#\d/)).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(within(screen.getByRole("table")).queryByRole("button")).not.toBeInTheDocument();
  });

  it("keeps an Incomplete recorded cell Incomplete and prints no polarity colour", async () => {
    const incomplete = row("s-4", "2026-10-12", "2026-10-12T22:00:00Z", {
      growth: cell({
        status: "not_classified",
        percentile: null,
        score: null,
        reasonCode: "input_missing",
      }),
    });
    getStockHistory.mockResolvedValueOnce(history([incomplete]));
    renderTab();

    await loadedTable();
    const [only] = bodyRows();
    expect(within(only).getByText(CELL.incomplete)).toBeInTheDocument();
    expect(within(only).getAllByTestId("factor-percentile")).toHaveLength(2);
    expect(within(only).queryByText(CELL.notFollowed)).not.toBeInTheDocument();
    const html = screen.getByRole("table").outerHTML;
    expect(html).not.toMatch(/\b(?:text|bg)-(?:gain|loss)\b/);
  });

  it("issues exactly one read on mount, with no cursor", async () => {
    getStockHistory.mockResolvedValueOnce(history([NEWEST]));
    renderTab();

    await loadedTable();
    await waitFor(() => expect(getStockHistory).toHaveBeenCalledTimes(1));
    expect(getStockHistory).toHaveBeenCalledWith("AAPL", { limit: 50 });
  });
});

describe("HistoryTab fetch per symbol", () => {
  // Implements T006: a rerender with the same symbol issues no new read; a changed symbol reads once.
  it("reads again only when the symbol changes, and drops the previous rows", async () => {
    getStockHistory.mockResolvedValueOnce(history([NEWEST]));
    const view = renderTab("AAPL");
    await loadedTable();

    view.rerender(
      <MemoryRouter>
        <HistoryTab symbol="AAPL" />
      </MemoryRouter>,
    );
    expect(getStockHistory).toHaveBeenCalledTimes(1);

    let settleSecond: (value: StockHistory) => void = () => undefined;
    getStockHistory.mockReturnValueOnce(
      new Promise<StockHistory>((resolve) => {
        settleSecond = resolve;
      }),
    );
    view.rerender(
      <MemoryRouter>
        <HistoryTab symbol="MSFT" />
      </MemoryRouter>,
    );
    // While MSFT is read, AAPL's rows are not shown under MSFT's label.
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByTestId("factor-percentile")).not.toBeInTheDocument();
    settleSecond({ symbol: "MSFT", sets: [], nextCursor: null });
    expect(await screen.findByText("No earlier scores for MSFT.")).toBeInTheDocument();
    expect(getStockHistory).toHaveBeenCalledTimes(2);
    expect(getStockHistory).toHaveBeenLastCalledWith("MSFT", { limit: 50 });
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("ignores a response that settles after the symbol changed", async () => {
    let settleFirst: (value: StockHistory) => void = () => undefined;
    getStockHistory.mockReturnValueOnce(
      new Promise<StockHistory>((resolve) => {
        settleFirst = resolve;
      }),
    );
    const view = renderTab("AAPL");
    getStockHistory.mockResolvedValueOnce({ symbol: "MSFT", sets: [], nextCursor: null });
    view.rerender(
      <MemoryRouter>
        <HistoryTab symbol="MSFT" />
      </MemoryRouter>,
    );
    await screen.findByText("No earlier scores for MSFT.");

    settleFirst(history([NEWEST]));
    await waitFor(() => expect(screen.queryByRole("table")).not.toBeInTheDocument());
    expect(screen.getByText("No earlier scores for MSFT.")).toBeInTheDocument();
  });

  it("keys rows by set, so two sets on one day render without a key warning", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const same = row("s-5", "2026-10-15", "2026-10-15T23:46:00Z");
    getStockHistory.mockResolvedValueOnce(history([NEWEST, same]));
    renderTab();

    await loadedTable();
    expect(bodyRows()).toHaveLength(2);
    expect(errors).not.toHaveBeenCalled();
  });
});

describe("HistoryTab late gaps from the cycle-1 reviews", () => {
  it("shows the scores date as recorded, not the day the set ended", async () => {
    const lateEnd = row("s-10", "2026-10-15", "2026-10-16T01:10:00Z");
    getStockHistory.mockResolvedValueOnce(history([lateEnd]));
    renderTab();

    await loadedTable();
    const [only] = bodyRows();
    expect(within(only).getByRole("rowheader")).toHaveTextContent("2026-10-15");
    expect(within(only).getByText(formatTimestamp("2026-10-16T01:10:00Z"))).toHaveClass(
      "font-numeric",
    );
  });

  it("labels the table with the symbol it was given", async () => {
    getStockHistory.mockResolvedValueOnce(history([NEWEST]));
    renderTab("OLD");

    expect(await loadedTable(EVIDENCE.earlierScoresFor("OLD"))).toBeInTheDocument();
  });
});

function apiError(code: string) {
  return new ClassificationApiError("ignored envelope message", "req-1", {
    code,
    operation: "get-stock-history",
    resource: "classification",
  });
}

describe("HistoryTab paging", () => {
  // Implements T006
  it("shows Show more only while a cursor is held, and appends the next page after the rows", async () => {
    const user = userEvent.setup();
    getStockHistory.mockResolvedValueOnce(history([NEWEST, MIDDLE], "cur-1"));
    renderTab();

    await loadedTable();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    const more = screen.getByRole("button", { name: SCORE_SET.showMore });
    getStockHistory.mockResolvedValueOnce(history([OLDEST], null));
    await user.click(more);

    await waitFor(() => expect(bodyRows()).toHaveLength(3));
    expect(getStockHistory).toHaveBeenCalledTimes(2);
    expect(getStockHistory).toHaveBeenLastCalledWith("AAPL", { limit: 50, cursor: "cur-1" });
    const dates = bodyRows().map((tr) => within(tr).getByRole("rowheader").textContent);
    expect(dates).toEqual(["2026-10-15", "2026-10-01", "2026-09-15"]);
    expect(screen.queryByRole("button", { name: SCORE_SET.showMore })).not.toBeInTheDocument();
    expect(screen.getAllByText(EVIDENCE.historyNote)).toHaveLength(1);
  });

  it("has no Show more when the first page held no cursor", async () => {
    getStockHistory.mockResolvedValueOnce(history([NEWEST]));
    renderTab();

    await loadedTable();
    expect(screen.queryByRole("button", { name: SCORE_SET.showMore })).not.toBeInTheDocument();
  });

  it("disables Show more while a read is in flight, and issues one read for repeated activation", async () => {
    const user = userEvent.setup();
    getStockHistory.mockResolvedValueOnce(history([NEWEST], "cur-1"));
    renderTab();
    await loadedTable();

    let settle: (value: StockHistory) => void = () => undefined;
    getStockHistory.mockReturnValueOnce(
      new Promise<StockHistory>((resolve) => {
        settle = resolve;
      }),
    );
    const more = screen.getByRole("button", { name: SCORE_SET.showMore });
    await user.click(more);
    expect(more).toHaveAttribute("aria-disabled", "true");
    expect(more).not.toBeDisabled();
    await user.click(more);
    expect(getStockHistory).toHaveBeenCalledTimes(2);

    await act(async () => {
      settle(history([MIDDLE], "cur-2"));
    });
    await waitFor(() => expect(bodyRows()).toHaveLength(2));
    expect(screen.getByRole("button", { name: SCORE_SET.showMore })).not.toHaveAttribute(
      "aria-disabled",
    );
  });

  // Implements TC-COMP-191: a later page never changes a mark on a row already shown.
  it("leaves the marks of rows already shown as they were when more rows arrive", async () => {
    const user = userEvent.setup();
    getStockHistory.mockResolvedValueOnce(history([NEWEST, MIDDLE], "cur-1"));
    renderTab();
    await loadedTable();
    expect(screen.getAllByText(CELL.possiblyRestated)).toHaveLength(1);

    getStockHistory.mockResolvedValueOnce(history([OLDEST], null));
    await user.click(screen.getByRole("button", { name: SCORE_SET.showMore }));
    await waitFor(() => expect(bodyRows()).toHaveLength(3));

    const [newest, middle, oldest] = bodyRows();
    expect(within(newest).queryByText(CELL.possiblyRestated)).not.toBeInTheDocument();
    expect(within(middle).getAllByText(CELL.possiblyRestated)).toHaveLength(1);
    expect(within(oldest).getAllByText(CELL.possiblyRestated)).toHaveLength(1);
    expect(screen.getAllByText(CELL.restatedExplanation)).toHaveLength(1);
  });

  it("keeps the loaded rows and states the failure beneath them when Show more fails", async () => {
    const user = userEvent.setup();
    getStockHistory.mockResolvedValueOnce(history([NEWEST], "cur-1"));
    renderTab();
    await loadedTable();

    getStockHistory.mockRejectedValueOnce(apiError("cursor_stale"));
    await user.click(screen.getByRole("button", { name: SCORE_SET.showMore }));

    const sentence = failureSentence({
      operation: "get-stock-history",
      resource: "classification",
      code: "cursor_stale",
    });
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(sentence);
    expect(bodyRows()).toHaveLength(1);
    const table = screen.getByRole("table");
    expect(table.compareDocumentPosition(alert) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByText(apiError("cursor_stale").message)).not.toBeInTheDocument();
  });
});

describe("HistoryTab states", () => {
  // Implements T007
  it("renders a skeleton table with the final columns while the first read is pending", () => {
    getStockHistory.mockReturnValueOnce(new Promise<StockHistory>(() => undefined));
    renderTab();

    const table = screen.getByRole("table", { name: EVIDENCE.earlierScoresFor("AAPL") });
    expect(table).toHaveAttribute("aria-busy", "true");
    const headers = within(table)
      .getAllByRole("columnheader")
      .map((th) => th.textContent);
    expect(headers).toEqual([
      SCORE_SET.historyColumns.scoresDate,
      EVIDENCE.producedColumn,
      "Value",
      "Growth",
      "Momentum",
    ]);
    const placeholders = within(table).getAllByRole("cell");
    expect(placeholders).toHaveLength(3);
    for (const placeholder of placeholders) {
      expect(placeholder).toHaveAttribute("colspan", "5");
    }
    expect(screen.queryByText("No earlier scores for AAPL.")).not.toBeInTheDocument();
  });

  it.each([
    ["instrument_not_found", "FactorFlow doesn't follow a stock named AAPL."],
    [
      "internal_error",
      "Could not load the stock's earlier scores: FactorFlow hit an unexpected problem. Try again.",
    ],
    [
      "validation_error",
      "Could not load the stock's earlier scores: FactorFlow could not accept the scores as entered. Check it, then try again.",
    ],
  ])(
    "states a %s failure by operation, resource and reason, never the envelope message",
    async (code, sentence) => {
      getStockHistory.mockRejectedValueOnce(apiError(code));
      renderTab();

      expect(await screen.findByText(sentence)).toBeInTheDocument();
      expect(screen.queryByText(/ignored envelope message/)).not.toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: RESULTS.tryAgain })).toBeInTheDocument();
    },
  );

  it("states an unexpected failure with the fallback sentence", async () => {
    getStockHistory.mockRejectedValueOnce(new Error("boom"));
    renderTab();

    expect(
      await screen.findByText(
        "Could not load the stock's earlier scores: FactorFlow hit an unexpected problem. Try again.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/boom/)).not.toBeInTheDocument();
  });

  it("reissues the first read from Try again", async () => {
    const user = userEvent.setup();
    getStockHistory.mockRejectedValueOnce(apiError("internal_error"));
    renderTab();
    const retry = await screen.findByRole("button", { name: RESULTS.tryAgain });

    getStockHistory.mockResolvedValueOnce(history([NEWEST]));
    await user.click(retry);

    await loadedTable();
    expect(getStockHistory).toHaveBeenCalledTimes(2);
    expect(getStockHistory).toHaveBeenLastCalledWith("AAPL", { limit: 50 });
    expect(screen.queryByRole("button", { name: RESULTS.tryAgain })).not.toBeInTheDocument();
  });

  it("renders nothing for an unreachable API, which the shell states", async () => {
    getStockHistory.mockRejectedValueOnce(new ApiUnreachableError("offline"));
    const { container } = renderTab();

    await waitFor(() => expect(screen.queryByRole("table")).not.toBeInTheDocument());
    expect(container).toBeEmptyDOMElement();
  });
});

describe("HistoryTab page failures and symbol changes", () => {
  function swap(view: ReturnType<typeof renderTab>, symbol: string): void {
    view.rerender(
      <MemoryRouter>
        <HistoryTab symbol={symbol} />
      </MemoryRouter>,
    );
  }

  it("lets Show more be tried again after a page failed, clearing the alert once it succeeds", async () => {
    const user = userEvent.setup();
    getStockHistory.mockResolvedValueOnce(history([NEWEST], "cur-1"));
    renderTab();
    await loadedTable();

    getStockHistory.mockRejectedValueOnce(apiError("internal_error"));
    await user.click(screen.getByRole("button", { name: SCORE_SET.showMore }));
    await screen.findByRole("alert");
    const more = screen.getByRole("button", { name: SCORE_SET.showMore });
    expect(more).not.toHaveAttribute("aria-disabled");

    getStockHistory.mockResolvedValueOnce(history([MIDDLE], null));
    await user.click(more);
    await waitFor(() => expect(bodyRows()).toHaveLength(2));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(getStockHistory).toHaveBeenCalledTimes(3);
  });

  it("clears the alert while the next page is read", async () => {
    const user = userEvent.setup();
    getStockHistory.mockResolvedValueOnce(history([NEWEST], "cur-1"));
    renderTab();
    await loadedTable();
    getStockHistory.mockRejectedValueOnce(apiError("cursor_stale"));
    await user.click(screen.getByRole("button", { name: SCORE_SET.showMore }));
    await screen.findByRole("alert");

    getStockHistory.mockReturnValueOnce(new Promise<StockHistory>(() => undefined));
    await user.click(screen.getByRole("button", { name: SCORE_SET.showMore }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders nothing when the API is unreachable while paging", async () => {
    const user = userEvent.setup();
    getStockHistory.mockResolvedValueOnce(history([NEWEST], "cur-1"));
    const { container } = renderTab();
    await loadedTable();

    getStockHistory.mockRejectedValueOnce(new ApiUnreachableError("offline"));
    await user.click(screen.getByRole("button", { name: SCORE_SET.showMore }));
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("reads further pages for the symbol now shown, not the one first mounted", async () => {
    const user = userEvent.setup();
    getStockHistory.mockResolvedValueOnce(history([NEWEST], "cur-a"));
    const view = renderTab("AAPL");
    await loadedTable();

    getStockHistory.mockResolvedValueOnce({ symbol: "MSFT", sets: [MIDDLE], nextCursor: "cur-m" });
    swap(view, "MSFT");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: SCORE_SET.showMore })).toBeVisible(),
    );
    getStockHistory.mockResolvedValueOnce(history([OLDEST], null));
    await user.click(screen.getByRole("button", { name: SCORE_SET.showMore }));

    await waitFor(() => expect(bodyRows()).toHaveLength(2));
    expect(getStockHistory).toHaveBeenLastCalledWith("MSFT", { limit: 50, cursor: "cur-m" });
  });

  it("ignores a page that settles after the symbol changed", async () => {
    const user = userEvent.setup();
    getStockHistory.mockResolvedValueOnce(history([NEWEST], "cur-a"));
    const view = renderTab("AAPL");
    await loadedTable();

    let settle: (value: StockHistory) => void = () => undefined;
    getStockHistory.mockReturnValueOnce(
      new Promise<StockHistory>((resolve) => {
        settle = resolve;
      }),
    );
    await user.click(screen.getByRole("button", { name: SCORE_SET.showMore }));
    getStockHistory.mockResolvedValueOnce({ symbol: "MSFT", sets: [MIDDLE], nextCursor: null });
    swap(view, "MSFT");
    await waitFor(() => expect(bodyRows()).toHaveLength(1));

    await act(async () => {
      settle(history([OLDEST], null));
    });
    expect(bodyRows()).toHaveLength(1);
    expect(within(bodyRows()[0]).getByRole("rowheader")).toHaveTextContent("2026-10-01");
  });

  it("ignores a page failure that settles after the symbol changed", async () => {
    const user = userEvent.setup();
    getStockHistory.mockResolvedValueOnce(history([NEWEST], "cur-a"));
    const view = renderTab("AAPL");
    await loadedTable();

    let fail: (reason: unknown) => void = () => undefined;
    getStockHistory.mockReturnValueOnce(
      new Promise<StockHistory>((_, reject) => {
        fail = reject;
      }),
    );
    await user.click(screen.getByRole("button", { name: SCORE_SET.showMore }));
    getStockHistory.mockResolvedValueOnce(history([MIDDLE], null));
    swap(view, "MSFT");
    await waitFor(() => expect(bodyRows()).toHaveLength(1));

    await act(async () => {
      fail(apiError("cursor_stale"));
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("clears a page failure and an in-flight page when the symbol changes", async () => {
    const user = userEvent.setup();
    getStockHistory.mockResolvedValueOnce(history([NEWEST], "cur-a"));
    const view = renderTab("AAPL");
    await loadedTable();
    getStockHistory.mockRejectedValueOnce(apiError("cursor_stale"));
    await user.click(screen.getByRole("button", { name: SCORE_SET.showMore }));
    await screen.findByRole("alert");

    getStockHistory.mockResolvedValueOnce(history([MIDDLE], "cur-m"));
    swap(view, "MSFT");
    await waitFor(() => expect(bodyRows()).toHaveLength(1));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("is not left pending when the symbol changes during a page read", async () => {
    const user = userEvent.setup();
    getStockHistory.mockResolvedValueOnce(history([NEWEST], "cur-a"));
    const view = renderTab("AAPL");
    await loadedTable();
    getStockHistory.mockReturnValueOnce(new Promise<StockHistory>(() => undefined));
    await user.click(screen.getByRole("button", { name: SCORE_SET.showMore }));

    getStockHistory.mockResolvedValueOnce(history([MIDDLE], "cur-m"));
    swap(view, "MSFT");
    await waitFor(() => expect(bodyRows()).toHaveLength(1));
    expect(screen.getByRole("button", { name: SCORE_SET.showMore })).not.toHaveAttribute(
      "aria-disabled",
    );
  });

  it("shows the tab again when the symbol changes after an unreachable read", async () => {
    getStockHistory.mockRejectedValueOnce(new ApiUnreachableError("offline"));
    const view = renderTab("AAPL");
    await waitFor(() => expect(screen.queryByRole("table")).not.toBeInTheDocument());

    getStockHistory.mockResolvedValueOnce(history([NEWEST]));
    swap(view, "MSFT");
    await loadedTable();
    expect(bodyRows()).toHaveLength(1);
  });

  it("offers Try again beside a failed page, re-reading the same page for a transient failure", async () => {
    const user = userEvent.setup();
    getStockHistory.mockResolvedValueOnce(history([NEWEST], "cur-1"));
    renderTab();
    await loadedTable();
    getStockHistory.mockRejectedValueOnce(apiError("internal_error"));
    await user.click(screen.getByRole("button", { name: SCORE_SET.showMore }));
    await screen.findByRole("alert");

    getStockHistory.mockResolvedValueOnce(history([MIDDLE], null));
    await user.click(screen.getByRole("button", { name: RESULTS.tryAgain }));

    await waitFor(() => expect(bodyRows()).toHaveLength(2));
    expect(getStockHistory).toHaveBeenLastCalledWith("AAPL", { limit: 50, cursor: "cur-1" });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it.each(["cursor_stale", "cursor_invalid"])(
    "restarts from the first page on Try again after a refused cursor (%s)",
    async (code) => {
      const user = userEvent.setup();
      getStockHistory.mockResolvedValueOnce(history([NEWEST], "cur-1"));
      renderTab();
      await loadedTable();
      getStockHistory.mockRejectedValueOnce(apiError(code));
      await user.click(screen.getByRole("button", { name: SCORE_SET.showMore }));
      await screen.findByRole("alert");

      getStockHistory.mockResolvedValueOnce(history([MIDDLE, OLDEST], null));
      await user.click(screen.getByRole("button", { name: RESULTS.tryAgain }));

      await waitFor(() => expect(bodyRows()).toHaveLength(2));
      expect(getStockHistory).toHaveBeenLastCalledWith("AAPL", { limit: 50 });
      expect(getStockHistory).toHaveBeenCalledTimes(3);
      const dates = bodyRows().map((tr) => within(tr).getByRole("rowheader").textContent);
      expect(dates).toEqual(["2026-10-01", "2026-09-15"]);
    },
  );

  it("moves focus to the table when the last page removes the focused Show more", async () => {
    const user = userEvent.setup();
    getStockHistory.mockResolvedValueOnce(history([NEWEST], "cur-1"));
    renderTab();
    await loadedTable();
    getStockHistory.mockResolvedValueOnce(history([MIDDLE], null));
    await user.click(screen.getByRole("button", { name: SCORE_SET.showMore }));

    await waitFor(() => expect(bodyRows()).toHaveLength(2));
    expect(screen.getByRole("table")).toHaveFocus();
  });

  it("does not take focus when the last page arrives while focus is elsewhere", async () => {
    const user = userEvent.setup();
    getStockHistory.mockResolvedValueOnce(history([NEWEST], "cur-1"));
    renderTab();
    await loadedTable();
    let settle: (value: StockHistory) => void = () => undefined;
    getStockHistory.mockReturnValueOnce(
      new Promise<StockHistory>((resolve) => {
        settle = resolve;
      }),
    );
    await user.click(screen.getByRole("button", { name: SCORE_SET.showMore }));
    screen.getByRole("button", { name: SCORE_SET.showMore }).blur();

    await act(async () => {
      settle(history([MIDDLE], null));
    });
    await waitFor(() => expect(bodyRows()).toHaveLength(2));
    expect(screen.getByRole("table")).not.toHaveFocus();
  });

  it("draws Show more as a secondary button", async () => {
    getStockHistory.mockResolvedValueOnce(history([NEWEST], "cur-1"));
    renderTab();
    await loadedTable();

    expect(screen.getByRole("button", { name: SCORE_SET.showMore })).toHaveAttribute(
      "data-variant",
      "secondary",
    );
  });

  it("ignores a first-read failure that settles after the symbol changed", async () => {
    let fail: (reason: unknown) => void = () => undefined;
    getStockHistory.mockReturnValueOnce(
      new Promise<StockHistory>((_, reject) => {
        fail = reject;
      }),
    );
    const view = renderTab("AAPL");
    getStockHistory.mockResolvedValueOnce(history([MIDDLE]));
    swap(view, "MSFT");
    await loadedTable();

    await act(async () => {
      fail(apiError("internal_error"));
    });
    expect(bodyRows()).toHaveLength(1);
    expect(screen.queryByRole("button", { name: RESULTS.tryAgain })).not.toBeInTheDocument();
  });

  it("ignores an unreachable first read that settles after the symbol changed", async () => {
    let fail: (reason: unknown) => void = () => undefined;
    getStockHistory.mockReturnValueOnce(
      new Promise<StockHistory>((_, reject) => {
        fail = reject;
      }),
    );
    const view = renderTab("AAPL");
    getStockHistory.mockResolvedValueOnce(history([MIDDLE]));
    swap(view, "MSFT");
    await loadedTable();

    await act(async () => {
      fail(new ApiUnreachableError("offline"));
    });
    expect(bodyRows()).toHaveLength(1);
  });

  it("keeps focus on Show more while pages remain, and moves it to the table on every last page", async () => {
    const user = userEvent.setup();
    getStockHistory.mockResolvedValueOnce(history([NEWEST], "cur-1"));
    const view = renderTab("AAPL");
    await loadedTable();
    getStockHistory.mockResolvedValueOnce(history([MIDDLE], "cur-2"));
    await user.click(screen.getByRole("button", { name: SCORE_SET.showMore }));
    await waitFor(() => expect(bodyRows()).toHaveLength(2));
    expect(screen.getByRole("button", { name: SCORE_SET.showMore })).toHaveFocus();
    getStockHistory.mockResolvedValueOnce(history([OLDEST], null));
    await user.click(screen.getByRole("button", { name: SCORE_SET.showMore }));
    await waitFor(() => expect(bodyRows()).toHaveLength(3));
    const table = screen.getByRole("table");
    expect(table).toHaveFocus();
    expect(table).toHaveAttribute("tabindex", "-1");

    getStockHistory.mockResolvedValueOnce(history([NEWEST], "cur-3"));
    swap(view, "MSFT");
    await waitFor(() => expect(bodyRows()).toHaveLength(1));
    getStockHistory.mockResolvedValueOnce(history([MIDDLE], null));
    await user.click(screen.getByRole("button", { name: SCORE_SET.showMore }));
    await waitFor(() => expect(bodyRows()).toHaveLength(2));
    expect(screen.getByRole("table")).toHaveFocus();
  });
});
