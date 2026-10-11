import { expect, test } from "@playwright/test";
import {
  ACQUISITION_BASE_URL,
  COVERAGE_COLUMN,
  addInstruments,
  coverageCell,
  expandInstrument,
  resetAcquisitionStore,
  startRun,
  stateHistoryDepth,
  summaryOutcome,
} from "./support/acquisition";

/**
 * An instrument the provider does not recognise does not stop the run
 * (TC-E2E-006; AC-11), against the acquisition stack's real API, ingestion
 * runner and PostgreSQL with the stub provider, which answers 404 for any
 * symbol starting UNK (CAP-001-e2e-tests-automation-tasks T010).
 */
test.use({ baseURL: ACQUISITION_BASE_URL });

test.beforeEach(async () => {
  await resetAcquisitionStore();
});

test("TC-E2E-006: an unrecognised instrument is reported not found and the recognised one is still acquired", async ({
  page,
}) => {
  await stateHistoryDepth(page, 1);
  await addInstruments(page, ["UNKQ", "UQA"]);
  await startRun(page);

  await expect(summaryOutcome(page)).toHaveText("Partial", { timeout: 20_000 });
  await expect(summaryOutcome(page)).not.toHaveText("Failed");

  const unknown = await expandInstrument(page, "UNKQ");
  const reference = unknown.locator("tr", {
    has: page.getByRole("rowheader", { name: "Reference", exact: true }),
  });
  await expect(reference.getByTestId("result-outcome-badge")).toHaveText("Not found");
  await expect(
    unknown.getByText(/^Acquiring reference for UNKQ: not found at the provider\. /),
  ).toBeVisible();
  await expect(unknown).toContainText("req_notfound_001");

  await page.goto("/coverage");
  for (const column of [
    COVERAGE_COLUMN.reference,
    COVERAGE_COLUMN.prices,
    COVERAGE_COLUMN.fundamentals,
    COVERAGE_COLUMN.corporateActions,
  ]) {
    await expect(coverageCell(page, "UQA", column).getByTestId("presence-badge")).toHaveAttribute(
      "data-variant",
      "coverage-present",
    );
  }
});
