import { expect, test } from "@playwright/test";
import {
  ACQUISITION_BASE_URL,
  COVERAGE_COLUMN,
  addInstruments,
  coverageCell,
  resetAcquisitionStore,
  startRun,
  stateHistoryDepth,
  summaryOutcome,
} from "./support/acquisition";

/**
 * First acquisition succeeds (TC-E2E-001; AC-1, AC-2, AC-3, AC-7), through
 * the interface only, against the acquisition stack's real API, ingestion
 * runner and PostgreSQL with the stub provider (`scripts/run-e2e-server.sh`;
 * owner-web-app section 7 "First-run journey"; CAP-001-e2e-tests-automation-
 * tasks T008).
 */
test.use({ baseURL: ACQUISITION_BASE_URL });

test.beforeEach(async () => {
  await resetAcquisitionStore();
});

/**
 * Today in the host's calendar, as the runner sees it. The covered range ends
 * at the end of the range the run acquired, today, weekend or not (DEC-0049).
 */
function today(): string {
  const day = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
}

test("TC-E2E-001: a first acquisition succeeds and Coverage shows every data type with its range", async ({
  page,
}) => {
  await stateHistoryDepth(page, 1);
  await addInstruments(page, ["FRA", "FRB"]);
  await startRun(page);

  await expect(summaryOutcome(page)).toHaveText("Succeeded", { timeout: 20_000 });

  await page.goto("/coverage");
  for (const symbol of ["FRA", "FRB"]) {
    for (const column of [
      COVERAGE_COLUMN.reference,
      COVERAGE_COLUMN.prices,
      COVERAGE_COLUMN.fundamentals,
      COVERAGE_COLUMN.corporateActions,
    ]) {
      const badge = coverageCell(page, symbol, column).getByTestId("presence-badge");
      await expect(badge).toHaveAttribute("data-variant", "coverage-present");
    }
    await expect(coverageCell(page, symbol, COVERAGE_COLUMN.coveredFrom)).toHaveText(
      /^\d{4}-\d{2}-\d{2}$/,
    );
    await expect(coverageCell(page, symbol, COVERAGE_COLUMN.coveredTo)).toHaveText(today());
  }
});
