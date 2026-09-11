import { describe, expect, it } from "vitest";
import { parseBulkSymbols } from "./parse-bulk-symbols";

// TC-COMP-101, TC-COMP-128 (T014): the bulk-add parser is a pure function,
// tested independently of the rendered `textarea`, and correctly splits on
// newline, comma, tab, and semicolon in combination (DAC-E2-3).
describe("parseBulkSymbols", () => {
  it("splits on newline, comma, tab, and semicolon in combination", () => {
    const result = parseBulkSymbols("AAPL,MSFT\nGOOG\tAMZN;NFLX");

    expect(result.map((entry) => entry.normalised)).toEqual([
      "AAPL",
      "MSFT",
      "GOOG",
      "AMZN",
      "NFLX",
    ]);
    expect(result.every((entry) => entry.valid)).toBe(true);
  });

  it("ignores blank entries produced by consecutive or trailing separators", () => {
    const result = parseBulkSymbols("AAPL,,MSFT\n\n\t;GOOG;;\n");

    expect(result.map((entry) => entry.normalised)).toEqual(["AAPL", "MSFT", "GOOG"]);
  });

  it("normalises case and surrounding whitespace before validating shape", () => {
    const result = parseBulkSymbols(" aapl , brk.b ");

    expect(result.map((entry) => entry.normalised)).toEqual(["AAPL", "BRK.B"]);
    expect(result.every((entry) => entry.valid)).toBe(true);
  });

  it("marks a malformed entry invalid without discarding the others (DAC-E2-S4-1)", () => {
    const result = parseBulkSymbols("AAPL,1BAD,MSFT");

    expect(result).toEqual([
      { input: "AAPL", normalised: "AAPL", valid: true },
      { input: "1BAD", normalised: "1BAD", valid: false },
      { input: "MSFT", normalised: "MSFT", valid: true },
    ]);
  });

  it("returns an empty list for blank input", () => {
    expect(parseBulkSymbols("   \n\t  ")).toEqual([]);
  });
});
