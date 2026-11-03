import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type {
  FactorCell,
  FactorName,
  FactorSummary,
  InputRow,
  InputStatus,
} from "../../api/classification-types";
import { CELL, COMPARE, INPUT_STATUS } from "../../screens/research/copy";
import {
  formatPercentile,
  formatRate,
  formatRatio,
  formatScore,
} from "../../screens/research/format";
import { type ComparisonColumn, ComparisonTable } from "./comparison-table";

const NONE: FactorCell = {
  status: "not_classified",
  score: null,
  percentile: null,
  reasonCode: null,
  reasonInput: null,
  reasonDetail: null,
  restatedPossible: false,
};

function scored(percentile: string, score: string, restatedPossible = false): FactorCell {
  return { ...NONE, status: "classified", percentile, score, restatedPossible };
}

const INPUT_FACTOR: Record<string, FactorName> = {
  book_to_price: "value",
  earnings_yield: "value",
  fcf_yield: "value",
  revenue_growth: "growth",
  eps_growth: "growth",
  return_3m: "momentum",
  return_6m: "momentum",
  return_12m: "momentum",
};

const INPUT_VALUE: Record<string, string> = {
  book_to_price: "0.8512",
  earnings_yield: "0.0634",
  fcf_yield: "0.0411",
  revenue_growth: "0.1234",
  eps_growth: "-0.0521",
  return_3m: "0.0310",
  return_6m: "-0.0150",
  return_12m: "0.2200",
};

function input(
  inputName: string,
  status: InputStatus = "present",
  overrides: Partial<InputRow> = {},
): InputRow {
  return {
    factor: INPUT_FACTOR[inputName] as FactorName,
    inputName,
    label: inputName,
    status,
    value: status === "missing" ? null : (INPUT_VALUE[inputName] ?? null),
    asOf: "2025-06-27",
    knownOn: "2026-10-14",
    restatedPossible: false,
    detail: null,
    ...overrides,
  };
}

function allInputs(): InputRow[] {
  return Object.keys(INPUT_VALUE).map((name) => input(name));
}

function column(symbol: string, overrides: Partial<ComparisonColumn> = {}): ComparisonColumn {
  return {
    symbol,
    name: `${symbol} Inc`,
    lifecycle: "active",
    factors: {
      value: scored("72.4", "0.61"),
      growth: scored("40.2", "-0.10"),
      momentum: scored("90.9", "1.25"),
    },
    inputs: allInputs(),
    ...overrides,
  };
}

const SUMMARY: Record<FactorName, FactorSummary> = {
  value: { qualifiedCount: 120, ranked: true, minPeerSetSize: 30 },
  growth: { qualifiedCount: 120, ranked: true, minPeerSetSize: 30 },
  momentum: { qualifiedCount: 120, ranked: true, minPeerSetSize: 30 },
};

function renderTable(
  columns: ComparisonColumn[],
  factors: Record<FactorName, FactorSummary> | undefined = SUMMARY,
  onRemove: (symbol: string) => void = () => {},
): HTMLElement {
  render(
    <MemoryRouter>
      <ComparisonTable columns={columns} factors={factors} onRemove={onRemove} />
    </MemoryRouter>,
  );
  return screen.getByRole("table");
}

/** The cell at a row header's name and a column's position (0-based, among stock columns). */
function cellAt(table: HTMLElement, rowName: string | RegExp, columnIndex: number): HTMLElement {
  const row = within(table)
    .getAllByRole("row")
    .find((candidate) => {
      const header = within(candidate).queryAllByRole("rowheader")[0];
      return (
        header !== undefined &&
        (typeof rowName === "string"
          ? header.textContent?.startsWith(rowName)
          : rowName.test(header.textContent ?? ""))
      );
    });
  if (row === undefined) {
    throw new Error(`no row ${String(rowName)}`);
  }
  return within(row).getAllByRole("cell")[columnIndex] as HTMLElement;
}

describe("ComparisonTable mandatory cases", () => {
  // Implements TC-COMP-127
  it("keeps an incomplete stock's column and names the input (DAC-E5-S1-1)", () => {
    const incomplete = column("BBB", {
      factors: {
        value: scored("50", "0.00"),
        growth: {
          ...NONE,
          reasonCode: "input_missing",
          reasonInput: "revenue_growth",
          reasonDetail: "revenue missing",
        },
        momentum: scored("60", "0.40"),
      },
      inputs: allInputs().map((row) =>
        row.inputName === "revenue_growth"
          ? { ...row, label: "Revenue growth", status: "missing" as const, value: null }
          : row,
      ),
    });
    const table = renderTable([column("AAA"), incomplete, column("CCC")]);

    expect(within(table).getAllByRole("columnheader", { name: /Inc/ })).toHaveLength(3);
    const percentileRows = within(table)
      .getAllByRole("row")
      .filter((row) =>
        within(row).queryAllByRole("rowheader")[0]?.textContent?.startsWith(COMPARE.percentile),
      );
    expect(percentileRows).toHaveLength(3);
    const badge = within(percentileRows[1] as HTMLElement).getAllByTestId(
      "factor-cell",
    )[1] as HTMLElement;
    expect(badge).toHaveTextContent(/^\W*Incomplete$/);
    expect(badge.getAttribute("title")).toContain("revenue missing");

    const scoreRows = within(table)
      .getAllByRole("row")
      .filter((row) =>
        within(row)
          .queryAllByRole("rowheader")[0]
          ?.textContent?.startsWith(COMPARE.standardisedScore),
      );
    expect(within(scoreRows[1] as HTMLElement).getAllByRole("cell")[1]).toHaveTextContent("—");

    const revenue = cellAt(table, COMPARE.inputLabels.revenue_growth, 1);
    expect(revenue).toHaveTextContent("—");
    expect(revenue).toHaveTextContent(INPUT_STATUS.missing);
    expect(cellAt(table, COMPARE.inputLabels.eps_growth, 1)).toHaveTextContent(
      formatRate(INPUT_VALUE.eps_growth as string),
    );

    expect(table.textContent).not.toContain("revenue_growth");
    for (const element of table.querySelectorAll("[title]")) {
      expect(element.getAttribute("title")).not.toContain("revenue_growth");
    }
  });

  // Implements TC-COMP-127
  it("states not enough to rank once in the group header and in every percentile cell", () => {
    const unranked = {
      ...SUMMARY,
      growth: { qualifiedCount: 12, ranked: false, minPeerSetSize: 30 },
    };
    const cell: FactorCell = { ...NONE, reasonCode: "not_enough_stocks" };
    const columns = [
      column("AAA", { factors: { ...column("AAA").factors, growth: cell } }),
      column("BBB", { factors: { ...column("BBB").factors, growth: cell } }),
    ];
    const table = renderTable(columns, unranked);

    expect(within(table).getAllByText(COMPARE.notEnoughToRankGroup(12, 30))).toHaveLength(1);
    const percentileRows = within(table)
      .getAllByRole("row")
      .filter((row) =>
        within(row).queryAllByRole("rowheader")[0]?.textContent?.startsWith(COMPARE.percentile),
      );
    const growthRow = percentileRows[1] as HTMLElement;
    for (const cellElement of within(growthRow).getAllByRole("cell")) {
      expect(cellElement).toHaveTextContent(CELL.notEnoughToRank);
    }
    const scoreRows = within(table)
      .getAllByRole("row")
      .filter((row) =>
        within(row)
          .queryAllByRole("rowheader")[0]
          ?.textContent?.startsWith(COMPARE.standardisedScore),
      );
    for (const cellElement of within(scoreRows[1] as HTMLElement).getAllByRole("cell")) {
      expect(cellElement).toHaveTextContent("—");
    }
  });

  // Implements TC-COMP-114
  it("reads Not followed on every factor of a retired stock (DAC-E5-S1-4)", () => {
    const retiredCell: FactorCell = {
      ...NONE,
      reasonCode: "retired",
      percentile: "55",
      status: "classified",
    };
    const retired = column("OLD", {
      lifecycle: "retired",
      factors: { value: retiredCell, growth: retiredCell, momentum: retiredCell },
      inputs: [],
    });
    const table = renderTable([column("AAA"), retired]);

    const percentileRows = within(table)
      .getAllByRole("row")
      .filter((row) =>
        within(row).queryAllByRole("rowheader")[0]?.textContent?.startsWith(COMPARE.percentile),
      );
    expect(percentileRows).toHaveLength(3);
    for (const row of percentileRows) {
      expect(within(row).getAllByRole("cell")[1]).toHaveTextContent(CELL.notFollowed);
    }
    const scoreRows = within(table)
      .getAllByRole("row")
      .filter((row) =>
        within(row)
          .queryAllByRole("rowheader")[0]
          ?.textContent?.startsWith(COMPARE.standardisedScore),
      );
    for (const row of scoreRows) {
      expect(within(row).getAllByRole("cell")[1]).toHaveTextContent("—");
    }
    const header = within(table).getByRole("columnheader", { name: /OLD/ });
    expect(header).toHaveTextContent(CELL.notFollowed);
  });
});

describe("ComparisonTable per-input status (DEC-0077)", () => {
  it("renders each status as the design says", () => {
    const columnA = column("AAA", {
      inputs: [
        input("book_to_price", "present"),
        input("earnings_yield", "missing"),
        input("fcf_yield", "outdated"),
        input("revenue_growth", "not_computable"),
        input("eps_growth", "present"),
        input("return_3m", "present"),
        input("return_6m", "present"),
        input("return_12m", "present"),
      ],
    });
    const table = renderTable([columnA, column("BBB")]);

    const present = cellAt(table, COMPARE.inputLabels.book_to_price, 0);
    expect(present).toHaveTextContent(formatRatio("0.8512"));
    expect(present).not.toHaveTextContent(INPUT_STATUS.missing);
    expect(present).not.toHaveTextContent(INPUT_STATUS.outdated);

    const missing = cellAt(table, COMPARE.inputLabels.earnings_yield, 0);
    expect(missing).toHaveTextContent("—");
    expect(
      within(missing).getByText(INPUT_STATUS.missing).closest("[data-variant]"),
    ).toHaveAttribute("data-variant", "coverage-absent");

    const outdated = cellAt(table, COMPARE.inputLabels.fcf_yield, 0);
    expect(outdated).toHaveTextContent(formatRatio("0.0411"));
    expect(
      within(outdated).getByText(INPUT_STATUS.outdated).closest("[data-variant]"),
    ).toHaveAttribute("data-variant", "status-warning");

    const notComputable = cellAt(table, COMPARE.inputLabels.revenue_growth, 0);
    const text = within(notComputable).getByText(INPUT_STATUS.not_computable);
    expect(text.closest("[data-variant]")).toBeNull();
    expect(notComputable.querySelector("[aria-hidden='true']")).not.toBeNull();
  });

  it("shows only an em dash for every input of a stock whose evidence has none", () => {
    const retired = column("OLD", { lifecycle: "retired", inputs: [] });
    const table = renderTable([column("AAA"), retired]);

    for (const label of Object.values(COMPARE.inputLabels)) {
      const cell = cellAt(table, label, 1);
      expect(cell.textContent?.trim()).toBe("—");
    }
    const retiredColumnText = Array.from(table.querySelectorAll("tbody tr"))
      .map((row) => row.querySelectorAll("td")[1]?.textContent ?? "")
      .join(" ");
    expect(retiredColumnText).not.toContain(INPUT_STATUS.missing);
    expect(retiredColumnText).not.toContain(INPUT_STATUS.outdated);
    expect(retiredColumnText).not.toContain(INPUT_STATUS.not_computable);
  });

  it("prints each row at its precision (DEC-0063)", () => {
    const table = renderTable([column("AAA"), column("BBB")]);

    expect(cellAt(table, COMPARE.percentile, 0)).toHaveTextContent(formatPercentile("72.4"));
    expect(cellAt(table, COMPARE.standardisedScore, 0)).toHaveTextContent("+0.61");
    expect(cellAt(table, COMPARE.standardisedScore, 1)).toHaveTextContent("+0.61");
    expect(cellAt(table, COMPARE.inputLabels.earnings_yield, 0)).toHaveTextContent("0.06");
    expect(cellAt(table, COMPARE.inputLabels.eps_growth, 0)).toHaveTextContent("-5.21%");
    expect(cellAt(table, COMPARE.inputLabels.return_3m, 0)).toHaveTextContent("+3.10%");
  });

  it("prints a measured 0.00 score unsigned and never 0 for an unscored one", () => {
    const zero = column("AAA", {
      factors: { ...column("AAA").factors, value: scored("50", "0.00") },
    });
    const unscored = column("BBB", {
      factors: {
        ...column("BBB").factors,
        value: { ...NONE, reasonCode: "input_missing" },
      },
    });
    const table = renderTable([zero, unscored]);

    const scoreRows = within(table)
      .getAllByRole("row")
      .filter((row) =>
        within(row)
          .queryAllByRole("rowheader")[0]
          ?.textContent?.startsWith(COMPARE.standardisedScore),
      );
    const valueScores = within(scoreRows[0] as HTMLElement).getAllByRole("cell");
    expect(valueScores[0]?.textContent?.trim()).toBe(formatScore("0.00"));
    expect(valueScores[1]?.textContent?.trim()).toBe("—");
  });
});

describe("ComparisonTable structure and accessibility", () => {
  it("is a native table with scoped headers, links and remove buttons", () => {
    const onRemove = vi.fn();
    const table = renderTable([column("AAA"), column("BBB")], SUMMARY, onRemove);

    expect(table.tagName).toBe("TABLE");
    expect(table).toHaveAccessibleName(COMPARE.comparisonOf(2));
    for (const header of within(table).getAllByRole("columnheader")) {
      expect(header.getAttribute("scope")).toBe("col");
    }
    for (const header of within(table).getAllByRole("rowheader")) {
      expect(header.getAttribute("scope")).toBe("row");
    }
    const link = within(table).getByRole("link", { name: "AAA" });
    expect(link).toHaveAttribute("href", "/research/stocks/AAA");
    expect(within(table).getByText("AAA Inc")).toBeInTheDocument();
    expect(
      within(table).getByRole("button", { name: COMPARE.removeFromComparison("BBB") }),
    ).toBeInTheDocument();
  });

  it("calls onRemove with the symbol", async () => {
    const onRemove = vi.fn();
    const table = renderTable([column("AAA"), column("BBB")], SUMMARY, onRemove);

    await userEvent.click(
      within(table).getByRole("button", { name: COMPARE.removeFromComparison("BBB") }),
    );

    expect(onRemove).toHaveBeenCalledWith("BBB");
  });

  it("orders groups and rows as UX 1.5 does", () => {
    const table = renderTable([column("AAA"), column("BBB")]);

    const names = within(table)
      .getAllByRole("row")
      .map((row) => row.querySelector("th")?.textContent ?? "")
      .filter((text) => text.length > 0);
    const expected = [
      "Value",
      COMPARE.percentile,
      COMPARE.standardisedScore,
      COMPARE.inputLabels.book_to_price,
      COMPARE.inputLabels.earnings_yield,
      COMPARE.inputLabels.fcf_yield,
      "Growth",
      COMPARE.percentile,
      COMPARE.standardisedScore,
      COMPARE.inputLabels.revenue_growth,
      COMPARE.inputLabels.eps_growth,
      "Momentum",
      COMPARE.percentile,
      COMPARE.standardisedScore,
      COMPARE.inputLabels.return_3m,
      COMPARE.inputLabels.return_6m,
      COMPARE.inputLabels.return_12m,
    ];
    const rows = names.slice(names.findIndex((name) => name === "Value"));
    expect(rows.map((name, index) => name.startsWith(expected[index] as string))).not.toContain(
      false,
    );
    expect(rows).toHaveLength(expected.length);
  });

  it("marks restated value and growth percentiles and backfilled inputs, never momentum", () => {
    const restated = column("AAA", {
      factors: {
        value: scored("72.4", "0.61", true),
        growth: scored("40.2", "-0.10", true),
        momentum: scored("90.9", "1.25", true),
      },
      inputs: allInputs().map((row) =>
        row.inputName === "book_to_price" ? { ...row, restatedPossible: true } : row,
      ),
    });
    const table = renderTable([restated, column("BBB")]);

    const percentileRows = within(table)
      .getAllByRole("row")
      .filter((row) =>
        within(row).queryAllByRole("rowheader")[0]?.textContent?.startsWith(COMPARE.percentile),
      );
    expect(
      within(percentileRows[0] as HTMLElement).getByText(CELL.possiblyRestated),
    ).toBeInTheDocument();
    expect(
      within(percentileRows[1] as HTMLElement).getByText(CELL.possiblyRestated),
    ).toBeInTheDocument();
    expect(within(percentileRows[2] as HTMLElement).queryByText(CELL.possiblyRestated)).toBeNull();
    expect(
      within(cellAt(table, COMPARE.inputLabels.book_to_price, 0)).getByText(CELL.possiblyRestated),
    ).toBeInTheDocument();
    expect(table.innerHTML).not.toMatch(/text-gain|text-loss|bg-gain|bg-loss/);
  });
});

describe("ComparisonTable dates disclosure (DEC-0078)", () => {
  const toggleName = COMPARE.showDatesFor("book-to-price");

  it("opens and closes by click, Enter and Space with unconverted dates", async () => {
    const user = userEvent.setup();
    const table = renderTable([column("AAA"), column("BBB")]);
    const toggle = within(table).getByRole("button", { name: toggleName });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(table.textContent).not.toContain("2026-10-14");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const cell = cellAt(table, COMPARE.inputLabels.book_to_price, 0);
    expect(cell).toHaveTextContent("2025-06-27");
    expect(cell).toHaveTextContent("2026-10-14");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    toggle.focus();
    await user.keyboard("{Enter}");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Enter}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.keyboard(" ");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("shows em dashes for both dates of a column with no input row", async () => {
    const retired = column("OLD", { lifecycle: "retired", inputs: [] });
    const table = renderTable([column("AAA"), retired]);

    await userEvent.click(within(table).getByRole("button", { name: toggleName }));

    const cell = cellAt(table, COMPARE.inputLabels.book_to_price, 1);
    expect(cell.textContent?.match(/—/g)).toHaveLength(3);
    expect(cell.textContent).not.toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it("gives the percentile and score rows no disclosure", () => {
    const table = renderTable([column("AAA"), column("BBB")]);

    for (const name of [COMPARE.percentile, COMPARE.standardisedScore]) {
      const row = within(table)
        .getAllByRole("row")
        .find((candidate) =>
          within(candidate).queryAllByRole("rowheader")[0]?.textContent?.startsWith(name),
        );
      expect(within(row as HTMLElement).queryByRole("button")).toBeNull();
    }
  });
});

describe("ComparisonTable row and corner headers", () => {
  it("names the factor of every percentile and score row, and the label column", () => {
    const table = renderTable([column("AAA"), column("BBB")]);

    const names = within(table)
      .getAllByRole("rowheader")
      .map((header) => header.textContent ?? "");
    expect(names.filter((name) => name === `${COMPARE.percentile}, Growth`)).toHaveLength(1);
    expect(names.filter((name) => name === `${COMPARE.standardisedScore}, Momentum`)).toHaveLength(
      1,
    );
    expect(within(table).getByRole("columnheader", { name: COMPARE.measure })).toBeInTheDocument();
  });

  it("does not print a score under a cell that is not classified, even with a percentile", () => {
    const stale: FactorCell = { ...NONE, score: "0.30", percentile: "40" };
    const table = renderTable([
      column("AAA", { factors: { ...column("AAA").factors, value: stale } }),
    ]);

    const scoreRow = within(table)
      .getAllByRole("row")
      .find((row) =>
        within(row)
          .queryAllByRole("rowheader")[0]
          ?.textContent?.startsWith(COMPARE.standardisedScore),
      );
    expect(
      within(scoreRow as HTMLElement)
        .getAllByRole("cell")[0]
        ?.textContent?.trim(),
    ).toBe("—");
  });

  it("does not print a score under a cell whose percentile is missing", () => {
    const orphan: FactorCell = { ...NONE, status: "classified", score: "0.30" };
    const table = renderTable([
      column("AAA", { factors: { ...column("AAA").factors, value: orphan } }),
    ]);

    const scoreRow = within(table)
      .getAllByRole("row")
      .find((row) =>
        within(row)
          .queryAllByRole("rowheader")[0]
          ?.textContent?.startsWith(COMPARE.standardisedScore),
      );
    expect(
      within(scoreRow as HTMLElement)
        .getAllByRole("cell")[0]
        ?.textContent?.trim(),
    ).toBe("—");
  });
});

describe("ComparisonTable cells that hold a score the cell must not print", () => {
  it("prints an em dash for a retired or unranked cell even when the wire carries a score", () => {
    const retiredWithScore: FactorCell = {
      ...NONE,
      status: "classified",
      reasonCode: "retired",
      percentile: "55",
      score: "0.30",
    };
    const unrankedWithScore: FactorCell = {
      ...NONE,
      status: "classified",
      reasonCode: "not_enough_stocks",
      score: "0.30",
    };
    const incompleteWithScore: FactorCell = { ...NONE, reasonCode: "input_missing", score: "0.30" };
    const table = renderTable([
      column("AAA", {
        factors: { ...column("AAA").factors, value: retiredWithScore, growth: unrankedWithScore },
      }),
      column("BBB", { factors: { ...column("BBB").factors, momentum: incompleteWithScore } }),
    ]);

    const scoreRows = within(table)
      .getAllByRole("row")
      .filter((row) =>
        within(row)
          .queryAllByRole("rowheader")[0]
          ?.textContent?.startsWith(COMPARE.standardisedScore),
      );
    expect(
      within(scoreRows[0] as HTMLElement)
        .getAllByRole("cell")[0]
        ?.textContent?.trim(),
    ).toBe("—");
    expect(
      within(scoreRows[1] as HTMLElement)
        .getAllByRole("cell")[0]
        ?.textContent?.trim(),
    ).toBe("—");
    expect(
      within(scoreRows[2] as HTMLElement)
        .getAllByRole("cell")[0]
        ?.textContent?.trim(),
    ).toBe(formatScore("1.25"));
    expect(
      within(scoreRows[2] as HTMLElement)
        .getAllByRole("cell")[1]
        ?.textContent?.trim(),
    ).toBe("—");
  });

  it("makes the scrolling region keyboard-focusable and each header focusable by script only", () => {
    const table = renderTable([column("AAA"), column("BBB")]);

    expect(table.closest("section")).toHaveAttribute("tabindex", "0");
    for (const header of table.querySelectorAll("th[data-symbol]")) {
      expect(header).toHaveAttribute("tabindex", "-1");
    }
  });

  it("spans each group header across the label column and every stock column", () => {
    const table = renderTable([column("AAA"), column("BBB"), column("CCC")]);

    const group = within(table).getByRole("rowheader", { name: "Value" });
    expect(group).toHaveAttribute("colspan", "4");
  });
});
