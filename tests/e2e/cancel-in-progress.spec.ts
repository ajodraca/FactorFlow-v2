import { expect, test } from "@playwright/test";
import {
  ACQUISITION_BASE_URL,
  COVERAGE_COLUMN,
  addInstruments,
  coverageCell,
  holdSymbol,
  releaseSymbol,
  resetAcquisitionStore,
  resetStub,
  startRun,
  stateHistoryDepth,
  summaryOutcome,
  waitForRunState,
} from "./support/acquisition";

/**
 * A run cancelled while in progress stops between instruments and keeps what
 * it wrote (TC-E2E-007; AC-19), against the acquisition stack's real API,
 * ingestion runner and PostgreSQL with the stub provider
 * (CAP-001-e2e-tests-automation-tasks T011). The runner works the roster in
 * symbol order and checks cancellation before each instrument (`runner.py`),
 * so holding CXB's requests keeps the run in progress after CXA is written.
 */
test.use({ baseURL: ACQUISITION_BASE_URL });

test.beforeEach(async () => {
  await resetAcquisitionStore();
});

test.afterEach(async () => {
  // A held symbol must never outlive its test, or the runner stays blocked.
  await resetStub();
});

test("TC-E2E-007: cancelling a run in progress ends it cancelled with earlier coverage kept and later instruments untouched", async ({
  page,
  request,
}) => {
  test.setTimeout(60_000);

  await stateHistoryDepth(page, 1);
  await addInstruments(page, ["CXA", "CXB", "CXC"]);
  await holdSymbol("CXB");
  const runId = await startRun(page);
  await waitForRunState(request, runId, ["running"], 15_000);
  await expect(summaryOutcome(page)).toHaveText("Running", { timeout: 15_000 });

  await page.getByRole("button", { name: "Cancel run" }).click();
  await page.getByRole("button", { name: "Stop run" }).click();
  await expect(summaryOutcome(page)).toHaveText("Cancelling");

  await releaseSymbol("CXB");
  await expect(summaryOutcome(page)).toHaveText("Cancelled", { timeout: 20_000 });

  await page.goto("/coverage");
  await expect(
    coverageCell(page, "CXA", COVERAGE_COLUMN.prices).getByTestId("presence-badge"),
  ).toHaveAttribute("data-variant", "coverage-present");
  await expect(coverageCell(page, "CXA", COVERAGE_COLUMN.coveredFrom)).toHaveText(
    /^\d{4}-\d{2}-\d{2}$/,
  );
  for (const column of [
    COVERAGE_COLUMN.reference,
    COVERAGE_COLUMN.prices,
    COVERAGE_COLUMN.fundamentals,
    COVERAGE_COLUMN.corporateActions,
  ]) {
    await expect(
      coverageCell(page, "CXC", column).getByTestId("presence-badge"),
    ).not.toHaveAttribute("data-variant", "coverage-present");
  }
  await expect(coverageCell(page, "CXC", COVERAGE_COLUMN.coveredFrom)).not.toHaveText(
    /\d{4}-\d{2}-\d{2}/,
  );
});
