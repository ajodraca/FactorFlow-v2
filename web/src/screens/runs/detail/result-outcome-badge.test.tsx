import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ResultOutcome } from "../../../api/types";
import {
  RESULT_OUTCOME_LABEL,
  RESULT_OUTCOME_ORDER,
  RESULT_OUTCOME_TIER,
  ResultOutcomeBadge,
} from "./result-outcome-badge";

const EXPECTED: [ResultOutcome, string, string][] = [
  ["written", "good", "Written"],
  ["unchanged", "good", "Unchanged"],
  ["not_found", "warning", "Not found"],
  ["failed", "critical", "Failed"],
  ["skipped", "warning", "Skipped"],
];

// CAP-001-E7-S4 T012 (DAC-E7-2, DAC-E7-S4-4, DAC-E7-11; DEC-0015): the
// per-data-type outcome badge.
describe("Result outcome tiers and labels (DEC-0015)", () => {
  it("covers exactly the five result outcomes", () => {
    expect(Object.keys(RESULT_OUTCOME_TIER).sort()).toEqual(
      ["failed", "not_found", "skipped", "unchanged", "written"].sort(),
    );
    expect(Object.keys(RESULT_OUTCOME_LABEL).sort()).toEqual(
      Object.keys(RESULT_OUTCOME_TIER).sort(),
    );
  });

  it("maps each outcome to its tier and label", () => {
    for (const [outcome, tier, label] of EXPECTED) {
      expect(RESULT_OUTCOME_TIER[outcome]).toBe(tier);
      expect(RESULT_OUTCOME_LABEL[outcome]).toBe(label);
    }
  });

  it("uses only the three per-data-type variants ux-design 1.5 maps", () => {
    for (const tier of Object.values(RESULT_OUTCOME_TIER)) {
      expect(["good", "warning", "critical"]).toContain(tier);
    }
  });

  it("orders the collapsed row failure-first", () => {
    expect(RESULT_OUTCOME_ORDER).toEqual([
      "failed",
      "not_found",
      "skipped",
      "unchanged",
      "written",
    ]);
  });

  it.each(EXPECTED)("renders %s as status-%s with its word and icon", (outcome, tier, label) => {
    render(<ResultOutcomeBadge outcome={outcome} />);
    const badge = screen.getByTestId("result-outcome-badge");
    expect(badge).toHaveAttribute("data-variant", `status-${tier}`);
    expect(badge).toHaveTextContent(label);
    expect(badge.querySelector(`svg[data-icon="${tier}"]`)).not.toBeNull();
  });
});
