import type { CoverageRow } from "../../api/types";

/**
 * The shortfall every loaded covered instrument shares, or `null`
 * (DAC-E6-S4-6). A plan cap truncates every instrument to the same start
 * date, so it shows as one positive shortfall common to all of them;
 * coverage-service design section 3 says "the fix is a sentence on the
 * coverage screen naming the plan".
 *
 * Owner-confirmed rule (CAP-001-E6-S4-tasks Open Gap 3): two or more rows
 * with a covered range, all carrying the same `depthShortByYears` `n > 0`.
 * Rows with nothing covered are ignored. A single row cannot show
 * uniformity, and the loaded page is the only data the client holds.
 */
export function uniformShortfallYears(rows: CoverageRow[]): number | null {
  const covered = rows.filter((row) => row.coveredFrom !== null);
  if (covered.length < 2) {
    return null;
  }
  const first = covered[0]?.depthShortByYears ?? null;
  if (first === null || first <= 0) {
    return null;
  }
  return covered.every((row) => row.depthShortByYears === first) ? first : null;
}
