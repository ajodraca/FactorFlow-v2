import { describe, expect, it } from "vitest";
import { parseBulkSymbols } from "../instruments/parse-bulk-symbols";
import { ENTRY_SEPARATOR, SYMBOL_SHAPE, replaceEntry, summarisePaste } from "./summarise-paste";

// Implements TC-COMP-113 (DAC-E4-S3-1, DAC-E4-5, AC-5)
describe("summarisePaste (TC-COMP-113)", () => {
  it.each(["BRK/B", "BRK B", "BRK_B"])("suggests BRK.B for %s", (raw) => {
    expect(summarisePaste(parseBulkSymbols(raw))).toEqual({
      accepted: [],
      duplicates: [],
      unreadable: [{ input: raw, fix: "BRK.B" }],
    });
  });

  it("offers no fix for ZZZZ!", () => {
    expect(summarisePaste(parseBulkSymbols("ZZZZ!"))).toEqual({
      accepted: [],
      duplicates: [],
      unreadable: [{ input: "ZZZZ!", fix: null }],
    });
  });

  it("accepts KO once and names the repeat", () => {
    expect(summarisePaste(parseBulkSymbols("KO\nKO"))).toEqual({
      accepted: ["KO"],
      duplicates: ["KO"],
      unreadable: [],
    });
  });

  it("keeps the accepted entries whatever else is rejected", () => {
    expect(summarisePaste(parseBulkSymbols("AAPL, ZZZZ!, MSFT, BRK/B, AAPL"))).toEqual({
      accepted: ["AAPL", "MSFT"],
      duplicates: ["AAPL"],
      unreadable: [
        { input: "ZZZZ!", fix: null },
        { input: "BRK/B", fix: "BRK.B" },
      ],
    });
  });
});

describe("summarisePaste rules (DAC-E4-5; DEC-0218; DEC-0351, DEC-0352)", () => {
  it("names a repeated symbol once however often it repeats", () => {
    const summary = summarisePaste(parseBulkSymbols("KO, KO, ko, KO"));
    expect(summary.accepted).toEqual(["KO"]);
    expect(summary.duplicates).toEqual(["KO"]);
  });

  it("keeps first-occurrence order for accepted and first-repeat order for duplicates", () => {
    const summary = summarisePaste(parseBulkSymbols("MSFT, AAPL, MSFT, NVDA, AAPL"));
    expect(summary.accepted).toEqual(["MSFT", "AAPL", "NVDA"]);
    expect(summary.duplicates).toEqual(["MSFT", "AAPL"]);
  });

  it("does not treat a repeated unreadable entry as a duplicate", () => {
    const summary = summarisePaste(parseBulkSymbols("ZZZZ!, ZZZZ!"));
    expect(summary.duplicates).toEqual([]);
    expect(summary.unreadable).toEqual([
      { input: "ZZZZ!", fix: null },
      { input: "ZZZZ!", fix: null },
    ]);
  });

  it.each([
    ["BRK / B", "BRK.B"],
    ["brk/b", "BRK.B"],
    ["BRK/B!", null],
    ["A1/B", null],
    ["ABC 1", null],
    ["/BRK", null],
    ["BRK/", null],
  ])("offers the fix for %s only when a run of separators sits between letters", (raw, fix) => {
    expect(summarisePaste(parseBulkSymbols(raw)).unreadable).toEqual([{ input: raw, fix }]);
  });

  it("applies the rule as recorded to two symbols joined by a space", () => {
    expect(summarisePaste(parseBulkSymbols("AAPL MSFT")).unreadable).toEqual([
      { input: "AAPL MSFT", fix: "AAPL.MSFT" },
    ]);
  });

  it.each([
    "A",
    "BRK.B",
    "BF-B",
    "1AB",
    "ABCDEFGHIJKLMNOPQ",
    "ABCDEFGHIJKLMNOP",
    "A_B",
    "A B",
    "A/B",
    "a",
  ])("mirrors the delivered parser's shape for %s", (raw) => {
    expect(SYMBOL_SHAPE.test(raw.toUpperCase())).toBe(parseBulkSymbols(raw)[0]?.valid);
  });
});

describe("replaceEntry (DEC-0352)", () => {
  it("keeps the separators", () => {
    expect(replaceEntry("AAPL,BRK/B;MSFT", "BRK/B", "BRK.B")).toBe("AAPL,BRK.B;MSFT");
  });

  it("keeps the whitespace around the entry", () => {
    expect(replaceEntry(" BRK/B \nKO", "BRK/B", "BRK.B")).toBe(" BRK.B \nKO");
  });

  it("replaces a whole entry only", () => {
    expect(replaceEntry("BRK/BX, BRK/B", "BRK/B", "BRK.B")).toBe("BRK/BX, BRK.B");
  });

  it("replaces every occurrence of the entry", () => {
    expect(replaceEntry("BRK/B\nBRK/B", "BRK/B", "BRK.B")).toBe("BRK.B\nBRK.B");
  });

  it("splits where the delivered parser splits", () => {
    const corpus = "A,B\n\tC;;D , E";
    const seen: string[] = [];
    // The mirrored separators cut the text into the entries the parser reports.
    const entries = corpus
      .split(ENTRY_SEPARATOR)
      .filter((_, index) => index % 2 === 0)
      .map((part) => part.trim())
      .filter((part) => part !== "");
    expect(entries).toEqual(parseBulkSymbols(corpus).map((entry) => entry.input));
    // Every entry the parser reports must be one replaceEntry can find and replace.
    for (const entry of parseBulkSymbols(corpus)) {
      seen.push(replaceEntry(corpus, entry.input, `<${entry.input}>`));
    }
    expect(seen).toEqual([
      "<A>,B\n\tC;;D , E",
      "A,<B>\n\tC;;D , E",
      "A,B\n\t<C>;;D , E",
      "A,B\n\tC;;<D> , E",
      "A,B\n\tC;;D , <E>",
    ]);
  });
});
