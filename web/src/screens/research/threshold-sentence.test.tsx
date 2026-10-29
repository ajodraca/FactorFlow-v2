import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { FactorName } from "../../api/classification-types";
import {
  type Measure,
  type ThresholdSentence as Sentence,
  decodeResearchQuery,
} from "../../api/research-query";
import { ThresholdSentence, validateThresholdValue } from "./threshold-sentence";

const PERCENTILE_ERROR =
  "Could not set the value threshold: a percentile is a number from 0 to 100.";
const SCORE_ERROR = "Could not set the value threshold: a standardised score is a finite number.";

function renderValueRow(value?: Sentence) {
  const onCommit = vi.fn();
  const view = render(<ThresholdSentence factor="value" value={value} onCommit={onCommit} />);
  return {
    onCommit,
    view,
    field: screen.getByRole("textbox", { name: "Value threshold" }),
    measure: screen.getByRole("combobox", { name: "Measure for value" }),
    direction: screen.getByRole("combobox", { name: "Direction for value" }),
  };
}

function expectFieldError(field: HTMLElement, text: string): void {
  const alert = screen.getByRole("alert");
  expect(alert).toHaveTextContent(text);
  expect(alert.textContent).toBe(text);
  expect(field).toHaveAttribute("aria-invalid", "true");
  expect(field.getAttribute("aria-describedby")?.split(" ")).toContain(alert.id);
}

// Implements TC-COMP-134 (DAC-E4-S5-1): the field validates on blur, before any request.
describe("TC-COMP-134: threshold field validates percentile and non-finite scores on blur", () => {
  it.each(["101", "-1", "abc", "1e3", "100.5"])(
    "(a) percentile %j is a field error on blur and commits nothing",
    async (raw) => {
      const user = userEvent.setup();
      const { field, onCommit } = renderValueRow();

      await user.type(field, raw);
      await user.tab();

      expectFieldError(field, PERCENTILE_ERROR);
      expect(onCommit.mock.calls.length).toBe(0);
    },
  );

  it.each(["NaN", "Infinity", "-Infinity", "abc"])(
    "(b) standardised score %j is a field error on blur and commits nothing",
    async (raw) => {
      const user = userEvent.setup();
      const { field, measure, onCommit } = renderValueRow();

      await user.selectOptions(measure, "standardisedScore");
      await user.type(field, raw);
      await user.tab();

      expectFieldError(field, SCORE_ERROR);
      expect(onCommit.mock.calls.length).toBe(0);
    },
  );

  it.each(["0", "100", "70", "87.5"])(
    "(c) percentile %j commits exactly once on blur",
    async (raw) => {
      const user = userEvent.setup();
      const { field, onCommit } = renderValueRow();

      await user.type(field, raw);
      await user.tab();

      expect(onCommit.mock.calls).toEqual([
        [{ measure: "percentile", direction: "atLeast", value: raw }],
      ]);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(field).not.toHaveAttribute("aria-invalid");
    },
  );

  it.each(["-0.45", "+1.27", "0"])(
    "(c) standardised score %j commits exactly once on blur",
    async (raw) => {
      const user = userEvent.setup();
      const { field, measure, onCommit } = renderValueRow();

      await user.selectOptions(measure, "standardisedScore");
      await user.type(field, raw);
      await user.tab();

      expect(onCommit.mock.calls).toEqual([
        [{ measure: "standardisedScore", direction: "atLeast", value: raw }],
      ]);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    },
  );

  it("(d) a blank value after a committed one commits null with no field error", async () => {
    const user = userEvent.setup();
    const { field, onCommit } = renderValueRow({
      measure: "percentile",
      direction: "atLeast",
      value: "70",
    });
    expect(field).toHaveValue("70");

    await user.clear(field);
    await user.tab();

    expect(onCommit.mock.calls).toEqual([[null]]);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("names the row's own factor in the error, not the value row's", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    render(<ThresholdSentence factor="growth" onCommit={onCommit} />);
    const field = screen.getByRole("textbox", { name: "Value threshold for growth" });

    await user.type(field, "101");
    await user.tab();

    expectFieldError(
      field,
      "Could not set the growth threshold: a percentile is a number from 0 to 100.",
    );
    expect(onCommit.mock.calls.length).toBe(0);
  });

  it("(d) a field that was always blank commits nothing on blur", async () => {
    const user = userEvent.setup();
    const { field, onCommit } = renderValueRow();

    await user.click(field);
    await user.tab();

    expect(onCommit.mock.calls.length).toBe(0);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

// Implements TC-COMP-137 (DAC-E4-S5-4): each sentence reads as its blanks (DEC-0157).
describe("TC-COMP-137: threshold sentences have accessible names reading as sentences", () => {
  it("names the value row's three blanks as the design writes them", () => {
    renderValueRow();

    expect(screen.getByRole("combobox", { name: "Measure for value" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Direction for value" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Value threshold" })).toBeInTheDocument();
  });

  it.each<FactorName>(["growth", "momentum"])(
    "names the %s row's blanks with the factor, so the three textboxes are distinct",
    (factor) => {
      render(<ThresholdSentence factor={factor} onCommit={vi.fn()} />);

      expect(screen.getByRole("combobox", { name: `Measure for ${factor}` })).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: `Direction for ${factor}` })).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: `Value threshold for ${factor}` }),
      ).toBeInTheDocument();
    },
  );

  it("lists the measures and directions in order and offers 'any' as the value placeholder", () => {
    const { measure, direction, field } = renderValueRow();

    expect(
      within(measure)
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual(["percentile", "standardised score"]);
    expect(
      within(direction)
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual(["at least", "at most"]);
    expect(field).toHaveAttribute("placeholder", "any");
    expect(field).toHaveClass("w-14");
  });

  it.each<[FactorName, string]>([
    ["value", "Value"],
    ["growth", "Growth"],
    ["momentum", "Momentum"],
  ])(
    "reads the %s row as a <p>: hidden swatch, %j, then the three blanks in order",
    (factor, name) => {
      const { container } = render(<ThresholdSentence factor={factor} onCommit={vi.fn()} />);

      const sentence = container.querySelectorAll("p");
      expect(sentence).toHaveLength(1);
      const row = sentence[0] as HTMLElement;
      const swatch = row.querySelector("[aria-hidden='true']");
      expect(swatch).not.toBeNull();
      expect(row.textContent?.startsWith(name)).toBe(true);
      const controls = Array.from(row.querySelectorAll("select, input"));
      expect(controls.map((control) => control.getAttribute("aria-label"))).toEqual([
        `Measure for ${factor}`,
        `Direction for ${factor}`,
        factor === "value" ? "Value threshold" : `Value threshold for ${factor}`,
      ]);
    },
  );
});

// T005: sentence behaviour (AC-16, DAC-E4-S5-1, DAC-E4-S5-4; DEC-0157).
describe("ThresholdSentence behaviour", () => {
  const TABLE: [Measure, string, boolean][] = [
    ["percentile", "0", true],
    ["percentile", "100", true],
    ["percentile", "100.0", true],
    ["percentile", "-1", false],
    ["percentile", "101", false],
    ["percentile", "abc", false],
    ["percentile", "", false],
    ["percentile", "1e3", false],
    ["standardisedScore", "-0.45", true],
    ["standardisedScore", "+1.27", true],
    ["standardisedScore", "0", true],
    ["standardisedScore", "abc", false],
    ["standardisedScore", "NaN", false],
    ["standardisedScore", "Infinity", false],
    ["standardisedScore", "1e3", false],
    ["standardisedScore", "", false],
  ];

  it.each(TABLE)("(a) agrees with the codec: %s %j kept=%s", (measure, raw, kept) => {
    const params = new URLSearchParams();
    params.set("value.measure", measure);
    params.set("value.direction", "atLeast");
    params.set("value.value", raw);
    const codecKeeps = decodeResearchQuery(params).sentences.value !== undefined;
    const sentenceKeeps = raw !== "" && validateThresholdValue(measure, raw) === null;

    expect(codecKeeps).toBe(kept);
    expect(sentenceKeeps).toBe(codecKeeps);
  });

  it("(a) a blank value is not an error: it means no threshold", () => {
    expect(validateThresholdValue("percentile", "")).toBeNull();
    expect(validateThresholdValue("standardisedScore", "")).toBeNull();
  });

  it("(a) an invalid value's error names the factor and the measure's rule", () => {
    expect(validateThresholdValue("percentile", "101")).toBe(PERCENTILE_ERROR);
    expect(validateThresholdValue("standardisedScore", "NaN")).toBe(SCORE_ERROR);
  });

  it("(b) the field is a text input in decimal mode, not a number input", () => {
    const { field } = renderValueRow();

    expect(field).toHaveAttribute("type", "text");
    expect(field).toHaveAttribute("inputmode", "decimal");
  });

  it("(c) changing the direction with a valid value commits the sentence once", async () => {
    const user = userEvent.setup();
    const { direction, onCommit } = renderValueRow({
      measure: "percentile",
      direction: "atLeast",
      value: "70",
    });

    await user.selectOptions(direction, "atMost");

    expect(onCommit.mock.calls).toEqual([
      [{ measure: "percentile", direction: "atMost", value: "70" }],
    ]);
  });

  it("(c) changing the measure with a valid value commits the sentence once", async () => {
    const user = userEvent.setup();
    const { measure, onCommit } = renderValueRow({
      measure: "percentile",
      direction: "atLeast",
      value: "70",
    });

    await user.selectOptions(measure, "standardisedScore");

    expect(onCommit.mock.calls).toEqual([
      [{ measure: "standardisedScore", direction: "atLeast", value: "70" }],
    ]);
  });

  it("(c) changing a select with a blank value commits nothing", async () => {
    const user = userEvent.setup();
    const { measure, direction, onCommit } = renderValueRow();

    await user.selectOptions(measure, "standardisedScore");
    await user.selectOptions(direction, "atMost");

    expect(onCommit.mock.calls.length).toBe(0);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("(c) a measure change that invalidates the value is a field error and commits nothing", async () => {
    const user = userEvent.setup();
    const { measure, field, onCommit } = renderValueRow({
      measure: "standardisedScore",
      direction: "atLeast",
      value: "150",
    });

    await user.selectOptions(measure, "percentile");

    expectFieldError(field, PERCENTILE_ERROR);
    expect(onCommit.mock.calls.length).toBe(0);
    expect(field).toHaveValue("150");
  });

  it("(d) neither commits nor reports while typing, only on blur", async () => {
    const user = userEvent.setup();
    const { field, onCommit } = renderValueRow();

    await user.type(field, "101");

    expect(onCommit.mock.calls.length).toBe(0);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    await user.tab();

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("(e) a shown error clears as soon as the field becomes valid", async () => {
    const user = userEvent.setup();
    const { field } = renderValueRow();
    await user.type(field, "101");
    await user.tab();
    expect(screen.getByRole("alert")).toBeInTheDocument();

    await user.clear(field);
    await user.type(field, "50");

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(field).not.toHaveAttribute("aria-invalid");
  });

  it("(e) a shown error stays while the field is still invalid", async () => {
    const user = userEvent.setup();
    const { field } = renderValueRow();
    await user.type(field, "101");
    await user.tab();
    expect(screen.getByRole("alert")).toBeInTheDocument();

    await user.type(field, "1");

    expect(field).toHaveValue("1011");
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(field).toHaveAttribute("aria-invalid", "true");
  });

  it("(e) a shown error clears when the field becomes blank", async () => {
    const user = userEvent.setup();
    const { field } = renderValueRow();
    await user.type(field, "101");
    await user.tab();
    expect(screen.getByRole("alert")).toBeInTheDocument();

    await user.clear(field);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("(f) re-syncs the draft when the value prop changes to undefined", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    const { rerender } = render(
      <ThresholdSentence
        factor="value"
        value={{ measure: "standardisedScore", direction: "atMost", value: "1.5" }}
        onCommit={onCommit}
      />,
    );
    const field = screen.getByRole("textbox", { name: "Value threshold" });
    expect(field).toHaveValue("1.5");
    await user.clear(field);
    await user.type(field, "abc");
    await user.tab();
    expect(screen.getByRole("alert")).toBeInTheDocument();

    rerender(<ThresholdSentence factor="value" value={undefined} onCommit={onCommit} />);

    expect(field).toHaveValue("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Measure for value" })).toHaveValue("percentile");
    expect(screen.getByRole("combobox", { name: "Direction for value" })).toHaveValue("atLeast");
  });

  it("(f) re-syncs the draft when the value prop changes to another sentence", () => {
    const onCommit = vi.fn();
    const { rerender } = render(<ThresholdSentence factor="value" onCommit={onCommit} />);

    rerender(
      <ThresholdSentence
        factor="value"
        value={{ measure: "standardisedScore", direction: "atMost", value: "-0.5" }}
        onCommit={onCommit}
      />,
    );

    expect(screen.getByRole("textbox", { name: "Value threshold" })).toHaveValue("-0.5");
    expect(screen.getByRole("combobox", { name: "Measure for value" })).toHaveValue(
      "standardisedScore",
    );
    expect(screen.getByRole("combobox", { name: "Direction for value" })).toHaveValue("atMost");
  });

  it("(g) no control is ever disabled: rows stay usable while a request is in flight", () => {
    const { field, measure, direction } = renderValueRow();

    for (const control of [field, measure, direction]) {
      expect(control).not.toBeDisabled();
      expect(control).not.toHaveAttribute("aria-disabled");
    }
  });

  it("commits only when the sentence differs from the current value", async () => {
    const user = userEvent.setup();
    const { field, onCommit } = renderValueRow({
      measure: "percentile",
      direction: "atLeast",
      value: "70",
    });

    await user.click(field);
    await user.tab();

    expect(onCommit.mock.calls.length).toBe(0);
  });
});
