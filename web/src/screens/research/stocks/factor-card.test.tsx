import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { FactorCell, FactorName, InputRow } from "../../../api/classification-types";
import { CELL, EVIDENCE, INPUT_STATUS, SHELL_ROUTES } from "../copy";
import FactorCard, { cardShowsMark } from "./factor-card";

function cell(overrides: Partial<FactorCell> = {}): FactorCell {
  return {
    status: "classified",
    score: "0.58",
    percentile: "72.00",
    reasonCode: null,
    reasonInput: null,
    reasonDetail: null,
    restatedPossible: false,
    ...overrides,
  };
}

function input(overrides: Partial<InputRow> = {}): InputRow {
  return {
    factor: "value",
    inputName: "book_to_price",
    label: "book-to-price",
    status: "present",
    value: "0.4231",
    asOf: "2026-06-30",
    knownOn: "2026-10-14",
    restatedPossible: false,
    detail: {},
    ...overrides,
  };
}

interface CardProps {
  factor?: FactorName;
  cell?: FactorCell;
  inputs?: InputRow[];
  lifecycle?: "active" | "retired";
}

function renderCard(props: CardProps = {}): HTMLElement {
  const factor = props.factor ?? "value";
  render(
    <MemoryRouter>
      <FactorCard
        factor={factor}
        symbol="KO"
        cell={props.cell ?? cell()}
        inputs={props.inputs ?? []}
        lifecycle={props.lifecycle ?? "active"}
        scoresDate="2026-10-15"
        latestTradingDay="2026-10-14"
      />
    </MemoryRouter>,
  );
  return screen.getByRole("region");
}

const NOT_FOUND = { last_acquisition: { outcome: "not_found" } };

describe("FactorCard — three-part statements", () => {
  // Implements TC-COMP-105
  it("names the period end, the 6-month rule against the scores' date and the next-download recovery for an outdated fundamental", () => {
    const card = renderCard({
      factor: "growth",
      cell: cell({
        status: "not_classified",
        score: null,
        percentile: null,
        reasonCode: "input_outdated",
        reasonInput: "revenue_growth",
      }),
      inputs: [
        input({
          factor: "growth",
          inputName: "revenue_growth",
          label: "revenue growth",
          status: "outdated",
          value: "0.0412",
          asOf: "2026-03-28",
        }),
      ],
    });
    expect(within(card).getByText("Incomplete").closest("[data-variant]")).toHaveAttribute(
      "data-variant",
      "coverage-absent",
    );
    expect(
      within(card).getByText(
        "Growth for KO couldn't be scored: its latest statement covers a quarter that ended more than 6 months before 2026-10-15.",
      ),
    ).toBeInTheDocument();
    expect(within(card).getByText("2026-03-28")).toBeInTheDocument();
    expect(within(card).getByText(EVIDENCE.nextDownloadRecovery)).toBeInTheDocument();
    expect(within(card).getByRole("link", { name: "Data health" })).toHaveAttribute(
      "href",
      SHELL_ROUTES.dataHealth,
    );
  });

  // Implements TC-COMP-106
  it("offers no recovery when the provider holds no data", () => {
    const card = renderCard({
      cell: cell({
        status: "not_classified",
        score: null,
        percentile: null,
        reasonCode: "input_missing",
        reasonInput: "fcf_yield",
      }),
      inputs: [
        input({
          inputName: "fcf_yield",
          label: "free-cash-flow yield",
          status: "missing",
          value: null,
          asOf: null,
          knownOn: null,
          detail: {
            last_acquisition: {
              data_type: "fundamentals",
              outcome: "not_found",
              acquired_at: "2026-10-15T06:00:00Z",
            },
          },
        }),
      ],
    });
    expect(
      within(card).getByText(
        "Value for KO couldn't be scored: the provider reports no free-cash-flow yield for KO.",
      ),
    ).toBeInTheDocument();
    expect(within(card).getByText(EVIDENCE.noActionChangesThis)).toBeInTheDocument();
    expect(within(card).queryByText(EVIDENCE.nextDownloadRecovery)).not.toBeInTheDocument();
    expect(within(card).queryByRole("link", { name: "Data health" })).not.toBeInTheDocument();
  });

  it.each([
    ["another outcome", { last_acquisition: { outcome: "failed" } }],
    ["no last_acquisition key", {}],
    ["a null detail", null],
    ["a non-object last_acquisition", { last_acquisition: "not_found" }],
    ["a null last_acquisition", { last_acquisition: null }],
    ["a non-string outcome", { last_acquisition: { outcome: 3 } }],
  ])("offers the next-download recovery for a missing input with %s", (_name, detail) => {
    const card = renderCard({
      cell: cell({
        status: "not_classified",
        score: null,
        percentile: null,
        reasonCode: "input_missing",
        reasonInput: "fcf_yield",
      }),
      inputs: [
        input({
          inputName: "fcf_yield",
          label: "free-cash-flow yield",
          status: "missing",
          value: null,
          detail,
        }),
      ],
    });
    expect(
      within(card).getByText("Value for KO couldn't be scored: free-cash-flow yield is missing."),
    ).toBeInTheDocument();
    expect(within(card).getByText(EVIDENCE.nextDownloadRecovery)).toBeInTheDocument();
    expect(within(card).getByRole("link", { name: "Data health" })).toBeInTheDocument();
    expect(within(card).queryByText(EVIDENCE.noActionChangesThis)).not.toBeInTheDocument();
  });

  it("does not treat a present input with a not_found outcome as the provider holding no data", () => {
    const card = renderCard({
      cell: cell({
        status: "not_classified",
        score: null,
        percentile: null,
        reasonCode: "input_missing",
        reasonInput: "fcf_yield",
      }),
      inputs: [
        input({
          inputName: "fcf_yield",
          label: "free-cash-flow yield",
          status: "outdated",
          detail: NOT_FOUND,
        }),
      ],
    });
    expect(within(card).queryByText(EVIDENCE.noActionChangesThis)).not.toBeInTheDocument();
  });

  it.each([
    ["momentum", "return_6m", "6-month return", "2026-09-14", "Momentum"],
    ["value", "book_to_price", "book-to-price", "2026-06-30", "Value"],
  ] as const)(
    "reads the price sentence with the latest trading day for an outdated %s input",
    (factor, inputName, label, asOf, factorName) => {
      const card = renderCard({
        factor,
        cell: cell({
          status: "not_classified",
          score: null,
          percentile: null,
          reasonCode: "input_outdated",
          reasonInput: inputName,
        }),
        inputs: [input({ factor, inputName, label, status: "outdated", asOf })],
      });
      const sentence = `${factorName} for KO couldn't be scored: its latest price is not from the latest trading day, 2026-10-14.`;
      expect(within(card).getByText(sentence)).toBeInTheDocument();
      expect(within(card).getByText(sentence).textContent).not.toContain(asOf);
      expect(within(card).getByText(sentence).textContent).not.toContain("2026-10-15");
      // The input's own date still shows in its row.
      expect(within(card).getByText(asOf)).toBeInTheDocument();
      expect(within(card).getByText(EVIDENCE.nextDownloadRecovery)).toBeInTheDocument();
      expect(within(card).getByRole("link", { name: "Data health" })).toBeInTheDocument();
    },
  );

  it.each([
    ["exactly 6 months before the scores' date is not older than the rule", "2026-04-15", false],
    ["one day older than 6 months reads the fundamentals sentence", "2026-04-14", true],
  ])("%s", (_name, asOf, fundamentals) => {
    const card = renderCard({
      factor: "growth",
      cell: cell({
        status: "not_classified",
        score: null,
        percentile: null,
        reasonCode: "input_outdated",
        reasonInput: "eps_growth",
      }),
      inputs: [
        input({
          factor: "growth",
          inputName: "eps_growth",
          label: "EPS growth",
          status: "outdated",
          asOf,
        }),
      ],
    });
    const text = card.textContent ?? "";
    expect(text.includes("ended more than 6 months before")).toBe(fundamentals);
    expect(text.includes("not from the latest trading day")).toBe(!fundamentals);
  });

  it.each([
    ["2026-10-15", "2026-04-15", "2026-04-14"],
    ["2026-08-31", "2026-02-28", "2026-02-27"],
    ["2028-08-31", "2028-02-29", "2028-02-28"],
    ["2026-03-31", "2025-09-30", "2025-09-29"],
    ["2026-01-31", "2025-07-31", "2025-07-30"],
    ["2026-12-01", "2026-06-01", "2026-05-31"],
    ["2026-06-30", "2025-12-30", "2025-12-29"],
  ])(
    "subtracts 6 months from %s, the day clamped to the month's end: %s is not older, %s is",
    (scoresDate, cutoff, older) => {
      const outcome = (asOf: string): string => {
        const { unmount } = render(
          <MemoryRouter>
            <FactorCard
              factor="growth"
              symbol="KO"
              cell={cell({
                status: "not_classified",
                score: null,
                percentile: null,
                reasonCode: "input_outdated",
                reasonInput: "eps_growth",
              })}
              inputs={[
                input({
                  factor: "growth",
                  inputName: "eps_growth",
                  label: "EPS growth",
                  status: "outdated",
                  asOf,
                }),
              ]}
              lifecycle="active"
              scoresDate={scoresDate}
              latestTradingDay="2026-10-14"
            />
          </MemoryRouter>,
        );
        const text = screen.getByRole("region").textContent ?? "";
        unmount();
        return text;
      };
      expect(outcome(cutoff)).toContain("not from the latest trading day");
      expect(outcome(older)).toContain(`ended more than 6 months before ${scoresDate}`);
    },
  );

  it("states a not_computable factor's reason detail and names the input, with no recovery line", () => {
    const card = renderCard({
      cell: cell({
        status: "not_classified",
        score: null,
        percentile: null,
        reasonCode: "input_not_computable",
        reasonInput: "book_to_price",
        reasonDetail: "book value is negative",
      }),
      inputs: [input({ status: "not_computable", value: null })],
    });
    expect(
      within(card).getByText(
        "Value for KO couldn't be scored: book-to-price couldn't be computed (book value is negative).",
      ),
    ).toBeInTheDocument();
    expect(within(card).queryByText(EVIDENCE.nextDownloadRecovery)).not.toBeInTheDocument();
    expect(within(card).queryByText(EVIDENCE.noActionChangesThis)).not.toBeInTheDocument();
    expect(within(card).queryByRole("link", { name: "Data health" })).not.toBeInTheDocument();
  });

  it("never prints the input's payload key", () => {
    const card = renderCard({
      cell: cell({
        status: "not_classified",
        score: null,
        percentile: null,
        reasonCode: "input_missing",
        reasonInput: "fcf_yield",
      }),
      inputs: [
        input({
          inputName: "fcf_yield",
          label: "free-cash-flow yield",
          status: "missing",
          value: null,
        }),
      ],
    });
    expect(card.textContent).not.toContain("fcf_yield");
  });
});

describe("FactorCard — input list", () => {
  it("renders a description list with the label as the term and the value only for a present input", () => {
    const card = renderCard({ inputs: [input()] });
    const term = within(card).getByText("book-to-price");
    expect(term.tagName).toBe("DT");
    expect(term.closest("dl")).not.toBeNull();
    expect(within(card).getByText("0.42")).toBeInTheDocument();
    expect(within(card).queryByText(INPUT_STATUS.missing)).not.toBeInTheDocument();
    expect(within(card).queryByText(INPUT_STATUS.outdated)).not.toBeInTheDocument();
  });

  it("shows As of and Known on as unconverted wire dates in the numeric face, an em dash where null", () => {
    const card = renderCard({
      inputs: [
        input(),
        input({ inputName: "earnings_yield", label: "earnings yield", knownOn: null }),
      ],
    });
    expect(within(card).getAllByText(EVIDENCE.asOf)).toHaveLength(2);
    expect(within(card).getAllByText(EVIDENCE.knownOn)).toHaveLength(2);
    expect(within(card).getByText("2026-10-14")).toHaveClass("font-numeric");
    expect(within(card).getAllByText("2026-06-30")[0]).toHaveClass("font-numeric");
    const second = within(card).getByText("earnings yield").closest("div") as HTMLElement;
    expect(within(second).getByText(EVIDENCE.knownOn).nextElementSibling).toHaveTextContent(
      CELL.absentValue,
    );
  });

  it("shows a missing input as an em dash with the Missing badge", () => {
    const card = renderCard({
      inputs: [input({ status: "missing", value: null, asOf: null, knownOn: null })],
    });
    const badge = within(card).getByText(INPUT_STATUS.missing).closest("[data-variant]");
    expect(badge).toHaveAttribute("data-variant", "coverage-absent");
    expect(card.querySelector("[data-testid='input-value']")).toHaveTextContent(CELL.absentValue);
    expect(card.querySelector("[data-testid='input-value']")).toHaveClass("text-value-missing");
  });

  it("shows an outdated input's value with the Outdated warning badge", () => {
    const card = renderCard({ inputs: [input({ status: "outdated", value: "0.5" })] });
    expect(within(card).getByText("0.50")).toBeInTheDocument();
    expect(within(card).getByText(INPUT_STATUS.outdated).closest("[data-variant]")).toHaveAttribute(
      "data-variant",
      "status-warning",
    );
  });

  it("shows a not_computable input as plain warning text with an aria-hidden triangle", () => {
    const card = renderCard({ inputs: [input({ status: "not_computable", value: null })] });
    const word = within(card).getByText(INPUT_STATUS.not_computable);
    expect(word.closest("[data-variant]")).toBeNull();
    expect(word).toHaveClass("text-status-warning");
    expect(word.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it.each([
    ["book_to_price", "value", "0.4231", "0.42"],
    ["earnings_yield", "value", "0.0512", "0.05"],
    ["fcf_yield", "value", "-0.0301", "-0.03"],
    ["revenue_growth", "growth", "0.0412", "+4.12%"],
    ["eps_growth", "growth", "-0.1", "-10.00%"],
    ["return_3m", "momentum", "0.05", "+5.00%"],
    ["return_6m", "momentum", "0.05", "+5.00%"],
    ["return_12m", "momentum", "0.05", "+5.00%"],
  ] as const)("formats %s through the shared formatters", (inputName, factor, value, printed) => {
    const card = renderCard({
      factor,
      inputs: [input({ factor, inputName, label: inputName, value })],
    });
    expect(within(card).getByText(printed)).toBeInTheDocument();
  });

  it("renders a measured zero as 0.00, not blank", () => {
    const card = renderCard({ inputs: [input({ value: "0.0000" })] });
    expect(within(card).getByText("0.00")).toBeInTheDocument();
  });

  it("draws the restated mark on a restated value row and never on a momentum row", () => {
    const value = renderCard({ inputs: [input({ restatedPossible: true })] });
    expect(within(value).getByText(CELL.possiblyRestated)).toBeInTheDocument();
    document.body.innerHTML = "";
    const momentum = renderCard({
      factor: "momentum",
      inputs: [input({ factor: "momentum", inputName: "return_3m", restatedPossible: true })],
    });
    expect(within(momentum).queryByText(CELL.possiblyRestated)).not.toBeInTheDocument();
  });

  it("uses no gain or loss class on a value", () => {
    const card = renderCard({ inputs: [input({ value: "-0.5" })] });
    expect(card.innerHTML).not.toMatch(/\b(?:text|bg)-(?:gain|loss)\b/);
  });
});

describe("FactorCard — card states", () => {
  it("renders the factor cell with the standardised score beneath it for a classified factor", () => {
    const card = renderCard({ cell: cell({ percentile: "88.00", score: "-0.44" }) });
    expect(within(card).getByTestId("factor-percentile")).toHaveTextContent("88");
    const score = within(card).getByTestId("card-score");
    expect(score).toHaveTextContent("-0.44");
    expect(score).toHaveClass("text-muted-foreground");
  });

  it("renders Not enough to rank with the reason detail and keeps the per-input statuses", () => {
    const card = renderCard({
      cell: cell({
        status: "not_classified",
        score: null,
        percentile: null,
        reasonCode: "not_enough_stocks",
        reasonDetail: "18 of 30 stocks qualified",
      }),
      inputs: [
        input({
          inputName: "fcf_yield",
          label: "free-cash-flow yield",
          status: "outdated",
          value: "0.03",
        }),
        input({ status: "missing", value: null }),
      ],
    });
    expect(within(card).getByText(CELL.notEnoughToRank).closest("[data-variant]")).toHaveAttribute(
      "data-variant",
      "coverage-unknown",
    );
    expect(
      within(card).getByText(
        "Only 18 of 30 stocks qualified on value in this set, so no stock was ranked on it.",
      ),
    ).toBeInTheDocument();
    expect(within(card).queryByText(CELL.incomplete)).not.toBeInTheDocument();
    expect(within(card).queryByText(/couldn't be scored/)).not.toBeInTheDocument();
    expect(within(card).getByText(INPUT_STATUS.outdated)).toBeInTheDocument();
    expect(within(card).getByText("0.03")).toBeInTheDocument();
    expect(within(card).getByText(INPUT_STATUS.missing)).toBeInTheDocument();
  });

  it("renders a retired stock as Not followed with no date and no input list", () => {
    const card = renderCard({
      lifecycle: "retired",
      cell: cell({
        status: "not_classified",
        score: null,
        percentile: null,
        reasonCode: "retired",
      }),
      inputs: [input()],
    });
    expect(within(card).getByText(CELL.notFollowed).closest("[data-variant]")).toHaveAttribute(
      "data-variant",
      "status-neutral",
    );
    expect(within(card).getByText(CELL.notFollowedNoDate)).toBeInTheDocument();
    expect(card.querySelector("dl")).toBeNull();
    expect(within(card).queryByText(CELL.incomplete)).not.toBeInTheDocument();
  });

  it("is a section labelled by an h2 with the factor name and an aria-hidden swatch", () => {
    const card = renderCard({ factor: "growth" });
    const heading = within(card).getByRole("heading", { level: 2, name: "Growth" });
    expect(card).toHaveAttribute("aria-labelledby", heading.id);
    const swatch = within(heading).getByTestId("factor-swatch");
    expect(swatch).toHaveAttribute("aria-hidden", "true");
    expect(swatch).toHaveStyle({ background: "hsl(var(--factor-growth))" });
  });
});

describe("FactorCard — retired and unranked edges", () => {
  it("reads a retired stock's incomplete cell as Not followed too, with no statement or input list", () => {
    const card = renderCard({
      lifecycle: "retired",
      cell: cell({
        status: "not_classified",
        score: null,
        percentile: null,
        reasonCode: "input_missing",
        reasonInput: "book_to_price",
      }),
      inputs: [input({ status: "missing", value: null })],
    });
    expect(within(card).getByText(CELL.notFollowedNoDate)).toBeInTheDocument();
    expect(within(card).queryByText(/couldn't be scored/)).not.toBeInTheDocument();
    expect(card.querySelector("dl")).toBeNull();
  });

  it("prints no standardised score for a classified cell without one or an unclassified cell with one", () => {
    const noScore = renderCard({ cell: cell({ score: null }) });
    expect(within(noScore).queryByTestId("card-score")).not.toBeInTheDocument();
    document.body.innerHTML = "";
    const unclassified = renderCard({
      cell: cell({ status: "not_classified", score: "0.10", reasonCode: "input_missing" }),
    });
    expect(within(unclassified).queryByTestId("card-score")).not.toBeInTheDocument();
  });

  it("prints no sentence for Not enough to rank when the engine sent no reason detail", () => {
    const card = renderCard({
      cell: cell({
        status: "not_classified",
        score: null,
        percentile: null,
        reasonCode: "not_enough_stocks",
        reasonDetail: null,
      }),
    });
    expect(within(card).getByText(CELL.notEnoughToRank)).toBeInTheDocument();
    expect(card.querySelector("p")).toBeNull();
  });
});

describe("FactorCard — statement edges", () => {
  const outdated = (factor: FactorName, inputName: string, asOf: string | null): CardProps => ({
    factor,
    cell: cell({
      status: "not_classified",
      score: null,
      percentile: null,
      reasonCode: "input_outdated",
      reasonInput: inputName,
    }),
    inputs: [input({ factor, inputName, label: inputName, status: "outdated", asOf })],
  });

  it("reads the price sentence for a momentum input even when its as-of is older than the rule", () => {
    const card = renderCard(outdated("momentum", "return_6m", "2026-01-01"));
    expect(card.textContent).toContain("not from the latest trading day, 2026-10-14");
    expect(card.textContent).not.toContain("ended more than 6 months");
  });

  it("reads the price sentence for an outdated input with no as-of date", () => {
    const card = renderCard(outdated("value", "book_to_price", null));
    expect(card.textContent).toContain("not from the latest trading day, 2026-10-14");
  });

  it("names a generic input when the cell's reason input matches no row", () => {
    const missingRow = renderCard({
      cell: cell({
        status: "not_classified",
        score: null,
        percentile: null,
        reasonCode: "input_missing",
        reasonInput: "fcf_yield",
      }),
      inputs: [],
    });
    expect(missingRow.textContent).toContain(
      "Value for KO couldn't be scored: an input is missing.",
    );
    document.body.innerHTML = "";
    const noInput = renderCard({
      cell: cell({
        status: "not_classified",
        score: null,
        percentile: null,
        reasonCode: "input_missing",
        reasonInput: null,
      }),
      inputs: [input({ status: "missing", value: null })],
    });
    expect(noInput.textContent).toContain("an input is missing");
  });

  it("states a not_computable factor without parentheses when the engine sent no detail", () => {
    const card = renderCard({
      cell: cell({
        status: "not_classified",
        score: null,
        percentile: null,
        reasonCode: "input_not_computable",
        reasonInput: "book_to_price",
        reasonDetail: null,
      }),
      inputs: [input({ status: "not_computable", value: null })],
    });
    expect(card.textContent).toContain(
      "Value for KO couldn't be scored: book-to-price couldn't be computed.",
    );
    expect(card.textContent).not.toContain("()");
  });

  it("prints no reason detail for a retired stock and no score under Not enough to rank", () => {
    const retired = renderCard({
      lifecycle: "retired",
      cell: cell({
        status: "not_classified",
        score: null,
        percentile: null,
        reasonCode: "not_enough_stocks",
        reasonDetail: "18 of 30 stocks qualified",
      }),
    });
    expect(retired.textContent).not.toContain("18 of 30");
    document.body.innerHTML = "";
    const unranked = renderCard({
      cell: cell({ reasonCode: "not_enough_stocks", reasonDetail: "18 of 30 stocks qualified" }),
    });
    expect(within(unranked).queryByTestId("card-score")).not.toBeInTheDocument();
  });
});

describe("cardShowsMark", () => {
  const restatedCell = cell({ restatedPossible: true });
  const restatedInput = input({ restatedPossible: true });

  it("is true for a scored restated value cell and for a restated input row", () => {
    expect(cardShowsMark("value", restatedCell, [], "active")).toBe(true);
    expect(cardShowsMark("growth", cell(), [restatedInput], "active")).toBe(true);
  });

  it("is false for a factor with no restated cell or input", () => {
    expect(cardShowsMark("value", cell(), [input()], "active")).toBe(false);
  });

  it("is false on momentum even when the wire says restated", () => {
    expect(cardShowsMark("momentum", restatedCell, [restatedInput], "active")).toBe(false);
  });

  it("is false for an unscored or unranked restated cell", () => {
    const unscored = cell({ status: "not_classified", percentile: null, restatedPossible: true });
    expect(cardShowsMark("value", unscored, [], "active")).toBe(false);
    const unranked = cell({ reasonCode: "not_enough_stocks", restatedPossible: true });
    expect(cardShowsMark("value", unranked, [], "active")).toBe(false);
  });

  it("is false for a retired stock, whose card shows neither cell mark nor input rows", () => {
    expect(cardShowsMark("value", restatedCell, [restatedInput], "retired")).toBe(false);
    const retiredCell = cell({ reasonCode: "retired", restatedPossible: true });
    expect(cardShowsMark("value", retiredCell, [restatedInput], "active")).toBe(false);
  });
});

describe("FactorCard — review v1 rework", () => {
  const missingFcf = cell({
    status: "not_classified",
    score: null,
    percentile: null,
    reasonCode: "input_missing",
    reasonInput: "fcf_yield",
  });
  const valueRows = [
    input(),
    input({ inputName: "earnings_yield", label: "earnings yield", value: "0.0512" }),
    input({
      inputName: "fcf_yield",
      label: "free-cash-flow yield",
      status: "missing",
      value: null,
      asOf: null,
      knownOn: null,
      detail: { last_acquisition: { outcome: "not_found" } },
    }),
  ];

  // IR-002: the reason input is the third row of a realistic value card.
  it("names the cell's reason input, not another row, in a multi-row card", () => {
    const card = renderCard({ cell: missingFcf, inputs: valueRows });
    expect(
      within(card).getByText(
        "Value for KO couldn't be scored: the provider reports no free-cash-flow yield for KO.",
      ),
    ).toBeInTheDocument();
    expect(within(card).queryByText(/the provider reports no book-to-price/)).toBeNull();
    expect(within(card).queryByText(/the provider reports no earnings yield/)).toBeNull();
  });

  it("names a missing reason input that is not first, and the recovery that goes with its own detail", () => {
    const rows = [
      input(),
      input({ inputName: "earnings_yield", label: "earnings yield", value: "0.0512" }),
      input({
        inputName: "fcf_yield",
        label: "free-cash-flow yield",
        status: "missing",
        value: null,
        detail: {},
      }),
    ];
    const card = renderCard({ cell: missingFcf, inputs: rows });
    expect(
      within(card).getByText("Value for KO couldn't be scored: free-cash-flow yield is missing."),
    ).toBeInTheDocument();
    expect(within(card).getByText(EVIDENCE.nextDownloadRecovery)).toBeInTheDocument();
  });

  // IR-003: a stock retired after its set was built arrives with its last active cells.
  it("reads a lifecycle-retired stock's incomplete cell as Not followed, never Incomplete", () => {
    const card = renderCard({
      lifecycle: "retired",
      cell: missingFcf,
      inputs: valueRows,
    });
    expect(within(card).getByText(CELL.notFollowed).closest("[data-variant]")).toHaveAttribute(
      "data-variant",
      "status-neutral",
    );
    expect(within(card).queryByText(CELL.incomplete)).not.toBeInTheDocument();
  });

  it("prints no standardised score for a lifecycle-retired stock's classified cell", () => {
    const card = renderCard({
      lifecycle: "retired",
      cell: cell({ percentile: "88.00", score: "-0.44" }),
      inputs: [input()],
    });
    expect(within(card).queryByTestId("card-score")).not.toBeInTheDocument();
    expect(within(card).queryByTestId("factor-percentile")).not.toBeInTheDocument();
    expect(within(card).getByText(CELL.notFollowed)).toBeInTheDocument();
    expect(within(card).getByText(CELL.notFollowedNoDate)).toBeInTheDocument();
  });
});
