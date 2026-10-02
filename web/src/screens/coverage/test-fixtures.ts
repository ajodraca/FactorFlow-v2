import type { CoverageRow, CoverageView } from "../../api/types";

/**
 * Shared fixture builders for the Coverage screen's specs
 * (CAP-001-E6-S4-tasks T004). Exports no test cases.
 */

/** The wire code coverage-service 2.4 reports when gap detection cannot run. */
export const UNAVAILABLE_REASON = "fewer_than_two_instruments_with_data";

export function row(overrides: Partial<CoverageRow> = {}): CoverageRow {
  return {
    symbol: "AAPL",
    lifecycle: "active",
    dataTypes: {
      reference: "present",
      prices: "present",
      fundamentals: "present",
      corporate_actions: "present",
    },
    coveredFrom: "2024-01-02",
    coveredTo: "2024-01-05",
    lastAcquiredAt: "2026-09-05T22:14:03Z",
    gapCount: 0,
    depthShortByYears: null,
    ...overrides,
  };
}

export function view(overrides: Partial<CoverageView> = {}): CoverageView {
  return {
    rows: [row()],
    neverAcquired: false,
    gapDetection: { available: true, reason: null },
    nextCursor: null,
    ...overrides,
  };
}
