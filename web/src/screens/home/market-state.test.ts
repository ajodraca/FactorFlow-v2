import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The module's formatter is built when it loads, so each zone re-imports it:
// a formatter that fell back to the machine zone would then read that zone.
type MarketStateModule = typeof import("./market-state");
let chicagoWallClock: MarketStateModule["chicagoWallClock"];
let marketState: MarketStateModule["marketState"];

// Implements TC-COMP-132
// The literal table: UTC instants and their America/Chicago meaning (DEC-0206;
// DAC-E5-6; DAC-E5-S1-1). The weekend instants fall inside session hours on
// purpose, so only the weekday rule makes them `closed`.
const TABLE: ReadonlyArray<readonly [string, "closed" | "not_determinable"]> = [
  // March change (CST before 2026-03-08, CDT after)
  ["2026-03-06T14:29:00Z", "closed"],
  ["2026-03-06T14:30:00Z", "not_determinable"],
  ["2026-03-06T20:59:00Z", "not_determinable"],
  ["2026-03-06T21:00:00Z", "closed"],
  ["2026-03-07T18:00:00Z", "closed"],
  ["2026-03-08T17:00:00Z", "closed"],
  ["2026-03-09T13:29:00Z", "closed"],
  ["2026-03-09T13:30:00Z", "not_determinable"],
  ["2026-03-09T19:59:00Z", "not_determinable"],
  ["2026-03-09T20:00:00Z", "closed"],
  // November change (CDT before 2026-11-01, CST after)
  ["2026-10-30T13:29:00Z", "closed"],
  ["2026-10-30T13:30:00Z", "not_determinable"],
  ["2026-10-30T19:59:00Z", "not_determinable"],
  ["2026-10-30T20:00:00Z", "closed"],
  ["2026-10-31T17:00:00Z", "closed"],
  ["2026-11-01T18:00:00Z", "closed"],
  ["2026-11-02T14:29:00Z", "closed"],
  ["2026-11-02T14:30:00Z", "not_determinable"],
  ["2026-11-02T20:59:00Z", "not_determinable"],
  ["2026-11-02T21:00:00Z", "closed"],
];

describe.each(["Asia/Tokyo", "UTC", "America/Los_Angeles"])("under TZ=%s", (zone) => {
  let previous: string | undefined;
  beforeEach(async () => {
    previous = process.env.TZ;
    process.env.TZ = zone;
    vi.resetModules();
    ({ chicagoWallClock, marketState } = await import("./market-state"));
  });
  afterEach(() => {
    if (previous === undefined) {
      Reflect.deleteProperty(process.env, "TZ");
    } else {
      process.env.TZ = previous;
    }
  });

  describe("marketState (TC-COMP-132)", () => {
    it.each(TABLE)("%s is %s", (instant, expected) => {
      expect(marketState(new Date(instant))).toBe(expected);
    });

    it("is closed at 08:29:59 and not determinable at 14:59:59, closed at 15:00:00", () => {
      expect(marketState(new Date("2026-10-15T13:29:59Z"))).toBe("closed");
      expect(marketState(new Date("2026-10-15T19:59:59Z"))).toBe("not_determinable");
      expect(marketState(new Date("2026-10-15T20:00:00Z"))).toBe("closed");
    });
  });

  describe("chicagoWallClock (DAC-E5-6)", () => {
    it("reads the Chicago weekday, date and minutes of the evening", () => {
      expect(chicagoWallClock(new Date("2026-10-16T01:00:00Z"))).toEqual({
        weekday: "Thursday",
        date: "2026-10-15",
        minutes: 1200,
      });
    });

    it("pads the month and day to two digits on the DST-change dates", () => {
      expect(chicagoWallClock(new Date("2026-03-08T18:00:00Z")).date).toBe("2026-03-08");
      expect(chicagoWallClock(new Date("2026-11-01T18:00:00Z")).date).toBe("2026-11-01");
      expect(chicagoWallClock(new Date("2026-03-08T18:00:00Z")).weekday).toBe("Sunday");
    });

    it("reads midnight as 0, never 1440", () => {
      expect(chicagoWallClock(new Date("2026-10-16T05:00:00Z"))).toEqual({
        weekday: "Friday",
        date: "2026-10-16",
        minutes: 0,
      });
    });
  });
});
