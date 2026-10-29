import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
  FactorCell as FactorCellData,
  FactorName,
  ReasonCode,
} from "../../api/classification-types";
import { PresenceBadge } from "../../screens/coverage/badges";
import { CELL } from "../../screens/research/copy";
import { formatPercentile, formatScore } from "../../screens/research/format";
import { FactorCell } from "./factor-cell";

/** A `FactorCell` response value (classification-api section 2.7) with the unused fields null and false. */
function cell(overrides: Partial<FactorCellData>): FactorCellData {
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

function scored(percentile: string, overrides: Partial<FactorCellData> = {}): FactorCellData {
  return cell({ status: "classified", percentile, ...overrides });
}

interface CellProps {
  cell: FactorCellData;
  factor?: FactorName;
  showScore?: boolean;
  notFollowedSince?: string | null;
}

function renderCell({ cell: data, factor = "value", ...rest }: CellProps): HTMLElement {
  const { container } = render(<FactorCell cell={data} factor={factor} {...rest} />);
  return container.firstElementChild as HTMLElement;
}

/** The visible words: the text with `aria-hidden` descendants dropped. */
function label(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  for (const hidden of clone.querySelectorAll("[aria-hidden='true']")) {
    hidden.remove();
  }
  return (clone.textContent ?? "").trim();
}

/** Word plus shape: the bar, or the icon's child tags and fills, or the glyph. */
function signature(element: Element): string {
  if (element.querySelector("[data-testid='factor-bar']")) {
    return `${label(element)}|bar`;
  }
  const svg = element.querySelector("svg");
  const shape = svg
    ? Array.from(svg.children)
        .map((child) => `${child.tagName.toLowerCase()}:${child.getAttribute("fill") ?? ""}`)
        .join(",")
    : (element.querySelector("[aria-hidden='true']")?.textContent ?? "");
  return `${label(element)}|${shape}`;
}

/** An `aria-hidden` icon or glyph. */
function shape(element: Element): Element | null {
  const svg = element.querySelector("svg[aria-hidden='true']");
  const glyph = Array.from(element.querySelectorAll("[aria-hidden='true']")).find(
    (candidate) => (candidate.textContent ?? "").trim() !== "",
  );
  return svg ?? glyph ?? null;
}

const bar = (element: Element): HTMLElement | null =>
  element.querySelector("[data-testid='factor-bar']");
const fill = (element: Element): HTMLElement => bar(element)?.firstElementChild as HTMLElement;
const percentileText = (element: Element): string | null =>
  element.querySelector("[data-testid='factor-percentile']")?.textContent ?? null;
const scoreElement = (element: Element): HTMLElement | null =>
  element.querySelector("[data-testid='factor-score']");
/** The mark roots: the spans reading Possibly restated that carry their own `aria-hidden` glyph. */
const marks = (element: Element): Element[] =>
  Array.from(element.querySelectorAll("span")).filter(
    (candidate) =>
      label(candidate) === CELL.possiblyRestated &&
      candidate.querySelector("[aria-hidden='true']") !== null,
  );
const mark = (element: Element): Element | null => marks(element)[0] ?? null;

const ZERO = "0.0000000000";
const UNKNOWN_REASON = "not_a_reason" as unknown as ReasonCode;

const INCOMPLETE = { word: "Incomplete", variant: "coverage-absent" };
const NOT_ENOUGH = { word: "Not enough to rank", variant: "coverage-unknown" };
const NOT_FOLLOWED = { word: "Not followed", variant: "status-neutral" };

const UNSCORED: { name: string; data: FactorCellData; word: string; variant: string }[] = [
  ...(["input_missing", "input_outdated", "input_not_computable"] as const).flatMap((code) => [
    { name: `${code} without detail`, data: cell({ reasonCode: code }), ...INCOMPLETE },
    {
      name: `${code} with detail`,
      data: cell({ reasonCode: code, reasonDetail: "operating cash flow missing" }),
      ...INCOMPLETE,
    },
  ]),
  { name: "not_enough_stocks", data: cell({ reasonCode: "not_enough_stocks" }), ...NOT_ENOUGH },
  { name: "retired", data: cell({ reasonCode: "retired" }), ...NOT_FOLLOWED },
  {
    name: "classified with a null percentile",
    data: cell({ status: "classified", percentile: null }),
    ...INCOMPLETE,
  },
];

// Implements TC-COMP-073: DAC-E4-S3-1, DAC-E4-1, AC-12, AC-14.
describe("TC-COMP-073: an unscored factor never shows 0 or a bare number", () => {
  describe.each(UNSCORED)("$name", ({ data, word, variant }) => {
    it("holds no digit, sign or placeholder anywhere in its text", () => {
      const root = renderCell({ cell: data });
      const text = root.textContent ?? "";
      expect(text).not.toMatch(/[0-9]/);
      expect(text).not.toMatch(/NaN|null|undefined|[-+]/);
    });

    it("has no bar", () => {
      expect(bar(renderCell({ cell: data }))).toBeNull();
    });

    it(`reads exactly ${word} as a ${variant} badge with a shape`, () => {
      const root = renderCell({ cell: data });
      expect(label(root)).toBe(word);
      expect(root).toHaveAttribute("data-variant", variant);
      expect(shape(root)).not.toBeNull();
    });
  });

  it("never reads the numbers an Incomplete cell carries", () => {
    const root = renderCell({
      cell: cell({ reasonCode: "input_missing", score: ZERO, percentile: ZERO }),
    });
    expect(label(root)).toBe("Incomplete");
    expect(root.textContent).not.toMatch(/[0-9]/);
    expect(bar(root)).toBeNull();
  });
});

// Implements TC-COMP-074: DAC-E4-S3-2, AC-9.
describe("TC-COMP-074: a measured 0.00 standardised score renders as 0.00", () => {
  const zeroScore = scored("50.0000000000", { score: ZERO });

  it("prints 0.00 beside the percentile 50 when the score is shown", () => {
    const root = renderCell({ cell: zeroScore, showScore: true });
    expect(scoreElement(root)?.textContent).toBe("0.00");
    expect(percentileText(root)).toBe("50");
    expect(label(root)).not.toContain("Incomplete");
  });

  it("prints the percentile only when the score is not asked for", () => {
    const root = renderCell({ cell: zeroScore });
    expect(scoreElement(root)).toBeNull();
    expect(label(root)).toBe("50");
  });

  it("renders a measured percentile of 0 as a scored cell with an empty bar", () => {
    const root = renderCell({ cell: scored(ZERO) });
    expect(label(root)).toBe("0");
    expect(root).not.toHaveAttribute("data-variant");
    expect(bar(root)).not.toBeNull();
    expect(fill(root).style.width).toBe("0%");
  });

  it.each([
    ["1.2700000000", "+1.27"],
    ["-0.4500000000", "-0.45"],
  ])("prints the score %s as %s through formatScore", (score, printed) => {
    const root = renderCell({ cell: scored("60.0000000000", { score }), showScore: true });
    expect(scoreElement(root)?.textContent).toBe(printed);
    expect(scoreElement(root)?.textContent).toBe(formatScore(score));
  });
});

// Implements TC-COMP-097 (cell half): DAC-E4-S3-3, AC-12.
describe("TC-COMP-097: the Possibly restated mark rides the percentile on value and growth", () => {
  const restated = scored("88.0000000000", { restatedPossible: true });

  it.each<FactorName>(["value", "growth"])(
    "shows exactly one mark after the number on %s",
    (factor) => {
      const root = renderCell({ cell: restated, factor });
      const found = marks(root);
      expect(found).toHaveLength(1);
      const number = root.querySelector("[data-testid='factor-percentile']") as Element;
      expect(
        number.compareDocumentPosition(found[0] as Element) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      expect(percentileText(root)).toBe("88");
    },
  );

  it("renders the percentile and no mark on momentum", () => {
    const root = renderCell({ cell: restated, factor: "momentum" });
    expect(percentileText(root)).toBe("88");
    expect(mark(root)).toBeNull();
  });

  it("renders no mark when the cell does not carry it", () => {
    expect(mark(renderCell({ cell: scored("88.0000000000") }))).toBeNull();
  });

  it.each([
    ["Incomplete", cell({ reasonCode: "input_missing", restatedPossible: true })],
    ["Not enough to rank", cell({ reasonCode: "not_enough_stocks", restatedPossible: true })],
    ["Not followed", cell({ reasonCode: "retired", restatedPossible: true })],
  ])("renders no mark on a %s cell, which has no percentile to ride", (word, data) => {
    const root = renderCell({ cell: data });
    expect(label(root)).toBe(word);
    expect(mark(root)).toBeNull();
  });

  it("never carries the explanation sentence", () => {
    const root = renderCell({ cell: restated, showScore: true });
    expect(root.outerHTML).not.toContain(CELL.restatedExplanation);
  });
});

const FOUR_STATES: [string, FactorCellData][] = [
  ["scored", scored("88.0000000000")],
  ["Incomplete", cell({ reasonCode: "input_missing" })],
  ["Not enough to rank", cell({ reasonCode: "not_enough_stocks" })],
  ["Not followed", cell({ reasonCode: "retired" })],
];

// Implements TC-COMP-109: DAC-E4-S3-4, STD-UI-8, STD-UI-14, STD-UI-7, DEC-0060.
describe("TC-COMP-109: every status has a word plus a shape, and no polarity colour carries a value", () => {
  it.each(FOUR_STATES)("gives the %s cell visible words and a shape", (_name, data) => {
    const root = renderCell({ cell: data });
    expect(label(root)).not.toBe("");
    expect(bar(root) ?? shape(root)).not.toBeNull();
  });

  it("gives the four states pairwise distinct word-plus-shape signatures", () => {
    const signatures = FOUR_STATES.map(([, data]) => signature(renderCell({ cell: data })));
    expect(new Set(signatures).size).toBe(4);
  });

  it("draws Not enough to rank with the delivered unknown shape, and Not followed with its own", () => {
    const shapeOf = (element: Element): string => signature(element).split("|")[1] ?? "";
    const { container } = render(<PresenceBadge state="unknown" />);
    const deliveredUnknown = shapeOf(container.firstElementChild as Element);
    expect(deliveredUnknown).not.toBe("");
    expect(shapeOf(renderCell({ cell: cell({ reasonCode: "not_enough_stocks" }) }))).toBe(
      deliveredUnknown,
    );
    expect(shapeOf(renderCell({ cell: cell({ reasonCode: "retired" }) }))).not.toBe(
      deliveredUnknown,
    );
  });

  it("hatches Not enough to rank and never Incomplete", () => {
    expect(renderCell({ cell: cell({ reasonCode: "not_enough_stocks" }) })).toHaveClass(
      "bg-pattern-indeterminate",
    );
    expect(renderCell({ cell: cell({ reasonCode: "input_missing" }) })).not.toHaveClass(
      "bg-pattern-indeterminate",
    );
    expect(renderCell({ cell: cell({ reasonCode: "retired" }) })).not.toHaveClass(
      "bg-pattern-indeterminate",
    );
    expect(renderCell({ cell: scored("88.0000000000") })).not.toHaveClass(
      "bg-pattern-indeterminate",
    );
  });

  it.each(FOUR_STATES)(
    "applies no polarity or factor-identity class in the %s cell",
    (_name, data) => {
      const root = renderCell({ cell: data, showScore: true });
      for (const element of [root, ...root.querySelectorAll("*")]) {
        expect(element.getAttribute("class") ?? "").not.toMatch(/gain|loss|factor-|neutral-value/);
      }
    },
  );

  it.each([
    [cell({ reasonCode: "input_missing" }), "bg-value-missing-muted", "text-value-missing"],
    [
      cell({ reasonCode: "not_enough_stocks" }),
      "bg-value-indeterminate-muted",
      "text-value-indeterminate",
    ],
    [cell({ reasonCode: "retired" }), "bg-status-neutral-muted", "text-status-neutral"],
  ])("uses the Token Usage pair %#", (data, background, foreground) => {
    const root = renderCell({ cell: data });
    expect(root).toHaveClass(background);
    expect(root).toHaveClass(foreground);
  });

  it.each([
    ["Incomplete", cell({ reasonCode: "input_missing" })],
    ["Not enough to rank", cell({ reasonCode: "not_enough_stocks" })],
    ["Not followed", cell({ reasonCode: "retired" })],
  ])("sizes the %s badge at the delivered badge size with its corners (IR-005)", (_name, data) => {
    const root = renderCell({ cell: data });
    expect(root).toHaveClass("text-xs");
    expect(root).toHaveClass("rounded");
  });
});

// T006: the scored cell (AC-9, DAC-E4-1; DEC-0150, Open Gap 4).
describe("the scored cell", () => {
  it.each([
    ["87.5000000000", "88"],
    ["99.5000000000", "100"],
    ["84.0000000000", "84"],
    [ZERO, "0"],
  ])("prints the percentile %s as %s and fills the bar to it", (percentile, printed) => {
    const root = renderCell({ cell: scored(percentile) });
    expect(percentileText(root)).toBe(printed);
    expect(percentileText(root)).toBe(formatPercentile(percentile));
    expect(label(root)).toBe(printed);
    expect(printed).not.toMatch(/[%+-]/);
    expect(fill(root).style.width).toBe(`${printed}%`);
  });

  it("hides the bar from assistive technology and paints --seq-4 on --seq-1 inline", () => {
    const root = renderCell({ cell: scored("87.5000000000") });
    const track = bar(root) as HTMLElement;
    expect(track).toHaveAttribute("aria-hidden", "true");
    expect(track.style.background).toContain("--seq-1");
    expect(fill(root).style.background).toContain("--seq-4");
    expect(label(root)).toBe("88");
  });

  it("sets the number in the numeric face at weight 600", () => {
    const root = renderCell({ cell: scored("87.5000000000") });
    const number = root.querySelector("[data-testid='factor-percentile']");
    expect(number).toHaveClass("font-numeric");
    expect(number).toHaveClass("font-semibold");
  });

  it("follows the percentile with the muted score only when asked and present", () => {
    const shown = renderCell({
      cell: scored("87.5000000000", { score: "1.2700000000" }),
      showScore: true,
    });
    expect(scoreElement(shown)).toHaveClass("text-muted-foreground");
    expect(scoreElement(shown)?.textContent).toBe("+1.27");
    const number = shown.querySelector("[data-testid='factor-percentile']") as Element;
    expect(
      number.compareDocumentPosition(scoreElement(shown) as Element) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    const nullScore = renderCell({
      cell: scored("87.5000000000", { score: null }),
      showScore: true,
    });
    expect(scoreElement(nullScore)).toBeNull();
    expect(label(nullScore)).toBe("88");
  });

  it("is an inline element without a badge variant", () => {
    const root = renderCell({ cell: scored("87.5000000000") });
    expect(root).not.toHaveAttribute("data-variant");
    expect(root.tagName).toBe("SPAN");
    expect(root.querySelector("div, p, table")).toBeNull();
  });

  it("boxes the number right-aligned and sizes the bar with the spacing tokens (DEC-0230)", () => {
    const root = renderCell({ cell: scored("87.5000000000") });
    const number = root.querySelector("[data-testid='factor-percentile']");
    expect(number).toHaveClass("inline-block");
    expect(number).toHaveClass("w-5");
    expect(number).toHaveClass("text-right");
    const track = bar(root) as HTMLElement;
    expect(track).toHaveClass("inline-block");
    expect(track).toHaveClass("h-2");
    expect(track).toHaveClass("w-7");
    expect(track).toHaveClass("overflow-hidden");
    expect(fill(root)).toHaveClass("block");
    expect(fill(root)).toHaveClass("h-full");
  });

  it("orders the number, the bar, the mark and the score", () => {
    const root = renderCell({
      cell: scored("87.5000000000", { score: "1.2700000000", restatedPossible: true }),
      showScore: true,
    });
    const children = Array.from(root.children);
    expect(children).toHaveLength(4);
    expect(children[0]).toHaveAttribute("data-testid", "factor-percentile");
    expect(children[1]).toHaveAttribute("data-testid", "factor-bar");
    expect(children[2]).toBe(mark(root));
    expect(children[3]).toHaveAttribute("data-testid", "factor-score");
  });

  it("sets the score in the numeric face at the footnote size (UX design Token Usage)", () => {
    const root = renderCell({
      cell: scored("87.5000000000", { score: "1.2700000000" }),
      showScore: true,
    });
    expect(scoreElement(root)).toHaveClass("font-numeric");
    expect(scoreElement(root)).toHaveClass("text-xs");
    expect(scoreElement(root)).toHaveClass("text-muted-foreground");
  });
});

// T007: the Incomplete reason (AC-12, DAC-E4-1, DAC-E4-S3-1; DEC-0151, STD-UI-1).
describe("the Incomplete cell's reason", () => {
  const MISSING = "operating cash flow missing";
  const OUTDATED = "fundamentals outdated: latest period ended 2026-03-31";
  const COMPUTED = "free-cash-flow yield could not be computed";

  it.each([
    [
      "input_missing",
      MISSING,
      "value",
      "Incomplete: operating cash flow missing, so value can't be compared fairly. It isn't guessed.",
    ],
    [
      "input_outdated",
      OUTDATED,
      "growth",
      "Incomplete: fundamentals outdated: latest period ended 2026-03-31, so growth can't be compared fairly. It isn't guessed.",
    ],
    [
      "input_not_computable",
      COMPUTED,
      "momentum",
      "Incomplete: free-cash-flow yield could not be computed, so momentum can't be compared fairly. It isn't guessed.",
    ],
  ] as const)(
    "titles a %s cell with its reasonDetail and the factor",
    (code, detail, factor, sentence) => {
      const root = renderCell({ cell: cell({ reasonCode: code, reasonDetail: detail }), factor });
      expect(root).toHaveAttribute("title", sentence);
      expect(label(root)).toBe("Incomplete");
      expect(root.textContent).not.toContain(detail);
      expect(sentence.replace(detail, "")).not.toMatch(/[0-9]/);
      expect(sentence).not.toMatch(/instrument|error|null/i);
    },
  );

  it.each([
    [
      "input_missing",
      "Incomplete: an input is missing, so value can't be compared fairly. It isn't guessed.",
    ],
    [
      "input_outdated",
      "Incomplete: an input is outdated, so value can't be compared fairly. It isn't guessed.",
    ],
    [
      "input_not_computable",
      "Incomplete: an input couldn't be computed, so value can't be compared fairly. It isn't guessed.",
    ],
  ] as const)(
    "falls back to the %s sentence naming the factor when reasonDetail is null",
    (code, sentence) => {
      const root = renderCell({ cell: cell({ reasonCode: code, reasonDetail: null }) });
      expect(root).toHaveAttribute("title", sentence);
      expect(sentence).not.toMatch(/[0-9]|instrument|error|null/i);
      expect(label(root)).toBe("Incomplete");
    },
  );

  it("never renders reasonInput, in text, attribute or title", () => {
    const root = renderCell({
      cell: cell({
        reasonCode: "input_missing",
        reasonInput: "revenue_growth",
        reasonDetail: MISSING,
      }),
      factor: "growth",
    });
    expect(root.outerHTML).not.toContain("revenue_growth");
  });

  it("carries no title when neither a detail nor a known reason code names the cause", () => {
    expect(renderCell({ cell: cell({ reasonCode: null }) })).not.toHaveAttribute("title");
    expect(renderCell({ cell: cell({ reasonCode: UNKNOWN_REASON }) })).not.toHaveAttribute("title");
    const detailed = renderCell({ cell: cell({ reasonCode: null, reasonDetail: MISSING }) });
    expect(detailed).toHaveAttribute(
      "title",
      "Incomplete: operating cash flow missing, so value can't be compared fairly. It isn't guessed.",
    );
  });

  it.each(["toString", "constructor", "hasOwnProperty"])(
    "carries no title when the unrecognised reason code is the prototype member %s (DEC-0229)",
    (name) => {
      const root = renderCell({ cell: cell({ reasonCode: name as unknown as ReasonCode }) });
      expect(root).not.toHaveAttribute("title");
      expect(label(root)).toBe("Incomplete");
      expect(root.outerHTML).not.toContain("native code");
    },
  );
});

// T008: state selection, Not followed and Not enough to rank (AC-14, DAC-E4-1, DAC-E4-S3-1; DEC-0151, DEC-0152).
describe("state selection", () => {
  it("chooses by reasonCode first, then by status", () => {
    const retiredWithPercentile = renderCell({
      cell: cell({ status: "classified", reasonCode: "retired", percentile: "88.0000000000" }),
    });
    expect(label(retiredWithPercentile)).toBe("Not followed");
    expect(retiredWithPercentile).toHaveAttribute("data-variant", "status-neutral");
    expect(label(renderCell({ cell: cell({ reasonCode: "not_enough_stocks" }) }))).toBe(
      "Not enough to rank",
    );
    expect(label(renderCell({ cell: scored("88.0000000000") }))).toBe("88");
    expect(label(renderCell({ cell: cell({ reasonCode: null }) }))).toBe("Incomplete");
    expect(label(renderCell({ cell: cell({ reasonCode: UNKNOWN_REASON }) }))).toBe("Incomplete");
    expect(
      label(
        renderCell({ cell: cell({ reasonCode: UNKNOWN_REASON, percentile: "88.0000000000" }) }),
      ),
    ).toBe("Incomplete");
  });

  it("ranks Not enough to rank above a classified percentile (DEC-0151)", () => {
    const root = renderCell({
      cell: cell({
        status: "classified",
        reasonCode: "not_enough_stocks",
        percentile: "50.0000000000",
      }),
    });
    expect(label(root)).toBe("Not enough to rank");
    expect(root).toHaveAttribute("data-variant", "coverage-unknown");
    expect(bar(root)).toBeNull();
  });

  it.each(["input_missing", "input_outdated", "input_not_computable"] as const)(
    "scores a classified cell with a percentile whatever input reason it carries (%s)",
    (code) => {
      const root = renderCell({
        cell: scored("50.0000000000", {
          reasonCode: code,
          reasonDetail: "operating cash flow missing",
        }),
      });
      expect(label(root)).toBe("50");
      expect(root).not.toHaveAttribute("data-variant");
      expect(bar(root)).not.toBeNull();
    },
  );

  it("titles Not followed without a date when none is given", () => {
    const root = renderCell({ cell: cell({ reasonCode: "retired" }) });
    expect(root).toHaveAttribute("title", "Not followed. Earlier scores stand.");
    expect(label(root)).toBe("Not followed");
  });

  it("titles Not followed with the date exactly as given", () => {
    const root = renderCell({
      cell: cell({ reasonCode: "retired" }),
      notFollowedSince: "2026-09-30",
    });
    expect(root).toHaveAttribute("title", "Not followed since 2026-09-30. Earlier scores stand.");
    expect(label(root)).toBe("Not followed");
  });

  it("refuses a date that is not an ISO-8601 calendar date rather than print it", () => {
    expect(() =>
      renderCell({ cell: cell({ reasonCode: "retired" }), notFollowedSince: "30/09/2026" }),
    ).toThrow(RangeError);
  });

  it("gives Not enough to rank no count and no title", () => {
    const root = renderCell({ cell: cell({ reasonCode: "not_enough_stocks" }) });
    expect(root).not.toHaveAttribute("title");
    expect(root.textContent).not.toMatch(/[0-9]|qualified|needed/);
  });

  it("renders the same word in every cell of a Not enough to rank column", () => {
    const data = cell({ reasonCode: "not_enough_stocks" });
    const symbols = Array.from({ length: 50 }, (_, position) => `S${position}`);
    const { container } = render(
      symbols.map((symbol) => <FactorCell key={symbol} cell={data} factor="growth" />),
    );
    const cells = Array.from(container.children);
    expect(cells).toHaveLength(50);
    expect(new Set(cells.map((element) => label(element)))).toEqual(
      new Set(["Not enough to rank"]),
    );
  });
});
