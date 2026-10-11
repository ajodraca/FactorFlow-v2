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
  rosterExpander,
  startRun,
  stateHistoryDepth,
  summaryOutcome,
  waitForRunState,
} from "./support/acquisition";

/**
 * Instruments added or retired after the first acquisition (TC-E2E-009,
 * TC-E2E-010; AC-21, AC-22, AC-25), against the acquisition stack's real
 * API, ingestion runner and PostgreSQL with the stub provider
 * (CAP-001-e2e-tests-automation-tasks T012).
 */
test.use({ baseURL: ACQUISITION_BASE_URL });
test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  await resetAcquisitionStore();
});

test.afterEach(async () => {
  // A held symbol must never outlive its test, or the runner stays blocked.
  await resetStub();
});

const PRESENCE_COLUMNS = [
  COVERAGE_COLUMN.reference,
  COVERAGE_COLUMN.prices,
  COVERAGE_COLUMN.fundamentals,
  COVERAGE_COLUMN.corporateActions,
];

test("TC-E2E-009: an instrument added after the first acquisition is acquired to the stated depth without disturbing the others", async ({
  page,
}) => {
  test.setTimeout(60_000);

  await stateHistoryDepth(page, 1);
  await addInstruments(page, ["ICA"]);
  await startRun(page);
  await expect(summaryOutcome(page)).toHaveText("Succeeded", { timeout: 20_000 });

  await page.goto("/coverage");
  const icaFrom = await coverageCell(page, "ICA", COVERAGE_COLUMN.coveredFrom).innerText();
  expect(icaFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);

  await addInstruments(page, ["ICB"]);
  await startRun(page);
  await expect(summaryOutcome(page)).toHaveText("Succeeded", { timeout: 20_000 });

  await page.goto("/coverage");
  for (const column of PRESENCE_COLUMNS) {
    await expect(coverageCell(page, "ICB", column).getByTestId("presence-badge")).toHaveAttribute(
      "data-variant",
      "coverage-present",
    );
  }
  // Same stated depth, same day: ICB reaches back as far as ICA did.
  await expect(coverageCell(page, "ICB", COVERAGE_COLUMN.coveredFrom)).toHaveText(icaFrom);
  await expect(coverageCell(page, "ICA", COVERAGE_COLUMN.coveredFrom)).toHaveText(icaFrom);
});

test("TC-E2E-010: an instrument retired mid-run stays visible, finishes the run it was named in, and is left out of the next", async ({
  page,
  request,
}) => {
  test.setTimeout(90_000);

  await stateHistoryDepth(page, 1);
  await addInstruments(page, ["ICA", "ICB", "ICC"]);
  await startRun(page);
  await expect(summaryOutcome(page)).toHaveText("Succeeded", { timeout: 20_000 });

  await holdSymbol("ICA");
  const secondRun = await startRun(page);
  await waitForRunState(request, secondRun, ["running"], 15_000);

  await page.goto("/instruments");
  const iccRow = page.getByRole("table").locator("tr", { hasText: "ICC" });
  await iccRow.getByRole("button", { name: "Stop acquiring ICC" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Stop acquiring" }).click();
  await expect(iccRow.getByTestId("lifecycle-badge")).toHaveText(/retired/i);

  await page.goto("/coverage");
  await expect(
    coverageCell(page, "ICC", COVERAGE_COLUMN.lifecycle).getByTestId("lifecycle-badge"),
  ).toHaveText(/retired/i);
  await expect(coverageCell(page, "ICC", COVERAGE_COLUMN.coveredFrom)).toHaveText(
    /^\d{4}-\d{2}-\d{2}$/,
  );

  await releaseSymbol("ICA");
  await waitForRunState(request, secondRun, ["succeeded"], 20_000);
  await page.goto(`/runs/${secondRun}`);
  await expect(summaryOutcome(page)).toHaveText("Succeeded");
  await expect(rosterExpander(page, "ICC")).toHaveCount(1);

  await page.goto("/coverage");
  const iccLastAcquired = await coverageCell(page, "ICC", COVERAGE_COLUMN.lastAcquired).innerText();

  await startRun(page);
  await expect(summaryOutcome(page)).toHaveText("Succeeded", { timeout: 20_000 });
  await expect(rosterExpander(page, "ICA")).toHaveCount(1);
  await expect(rosterExpander(page, "ICC")).toHaveCount(0);

  await page.goto("/coverage");
  await expect(coverageCell(page, "ICC", COVERAGE_COLUMN.lastAcquired)).toHaveText(iccLastAcquired);
});
