import { expect, test } from "@playwright/test";
import { ACQUISITION_BASE_URL, resetAcquisitionStore } from "./support/acquisition";

/**
 * Coverage reports no acquired data honestly (TC-E2E-004; AC-17), in a
 * browser against the acquisition stack's real API and PostgreSQL
 * (`scripts/run-e2e-server.sh`; CAP-001-e2e-tests-automation-tasks T007).
 * The store is emptied before the test, so no acquisition has completed.
 */
test.use({ baseURL: ACQUISITION_BASE_URL });

test.beforeEach(async () => {
  await resetAcquisitionStore();
});

test("TC-E2E-004: coverage says no data has been acquired instead of an empty table", async ({
  page,
}) => {
  await page.goto("/coverage");

  // NEVER_ACQUIRED and NO_MATCH, verbatim from web/src/screens/coverage/copy.ts.
  await expect(page.getByText("No data has been acquired yet.")).toBeVisible();
  await expect(page.getByRole("rowheader")).toHaveCount(0);
  await expect(page.getByText("No instrument matches this filter.")).toHaveCount(0);
});
