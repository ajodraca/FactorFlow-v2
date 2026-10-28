import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  formatAmount,
  formatDate,
  formatPercentile,
  formatRate,
  formatRatio,
  formatScore,
  formatTimestamp,
} from "./format";

// Implements TC-COMP-071 (T001): one assertion per DAC-E4-S2-3 clause, on the
// decimal strings the API sends at stored precision (DEC-0063).
describe("TC-COMP-071: score, percentile, ratio, rate and date formatting", () => {
  it("signs a standardised score at two decimals with an ASCII hyphen-minus", () => {
    expect(formatScore("1.2700000000")).toBe("+1.27");
    expect(formatScore("-0.4500000000")).toBe("-0.45");
    expect(formatScore("-0.4500000000").charCodeAt(0)).toBe(0x2d);
  });

  it("leaves a zero standardised score unsigned", () => {
    expect(formatScore("0.0000000000")).toBe("0.00");
    expect(formatScore("0E-10")).toBe("0.00");
  });

  it("renders a percentile as a whole number with no sign and no %", () => {
    expect(formatPercentile("84.0000000000")).toBe("84");
  });

  it("renders a ratio at two decimals", () => {
    expect(formatRatio("1.2345")).toBe("1.23");
  });

  it("renders a rate fraction as a signed percentage at two decimals", () => {
    expect(formatRate("0.1240")).toBe("+12.40%");
    expect(formatRate("-0.0500")).toBe("-5.00%");
  });

  it("renders a timestamp in America/Chicago with the zone as the instant falls", () => {
    expect(formatTimestamp("2026-10-15T22:46:00Z")).toBe("2026-10-15 17:46 CDT");
    expect(formatTimestamp("2026-01-15T23:46:00Z")).toBe("2026-01-15 17:46 CST");
  });

  it("passes a date through unconverted, including the daylight-saving change day", () => {
    expect(formatDate("2026-10-15")).toBe("2026-10-15");
    expect(formatDate("2026-03-08")).toBe("2026-03-08");
    expect(formatDate("2026-11-01")).toBe("2026-11-01");
  });
});

// T005: edge cases (AC-9, DAC-E4-S2-3; DEC-0147).
describe("format.ts edge cases", () => {
  it("rounds half away from zero on the decimal string, not through a float", () => {
    expect(formatScore("0.0050000000")).toBe("+0.01");
    expect(formatScore("-0.0050000000")).toBe("-0.01");
    expect(formatScore("1.0050000000")).toBe("+1.01");
    expect(formatScore("1.0049999999")).toBe("+1.00");
    expect(formatScore("9.9950000000")).toBe("+10.00");
    expect(formatScore("-9.9950000000")).toBe("-10.00");
    expect(formatScore("2")).toBe("+2.00");
    expect(formatScore("+0.5")).toBe("+0.50");
  });

  it("never signs a value that rounds to zero", () => {
    expect(formatScore("-0.0040000000")).toBe("0.00");
    expect(formatScore("0.0040000000")).toBe("0.00");
    expect(formatScore("-0")).toBe("0.00");
    expect(formatRatio("-0.004")).toBe("0.00");
    expect(formatRate("-0.00004")).toBe("0.00%");
  });

  it("rounds a percentile to a whole number", () => {
    expect(formatPercentile("87.5000000000")).toBe("88");
    expect(formatPercentile("87.4999999999")).toBe("87");
    expect(formatPercentile("99.5000000000")).toBe("100");
    expect(formatPercentile("0.0000000000")).toBe("0");
    expect(formatPercentile("100.0000000000")).toBe("100");
    expect(formatPercentile("0E-10")).toBe("0");
  });

  it("keeps the sign of a negative ratio and never adds a plus", () => {
    expect(formatRatio("-1.2350")).toBe("-1.24");
    expect(formatRatio("0.004")).toBe("0.00");
    expect(formatRatio("0.005")).toBe("0.01");
    expect(formatRatio("12")).toBe("12.00");
  });

  it("leaves a zero rate unsigned and shifts the fraction by two places", () => {
    expect(formatRate("0.0000")).toBe("0.00%");
    expect(formatRate("1.5")).toBe("+150.00%");
    expect(formatRate("0.000050")).toBe("+0.01%");
    expect(formatRate("-0.123456")).toBe("-12.35%");
  });

  it("renders an amount in whole units with comma separators, no symbol, no abbreviation", () => {
    expect(formatAmount("1234567.5")).toBe("1,234,568");
    expect(formatAmount("-9876543")).toBe("-9,876,543");
    expect(formatAmount("999")).toBe("999");
    expect(formatAmount("1000")).toBe("1,000");
    expect(formatAmount("999999.5")).toBe("1,000,000");
    expect(formatAmount("-0.4")).toBe("0");
  });

  it.each(["", "abc", "NaN", "Infinity", "-Infinity", "1e3", "1,5", "1.", ".5", " 1.0", "1E-10"])(
    "throws RangeError on the non-decimal input %j rather than render a value",
    (input) => {
      for (const format of [formatScore, formatPercentile, formatRatio, formatRate, formatAmount]) {
        expect(() => format(input)).toThrow(RangeError);
      }
    },
  );

  it("renders minutes by default and seconds when asked", () => {
    expect(formatTimestamp("2026-10-15T22:52:10Z")).toBe("2026-10-15 17:52 CDT");
    expect(formatTimestamp("2026-10-15T22:52:10Z", { seconds: true })).toBe(
      "2026-10-15 17:52:10 CDT",
    );
  });

  it("spells midnight 00, not 24", () => {
    expect(formatTimestamp("2026-10-16T05:00:00Z")).toBe("2026-10-16 00:00 CDT");
    expect(formatTimestamp("2026-01-16T06:00:30Z", { seconds: true })).toBe(
      "2026-01-16 00:00:30 CST",
    );
  });

  it("takes the zone as the instant falls across the autumn change", () => {
    expect(formatTimestamp("2026-11-01T06:30:00Z")).toBe("2026-11-01 01:30 CDT");
    expect(formatTimestamp("2026-11-01T07:30:00Z")).toBe("2026-11-01 01:30 CST");
  });

  it("accepts an instant with an explicit offset", () => {
    expect(formatTimestamp("2026-10-15T17:46:00-05:00")).toBe("2026-10-15 17:46 CDT");
    expect(formatTimestamp("2026-10-15T22:46:00.123456+00:00")).toBe("2026-10-15 17:46 CDT");
  });

  it.each(["", "2026-10-15", "2026-10-15T22:46:00", "not a time", "2026-13-45T99:00:00Z"])(
    "throws RangeError on %j, which is not an ISO-8601 instant with a zone",
    (input) => {
      expect(() => formatTimestamp(input)).toThrow(RangeError);
      expect(() => formatTimestamp(input)).toThrow(
        `Not an ISO-8601 instant: ${JSON.stringify(input)}`,
      );
    },
  );

  it.each(["", "2026-1-5", "20261015", "2026-10-15T00:00:00Z", "15/10/2026"])(
    "throws RangeError on the non-date %j",
    (input) => {
      expect(() => formatDate(input)).toThrow(RangeError);
      expect(() => formatDate(input)).toThrow(`Not an ISO-8601 date: ${JSON.stringify(input)}`);
    },
  );

  describe.each(["Asia/Tokyo", "UTC", "America/Los_Angeles"])("under TZ=%s", (zone) => {
    let previous: string | undefined;
    beforeEach(() => {
      previous = process.env.TZ;
      process.env.TZ = zone;
    });
    afterEach(() => {
      if (previous === undefined) {
        Reflect.deleteProperty(process.env, "TZ");
      } else {
        process.env.TZ = previous;
      }
    });

    it("does not read the machine zone", () => {
      expect(formatTimestamp("2026-10-15T22:46:00Z")).toBe("2026-10-15 17:46 CDT");
      expect(formatTimestamp("2026-01-15T23:46:00Z")).toBe("2026-01-15 17:46 CST");
      expect(formatDate("2026-03-08")).toBe("2026-03-08");
    });
  });
});
