import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  formatClock,
  formatCount,
  formatDownloadName,
  formatInstant,
  formatSessionDate,
} from "./format";

// Implements TC-COMP-023
describe("formatInstant and formatSessionDate (TC-COMP-023)", () => {
  it("reads CDT for an October instant and CST for a January one", () => {
    expect(formatInstant("2026-10-15T22:46:00Z")).toBe("2026-10-15 17:46 CDT");
    expect(formatInstant("2026-01-15T23:46:00Z")).toBe("2026-01-15 17:46 CST");
  });

  it("shows seconds only when asked", () => {
    expect(formatInstant("2026-10-15T22:52:10Z", { seconds: true })).toBe(
      "2026-10-15 17:52:10 CDT",
    );
    expect(formatInstant("2026-10-15T22:52:10Z", { seconds: false })).toBe("2026-10-15 17:52 CDT");
    expect(formatInstant("2026-10-15T22:52:10Z")).toBe("2026-10-15 17:52 CDT");
  });

  it("takes a Date as well as a string (DEC-0309)", () => {
    expect(formatInstant(new Date("2026-10-15T22:46:00Z"))).toBe("2026-10-15 17:46 CDT");
  });

  it("takes the zone as the instant falls across the autumn change", () => {
    expect(formatInstant("2026-11-01T06:30:00Z")).toBe("2026-11-01 01:30 CDT");
    expect(formatInstant("2026-11-01T07:30:00Z")).toBe("2026-11-01 01:30 CST");
  });

  it("spells midnight 00, never 24", () => {
    expect(formatInstant("2026-10-16T05:00:00Z")).toBe("2026-10-16 00:00 CDT");
  });

  it("accepts an explicit offset", () => {
    expect(formatInstant("2026-10-15T17:46:00-05:00")).toBe("2026-10-15 17:46 CDT");
  });

  it("returns a session date unshifted", () => {
    expect(formatSessionDate("2026-03-08")).toBe("2026-03-08");
  });

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
      expect(formatInstant("2026-10-15T22:46:00Z")).toBe("2026-10-15 17:46 CDT");
      expect(formatInstant("2026-01-15T23:46:00Z")).toBe("2026-01-15 17:46 CST");
      expect(formatClock("2026-10-15T22:52:10Z")).toBe("17:52:10 CDT");
      expect(formatSessionDate("2026-03-08")).toBe("2026-03-08");
    });
  });
});

// Implements TC-COMP-024
describe("formatCount and formatDownloadName (TC-COMP-024)", () => {
  it.each([
    [0, "0"],
    [999, "999"],
    [1000, "1,000"],
    [1236, "1,236"],
    [1234567, "1,234,567"],
  ])("formats %d as %s", (n, expected) => {
    expect(formatCount(n)).toBe(expected);
  });

  it("names a download from requested_at when started_at is null", () => {
    expect(formatDownloadName(null, "2026-10-15T22:46:00Z")).toBe("Download 2026-10-15 17:46 CDT");
  });

  it("names a download from its start time when there is one", () => {
    expect(formatDownloadName("2026-01-15T23:46:00Z", "2026-01-15T23:40:00Z")).toBe(
      "Download 2026-01-15 17:46 CST",
    );
  });
});

describe("clock and input guards", () => {
  it("renders a clock with seconds and the zone", () => {
    expect(formatClock("2026-10-15T22:52:10Z")).toBe("17:52:10 CDT");
    expect(formatClock(new Date("2026-01-16T06:00:30Z"))).toBe("00:00:30 CST");
  });

  it.each(["", "2026-10-15", "2026-10-15T22:46:00", "not a time", "2026-13-45T99:00:00Z"])(
    "throws RangeError on the non-instant %j",
    (input) => {
      expect(() => formatInstant(input)).toThrow(RangeError);
      expect(() => formatInstant(input)).toThrow(
        `Not an ISO-8601 instant: ${JSON.stringify(input)}`,
      );
      expect(() => formatClock(input)).toThrow(RangeError);
      expect(() => formatClock(input)).toThrow(`Not an ISO-8601 instant: ${JSON.stringify(input)}`);
    },
  );

  it("throws RangeError on an invalid Date", () => {
    expect(() => formatInstant(new Date(Number.NaN))).toThrow(/^Not an ISO-8601 instant/);
    expect(() => formatClock(new Date(Number.NaN))).toThrow(/^Not an ISO-8601 instant/);
  });

  it.each(["", "2026-1-5", "20261015", "2026-10-15T00:00:00Z"])(
    "throws RangeError on the non-date %j",
    (input) => {
      expect(() => formatSessionDate(input)).toThrow(RangeError);
    },
  );

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "throws RangeError on the non-count %d",
    (n) => {
      expect(() => formatCount(n)).toThrow(RangeError);
    },
  );

  it("throws RangeError when the download instants are not instants", () => {
    expect(() => formatDownloadName(null, "2026-10-15")).toThrow(RangeError);
  });
});
