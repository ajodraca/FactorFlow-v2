import { describe, expect, it } from "vitest";
import { row } from "./test-fixtures";
import { uniformShortfallYears } from "./uniform-shortfall";

// Supports DAC-E6-S4-6 and AC-22 (CAP-001-E6-S4-tasks T011, Open Gap 3).
describe("uniformShortfallYears", () => {
  it("returns n when two or more covered rows share the same positive shortfall", () => {
    expect(
      uniformShortfallYears([row({ depthShortByYears: 3 }), row({ depthShortByYears: 3 })]),
    ).toBe(3);
  });

  it("returns null for an empty list and for a single row", () => {
    expect(uniformShortfallYears([])).toBeNull();
    expect(uniformShortfallYears([row({ depthShortByYears: 3 })])).toBeNull();
  });

  it("returns null when any covered row meets the depth or the values differ", () => {
    expect(
      uniformShortfallYears([row({ depthShortByYears: 3 }), row({ depthShortByYears: null })]),
    ).toBeNull();
    expect(
      uniformShortfallYears([row({ depthShortByYears: 3 }), row({ depthShortByYears: 0 })]),
    ).toBeNull();
    expect(
      uniformShortfallYears([row({ depthShortByYears: 3 }), row({ depthShortByYears: 2 })]),
    ).toBeNull();
  });

  it("ignores rows with nothing covered", () => {
    const uncovered = row({ coveredFrom: null, coveredTo: null, depthShortByYears: null });
    expect(
      uniformShortfallYears([
        row({ depthShortByYears: 2 }),
        uncovered,
        row({ depthShortByYears: 2 }),
      ]),
    ).toBe(2);
    expect(uniformShortfallYears([row({ depthShortByYears: 2 }), uncovered])).toBeNull();
  });
});
